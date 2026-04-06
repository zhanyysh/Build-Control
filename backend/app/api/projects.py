from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from app.db.database import get_session
from app.models.models import Project, ProjectBase, ProjectCreate, User, UserRole
from app.api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=Project)
def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only administrators can create projects")
    
    db_project = Project(
        name=project.name,
        address=project.address,
        start_date=project.start_date,
        end_date=project.end_date,
        description=project.description,
        company_id=current_user.company_id
    )
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project

@router.get("/", response_model=List[Project])
def read_projects(company_id: Optional[int] = None, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role == UserRole.SYSTEM_ADMIN:
        statement = select(Project)
        if company_id:
            statement = statement.where(Project.company_id == company_id)
        projects = session.exec(statement).all()
        return projects
        
    projects = session.exec(select(Project).where(Project.company_id == current_user.company_id)).all()
    return projects

@router.get("/{project_id}", response_model=Project)
def read_project(project_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role != UserRole.SYSTEM_ADMIN and project.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=403, detail="Only administrators can delete projects")
        
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role != UserRole.SYSTEM_ADMIN and project.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Project not found")
        
    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}
