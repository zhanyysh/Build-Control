from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.models import User, UserBase, UserRole
from app.api.deps import get_current_user
from app.core.auth import get_password_hash
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(UserBase):
    password: str

@router.post("/", response_model=User)
def create_user(
    user_in: UserCreate, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    # Only admins can create users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only administrators can create users")
    
    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password)
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.get("/", response_model=List[User])
def read_users(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Not authorized to view user list")
    
    users = session.exec(select(User)).all()
    return users

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only administrators can delete users")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Administrators cannot delete themselves")
        
    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}
