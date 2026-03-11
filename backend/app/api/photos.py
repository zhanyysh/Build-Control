import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session
from datetime import datetime
from app.db.database import get_session
from app.models.models import PhotoReport, Task, User, UserRole
from app.api.deps import get_current_user

router = APIRouter(prefix="/photos", tags=["photos"])

# Directory for storing uploaded photos
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload", response_model=PhotoReport)
async def upload_photo(
    task_id: int = Form(...),
    comment: str = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Verify task exists
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Authorization check
    if current_user.role == UserRole.WORKER and task.worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload photos for this task")
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Create record
    photo_report = PhotoReport(
        task_id=task_id,
        comment=comment,
        file_path=file_path,
        upload_date=datetime.utcnow()
    )
    
    session.add(photo_report)
    session.commit()
    session.refresh(photo_report)
    
    return photo_report
