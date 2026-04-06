from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.models.models import Company, CompanyBase, User, UserRole
from app.api.deps import get_current_user

router = APIRouter(prefix="/companies", tags=["companies"])

@router.post("/", response_model=Company)
def create_company(
    company_in: CompanyBase, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    # Only System Admins can create companies
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Only System Administrators can create companies")
    
    db_company = Company(name=company_in.name)
    session.add(db_company)
    session.commit()
    session.refresh(db_company)
    return db_company

@router.get("/", response_model=List[Company])
def read_companies(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view companies list")
    
    companies = session.exec(select(Company)).all()
    return companies

@router.delete("/{company_id}")
def delete_company(
    company_id: int, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Only System Administrators can delete companies")
        
    company = session.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Optional: Prevent deleting company if they have active users or projects
    # A true system might soft delete or re-assign. We'll simply hard delete here for now.
    
    session.delete(company)
    session.commit()
    return {"message": "Company deleted successfully"}

@router.patch("/{company_id}", response_model=Company)
def update_company(
    company_id: int,
    company_in: CompanyBase, 
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(status_code=403, detail="Only System Administrators can edit companies")
        
    company = session.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    company.name = company_in.name
    session.add(company)
    session.commit()
    session.refresh(company)
    
    return company
