from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, AcademicRecord, Enrollment, Course, Notification
from app.schemas import UserResponse, AcademicRecordResponse, EnrollmentResponse, CourseResponse, NotificationResponse
from app.auth.jwt import get_current_active_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """Obtiene el perfil del usuario actual."""
    return current_user

@router.get("/academic-record", response_model=AcademicRecordResponse)
def get_academic_record(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Obtiene el registro académico del usuario actual."""
    academic_record = db.query(AcademicRecord).filter(AcademicRecord.user_id == current_user.id).first()
    if not academic_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro académico no encontrado"
        )
    return academic_record

@router.get("/courses", response_model=List[EnrollmentResponse])
def get_user_courses(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Obtiene los cursos matriculados por el usuario actual."""
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    return enrollments

@router.get("/notifications", response_model=List[NotificationResponse])
def get_user_notifications(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Obtiene las notificaciones del usuario actual."""
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications

@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Marca una notificación como leída."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notificación no encontrada"
        )
    
    notification.read = True
    db.commit()
    return {"message": "Notificación marcada como leída"}

