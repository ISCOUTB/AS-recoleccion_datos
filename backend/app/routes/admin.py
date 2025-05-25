from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Dict, Any
from datetime import datetime, timedelta
import json
import os
import shutil
from uuid import uuid4
from app.database import get_db
from app.models.models import User, UserRole
from app.models.student_data import StudentData
from app.schemas import AdminDashboardStats, StudentStatsResponse
from app.auth.jwt import get_current_active_user
from app.utils.excel_loader import load_excel_to_database

router = APIRouter()

# Gestión de conexiones WebSocket para actualizaciones en tiempo real
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remover conexiones cerradas
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.post("/upload-excel")
async def upload_excel_data(
    file: UploadFile = File(...),
    sheet_name: str = "202430",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Carga datos desde un archivo Excel a la base de datos."""
    # Verificar permisos de administrador
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden cargar datos"
        )
    
# Safe: ext is validated and temp_filename is not user-controlled
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.xlsx', '.xls'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos Excel (.xlsx, .xls)"
        )

    try:
        # Crear directorio temporal si no existe
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Guardar archivo temporalmente con nombre seguro
        temp_filename = f"{uuid4()}{ext}"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"Archivo guardado temporalmente en: {temp_path}")
        print(f"Intentando leer hoja: {sheet_name}")
        
        # Cargar datos a la base de datos
        result = load_excel_to_database(temp_path, db, sheet_name)
        
        # Limpiar archivo temporal
        os.remove(temp_path)
        
        # Notificar actualización en tiempo real
        await notify_admin_update(f"Datos de Excel cargados: {result['successful_inserts']} registros")
        
        return {
            "message": "Datos cargados exitosamente",
            "statistics": result,
            "sheet_used": sheet_name
        }
        
    except ValueError as e:
        # Error específico de hoja no encontrada
        if "Worksheet" in str(e) or "hoja" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La hoja '{sheet_name}' no existe en el archivo. Verifique el nombre de la hoja."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error procesando el archivo: {str(e)}"
            )
    except Exception as e:
        # Limpiar archivo temporal en caso de error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno procesando el archivo: {str(e)}"
        )

@router.get("/excel-sheets")
async def get_excel_sheets(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Obtiene la lista de hojas disponibles en un archivo Excel."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden acceder a esta función"
        )
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos Excel (.xlsx, .xls)"
        )
    
    try:
        import pandas as pd
        
        # Crear directorio temporal
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Guardar archivo temporalmente
        temp_filename = f"{uuid4()}_{file.filename}"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Obtener lista de hojas
        excel_file = pd.ExcelFile(temp_path)
        sheets = excel_file.sheet_names
        
        # Limpiar archivo temporal
        os.remove(temp_path)
        
        return {
            "sheets": sheets,
            "total_sheets": len(sheets),
            "recommended_sheet": "202430" if "202430" in sheets else sheets[0] if sheets else None
        }
        
    except Exception as e:
        # Limpiar archivo temporal en caso de error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error leyendo el archivo Excel: {str(e)}"
        )

@router.websocket("/ws/admin-dashboard")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        while True:
            # Enviar estadísticas actualizadas cada 30 segundos
            stats = get_dashboard_stats_data(db)
            await websocket.send_text(json.dumps(stats, default=str))
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

def get_dashboard_stats_data(db: Session) -> Dict[str, Any]:
    """Obtiene las estadísticas del dashboard en tiempo real."""
    # Estadísticas básicas
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    active_students = db.query(User).filter(
        and_(User.role == UserRole.STUDENT, User.is_active == True)
    ).count()
    validated_students = db.query(User).filter(
        and_(User.role == UserRole.STUDENT, User.data_validated == True)
    ).count()
    pending_validation = total_students - validated_students
    
    # Promedio de PGA
    avg_gpa_result = db.query(func.avg(StudentData.pga_acumulado)).filter(
        StudentData.pga_acumulado.isnot(None)
    ).scalar()
    average_gpa = round(avg_gpa_result, 2) if avg_gpa_result else 0.0
    
    # Promedio de ICFES (matemáticas como ejemplo)
    avg_icfes_result = db.query(func.avg(StudentData.ptj_matematicas)).filter(
        StudentData.ptj_matematicas.isnot(None)
    ).scalar()
    average_icfes = round(avg_icfes_result, 2) if avg_icfes_result else 0.0
    
    # Estudiantes por programa
    students_by_program = {}
    program_stats = db.query(
        StudentData.programa, func.count(User.id)
    ).join(User, User.student_data_id == StudentData.id).filter(
        StudentData.programa.isnot(None)
    ).group_by(StudentData.programa).all()
    
    for programa, count in program_stats:
        students_by_program[programa] = count
    
    # Estudiantes por situación académica
    students_by_situation = {}
    situation_stats = db.query(
        StudentData.situacion, func.count(User.id)
    ).join(User, User.student_data_id == StudentData.id).filter(
        StudentData.situacion.isnot(None)
    ).group_by(StudentData.situacion).all()
    
    for situacion, count in situation_stats:
        students_by_situation[situacion] = count
    
    # Estudiantes por estrato
    students_by_stratum = {}
    stratum_stats = db.query(
        StudentData.estrato, func.count(User.id)
    ).join(User, User.student_data_id == StudentData.id).filter(
        StudentData.estrato.isnot(None)
    ).group_by(StudentData.estrato).all()
    
    for estrato, count in stratum_stats:
        students_by_stratum[f"Estrato {estrato}"] = count
    
    # Registros recientes (últimos 7 días)
    week_ago = datetime.now() - timedelta(days=7)
    recent_registrations = db.query(User).filter(
        and_(
            User.role == UserRole.STUDENT,
            User.created_at >= week_ago
        )
    ).count()
    
    # Estudiantes en riesgo de deserción (ejemplo: PGA < 3.0)
    dropout_risk_students = db.query(User).join(
        StudentData, User.student_data_id == StudentData.id
    ).filter(
        and_(
            User.role == UserRole.STUDENT,
            StudentData.pga_acumulado < 3.0
        )
    ).count()
    
    return {
        "total_students": total_students,
        "active_students": active_students,
        "validated_students": validated_students,
        "pending_validation": pending_validation,
        "average_gpa": average_gpa,
        "average_icfes": average_icfes,
        "students_by_program": students_by_program,
        "students_by_situation": students_by_situation,
        "students_by_stratum": students_by_stratum,
        "recent_registrations": recent_registrations,
        "dropout_risk_students": dropout_risk_students,
        "last_updated": datetime.now().isoformat()
    }

@router.get("/dashboard/stats", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene estadísticas para el dashboard de administración."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    return get_dashboard_stats_data(db)

@router.get("/students", response_model=List[StudentStatsResponse])
def get_students_list(
    skip: int = 0,
    limit: int = 100,
    program: str = None,
    situation: str = None,
    validated: bool = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene lista de estudiantes con filtros."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    query = db.query(User).filter(User.role == UserRole.STUDENT)
    
    # Aplicar filtros
    if program:
        query = query.join(StudentData, User.student_data_id == StudentData.id).filter(
            StudentData.programa == program
        )
    
    if situation:
        query = query.join(StudentData, User.student_data_id == StudentData.id).filter(
            StudentData.situacion == situation
        )
    
    if validated is not None:
        query = query.filter(User.data_validated == validated)
    
    students = query.offset(skip).limit(limit).all()
    
    # Convertir a formato de respuesta
    result = []
    for student in students:
        student_data = {
            "id": student.id,
            "full_name": student.full_name,
            "student_id": student.student_id,
            "program": student.student_data.programa if student.student_data else None,
            "situacion": student.student_data.situacion if student.student_data else None,
            "pga_acumulado": student.student_data.pga_acumulado if student.student_data else None,
            "estrato": student.student_data.estrato if student.student_data else None,
            "data_validated": student.data_validated,
            "created_at": student.created_at,
            "last_login": student.last_login
        }
        result.append(student_data)
    
    return result

@router.get("/analytics/gpa-trends")
def get_gpa_trends(
    period_start: str = None,
    period_end: str = None,
    program: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene tendencias de PGA para gráficas dinámicas."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    query = db.query(
        StudentData.programa,
        func.avg(StudentData.pga_acumulado).label('avg_gpa'),
        func.count(StudentData.id).label('student_count')
    ).filter(StudentData.pga_acumulado.isnot(None))
    
    if program:
        query = query.filter(StudentData.programa == program)
    
    results = query.group_by(StudentData.programa).all()
    
    return [
        {
            "programa": result.programa,
            "promedio_pga": round(result.avg_gpa, 2),
            "cantidad_estudiantes": result.student_count
        }
        for result in results
    ]

@router.get("/analytics/icfes-distribution")
def get_icfes_distribution(
    subject: str = "matematicas",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene distribución de puntajes ICFES por materia."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    # Mapear materias a columnas
    subject_columns = {
        "matematicas": StudentData.ptj_matematicas,
        "lectura_critica": StudentData.ptj_lectura_critica,
        "ingles": StudentData.ptj_ingles,
        "ciencias_naturales": StudentData.ptj_ciencias_naturales,
        "sociales": StudentData.ptj_ciencias_sociales
    }
    
    if subject not in subject_columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Materia no válida"
        )
    
    column = subject_columns[subject]
    
    # Obtener distribución por rangos
    ranges = [
        (0, 40, "Bajo"),
        (40, 60, "Medio"),
        (60, 80, "Alto"),
        (80, 100, "Superior")
    ]
    
    distribution = []
    for min_score, max_score, label in ranges:
        count = db.query(StudentData).filter(
            and_(
                column >= min_score,
                column < max_score,
                column.isnot(None)
            )
        ).count()
        
        distribution.append({
            "rango": label,
            "min_puntaje": min_score,
            "max_puntaje": max_score,
            "cantidad": count
        })
    
    return distribution

# Función para notificar actualizaciones en tiempo real
async def notify_admin_update(message: str):
    """Notifica a todos los administradores conectados sobre actualizaciones."""
    await manager.broadcast(json.dumps({
        "type": "update",
        "message": message,
        "timestamp": datetime.now().isoformat()
    }))

# Importar asyncio para el WebSocket
import asyncio
