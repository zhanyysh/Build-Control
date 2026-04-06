from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional

from app.db.database import get_session
from app.models.models import User, UserBase, UserRole, UserCreate, UserRead, Company
from app.api.deps import get_current_user
from app.core.auth import get_password_hash
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserRead)
def create_user(
    user_in: UserCreate, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    # System Admins can create ADMINs (or any user) for any given company id
    # Regular ADMINs can create FOREMANs or WORKERs for their own company ONLY
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only administrators can create users")
    
    # Determine the target company_id
    if current_user.role == UserRole.SYSTEM_ADMIN:
        if not user_in.company_id:
            raise HTTPException(status_code=400, detail="System Admin must specify a company_id for the new user")
        # Ensure company exists
        company = session.get(Company, user_in.company_id)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        target_company_id = user_in.company_id
    else:
        # Regular ADMIN is creating a user: lock it to the Admin's company
        target_company_id = current_user.company_id
        
        # Prevent an ADMIN from creating another SYSTEM_ADMIN
        if user_in.role == UserRole.SYSTEM_ADMIN:
            raise HTTPException(status_code=403, detail="Cannot create System Administrator level users")

    # Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    db_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        company_id=target_company_id,
        hashed_password=get_password_hash(user_in.password)
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.get("/", response_model=List[UserRead])
def read_users(
    company_id: Optional[int] = None,
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role == UserRole.SYSTEM_ADMIN:
        # System admin sees everyone or can filter by company
        if company_id:
            users = session.exec(select(User).where(User.company_id == company_id)).all()
        else:
            users = session.exec(select(User)).all()
    elif current_user.role in [UserRole.ADMIN, UserRole.FOREMAN, UserRole.WORKER]:
        # Regular users (including workers) see their company directory
        users = session.exec(select(User).where(User.company_id == current_user.company_id)).all()
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view user list")
        
    return users

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SYSTEM_ADMIN]:
        raise HTTPException(status_code=403, detail="Only administrators can delete users")
    
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role != UserRole.SYSTEM_ADMIN and user.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="User not found in your company")
    
    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Administrators cannot delete themselves")
        
    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}
