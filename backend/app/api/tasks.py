from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from app.db.database import get_session
from app.models.models import Task, TaskBase, User, UserRole, TaskStatus
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=Task)
def create_task(task: TaskBase, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Only administrators and foremen can create tasks")
    db_task = Task.from_orm(task)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/", response_model=List[Task])
def read_tasks(project_id: Optional[int] = None, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Task)
    if project_id:
        statement = statement.where(Task.project_id == project_id)
    if current_user.role == UserRole.WORKER:
        statement = statement.where(Task.worker_id == current_user.id)
    tasks = session.exec(statement).all()
    return tasks

@router.get("/{task_id}", response_model=Task)
def read_task(task_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    # Workers can only see their assigned tasks
    if current_user.role == UserRole.WORKER and task.worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this task")
    return task

@router.patch("/{task_id}", response_model=Task)
def update_task_status(task_id: int, status: TaskStatus, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Authorized roles for status update
    if current_user.role == UserRole.WORKER:
        if task.worker_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
    elif current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    task.status = status
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role not in [UserRole.ADMIN, UserRole.FOREMAN]:
        raise HTTPException(status_code=403, detail="Only administrators and foremen can delete tasks")
    
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    session.delete(task)
    session.commit()
    return {"message": "Task deleted successfully"}
