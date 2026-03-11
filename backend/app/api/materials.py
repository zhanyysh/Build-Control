from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from app.db.database import get_session
from app.models.models import Material, MaterialBase, User, UserRole
from app.api.deps import get_current_user

router = APIRouter(prefix="/materials", tags=["materials"])

@router.post("/", response_model=Material)
def add_material(material: MaterialBase, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Only administrators and foremen can manage materials")
    db_material = Material.from_orm(material)
    session.add(db_material)
    session.commit()
    session.refresh(db_material)
    return db_material

@router.get("/", response_model=List[Material])
def read_materials(project_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Material).where(Material.project_id == project_id)
    materials = session.exec(statement).all()
    return materials

@router.patch("/{material_id}", response_model=Material)
def update_material_quantity(material_id: int, quantity: float, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Only administrators and foremen can manage materials")
    
    material = session.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    material.quantity = quantity
    session.add(material)
    session.commit()
    session.refresh(material)
    return material

@router.post("/{material_id}/deduct", response_model=Material)
def deduct_material(material_id: int, amount: float, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Only administrators and foremen can deduct materials")
    
    material = session.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    if material.quantity < amount:
        raise HTTPException(status_code=400, detail="Insufficient material quantity")
        
    material.quantity -= amount
    session.add(material)
    session.commit()
    session.refresh(material)
    return material
