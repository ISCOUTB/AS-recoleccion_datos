from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.models import User, AcademicRecord, Enrollment, Course, Notification, UserRole
from app.schemas import UserResponse, AcademicRecordResponse, EnrollmentResponse, CourseResponse, NotificationResponse, DashboardStats
from app.auth.jwt import get_current_active_user
from app.utils.serialization import sqlalchemy_to_dict

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

@router.get("/admin/stats", response_model=DashboardStats)
def get_admin_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene estadísticas para el panel de administración."""
    # Verificar si el usuario es administrador
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    # Contar usuarios activos
    active_users_count = db.query(User).filter(User.is_active == True).count()
    
    # Contar cursos disponibles
    courses_count = db.query(Course).count()
    
    # Calcular tasa de participación (ejemplo)
    # En un caso real, esto podría ser más complejo
    participation_rate = 89.5  # Valor de ejemplo
    
    # Uptime del sistema (ejemplo)
    uptime = 99.8  # Valor de ejemplo
    
    # Crear un diccionario con los datos
    stats_dict = {
        "users": active_users_count,
        "courses": courses_count,
        "participationRate": participation_rate,
        "uptime": uptime
    }
    
    return stats_dict
