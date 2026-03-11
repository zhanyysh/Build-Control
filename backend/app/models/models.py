from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship

class UserRole(str, Enum):
    ADMIN = "Administrator"
    FOREMAN = "Foreman"
    WORKER = "Worker"

class TaskStatus(str, Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: str
    role: UserRole

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str

    # Relationships
    assigned_tasks: List["Task"] = Relationship(back_populates="worker")

class ProjectBase(SQLModel):
    name: str
    address: str
    start_date: date
    end_date: date
    description: Optional[str] = None

class Project(ProjectBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    tasks: List["Task"] = Relationship(back_populates="project")
    materials: List["Material"] = Relationship(back_populates="project")

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    deadline: date
    status: TaskStatus = Field(default=TaskStatus.PLANNED)
    project_id: int = Field(foreign_key="project.id")
    worker_id: Optional[int] = Field(default=None, foreign_key="user.id")

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    project: Project = Relationship(back_populates="tasks")
    worker: Optional[User] = Relationship(back_populates="assigned_tasks")
    photos: List["PhotoReport"] = Relationship(back_populates="task")

class MaterialBase(SQLModel):
    name: str
    quantity: float
    unit: str
    project_id: int = Field(foreign_key="project.id")

class Material(MaterialBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    project: Project = Relationship(back_populates="materials")

class PhotoReportBase(SQLModel):
    comment: Optional[str] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_path: str
    task_id: int = Field(foreign_key="task.id")

class PhotoReport(PhotoReportBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    task: Task = Relationship(back_populates="photos")
