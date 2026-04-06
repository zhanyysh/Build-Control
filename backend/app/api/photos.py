import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.db.database import get_session
from app.models.models import PhotoReport, Task, User, UserRole, Project
from app.api.deps import get_current_user
from pillow_heif import register_heif_opener

# Register HEIF opener for Pillow to support iPhone photos
register_heif_opener()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

router = APIRouter(prefix="/photos", tags=["photos"])

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
        
    project = session.get(Project, task.project_id)
    if current_user.role != UserRole.SYSTEM_ADMIN:
        if not project or project.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="Task not found")

    # Authorization check
    if current_user.role == UserRole.WORKER and task.worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload photos for this task")
    
    try:
        # Upload directly to Cloudinary
        # We don't need to process the image with Pillow ourselves; 
        # Cloudinary handles conversion and optimization.
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="buildcontrol_kr",
            resource_type="image"
        )
        
        # Get the secure URL from Cloudinary
        file_url = upload_result.get("secure_url")
        
        photo_report = PhotoReport(
            task_id=task_id,
            comment=comment,
            file_path=file_url,  # Store the full Cloudinary URL
            upload_date=datetime.utcnow()
        )
        
        session.add(photo_report)
        session.commit()
        session.refresh(photo_report)
        
        return photo_report
        
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")

@router.get("/{task_id}", response_model=List[PhotoReport])
def read_task_photos(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = session.get(Project, task.project_id)
    if current_user.role != UserRole.SYSTEM_ADMIN:
        if not project or project.company_id != current_user.company_id:
            raise HTTPException(status_code=404, detail="Task not found")

    photos = session.exec(select(PhotoReport).where(PhotoReport.task_id == task_id)).all()
    return photos
