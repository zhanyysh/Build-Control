import os
import uuid
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List
from datetime import datetime
from app.db.database import get_session
from app.models.models import PhotoReport, Task, User, UserRole
from app.api.deps import get_current_user
from PIL import Image
from pillow_heif import register_heif_opener

# Register HEIF opener for Pillow to support iPhone photos
register_heif_opener()

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
    
    try:
        # Read file content
        content = await file.read()
        
        # Open image with Pillow
        image = Image.open(io.BytesIO(content))
        
        # Define filename (always convert to .jpg for browser compatibility)
        unique_filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Convert to RGB (required for saving as JPEG if source is RGBA or other)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
            
        # Save as optimized JPEG
        image.save(file_path, "JPEG", quality=85, optimize=True)

        # Create record (store relative path for frontend serving)
        db_file_path = f"uploads/{unique_filename}"
        
        photo_report = PhotoReport(
            task_id=task_id,
            comment=comment,
            file_path=db_file_path,
            upload_date=datetime.utcnow()
        )
        
        session.add(photo_report)
        session.commit()
        session.refresh(photo_report)
        
        return photo_report
        
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image format or processing error: {str(e)}")

@router.get("/{task_id}", response_model=List[PhotoReport])
def read_task_photos(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    photos = session.exec(select(PhotoReport).where(PhotoReport.task_id == task_id)).all()
    return photos
