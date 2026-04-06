from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select, func
from datetime import timedelta
from typing import List
import os

from app.db.database import create_db_and_tables, get_session, engine
from app.models.models import User, UserRole, UserBase, UserRead, Project, Task, TaskStatus, Company
from app.core.auth import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

# Import routers
from app.api import projects, tasks, materials, photos, users, companies

app = FastAPI(title="BuildControl KR API", version="0.1.0")

# CORS Configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(materials.router)
app.include_router(photos.router)
app.include_router(users.router)
app.include_router(companies.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    from app.models.models import Company
    # Create an initial admin user and company if not exists
    with Session(engine) as session:
        statement = select(Company).where(Company.name == "System Architecture Company")
        company = session.exec(statement).first()
        if not company:
            company = Company(name="System Architecture Company")
            session.add(company)
            session.commit()
            session.refresh(company)

        statement = select(User).where(User.email == "admin@example.com")
        admin = session.exec(statement).first()
        if not admin:
            hashed_pw = get_password_hash("admin123")
            admin_user = User(
                email="admin@example.com",
                full_name="System Owner",
                role=UserRole.SYSTEM_ADMIN,
                company_id=company.id,
                hashed_password=hashed_pw
            )
            session.add(admin_user)
            session.commit()


@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/users/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role == UserRole.SYSTEM_ADMIN:
        company_count = session.exec(select(func.count(Company.id))).one()
        user_count = session.exec(select(func.count(User.id))).one()
        project_count = session.exec(select(func.count(Project.id))).one()
        return {
            "company_count": company_count,
            "user_count": user_count,
            "project_count": project_count
        }

    statement_projects = select(func.count(Project.id)).where(Project.company_id == current_user.company_id)
    project_count = session.exec(statement_projects).one()
    
    statement_tasks = select(func.count(Task.id)).join(Project).where(Project.company_id == current_user.company_id)
    task_count = session.exec(statement_tasks).one()
    
    statement_completed = select(func.count(Task.id)).join(Project).where(Project.company_id == current_user.company_id).where(Task.status == TaskStatus.COMPLETED)
    completed_tasks = session.exec(statement_completed).one()
    
    return {
        "project_count": project_count,
        "task_count": task_count,
        "completed_tasks": completed_tasks,
        "completion_percentage": (completed_tasks / task_count * 100) if task_count > 0 else 0
    }

@app.get("/")
async def root():
    return {"message": "Welcome to BuildControl KR API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
