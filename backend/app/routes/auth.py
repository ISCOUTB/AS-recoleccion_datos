from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.database import get_db
from app.models.models import User, UserRole
from app.models.student_data import StudentData
from app.schemas import (
    UserRegister, UserLogin, Token, StudentDataResponse, 
    StudentDataValidation, UserResponse
)
from app.auth.password import verify_password, get_password_hash
from app.auth.jwt import create_access_token, get_current_active_user
from app.config import settings

router = APIRouter()

@router.post("/register/check-student", status_code=status.HTTP_200_OK)
def check_student_id(student_data: dict, db: Session = Depends(get_db)):
    """Verifica si el ID del estudiante existe en la base de datos."""
    student_id = student_data.get("student_id")
    
    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de estudiante requerido"
        )
    
    # Buscar en la tabla de datos de estudiantes
    student_record = db.query(StudentData).filter(
        StudentData.id == student_id
    ).first()
    
    if not student_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Su código de estudiante no se encuentra dentro de nuestra base de datos. Verifique o comuníquese con soporte."
        )
    
    # Verificar si ya existe un usuario registrado con este ID
    existing_user = db.query(User).filter(User.student_id == student_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con este ID de estudiante"
        )
    
    return {
        "message": "ID de estudiante válido",
        "student_data": {
            "programa": student_record.programa,
            "estrato": student_record.estrato,
            "sexo": student_record.sexo,
            "estado_civil": student_record.estado_civil,
            "fecha_nacimiento": student_record.fecha_nacimiento,
            "ptj_matematicas": student_record.ptj_matematicas,
            "ptj_lectura_critica": student_record.ptj_lectura_critica,
            "ptj_ingles": student_record.ptj_ingles
        }
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Registra un nuevo usuario después de validar el ID del estudiante."""
    # Verificar si el correo ya existe
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )
    
    # Verificar si el ID de estudiante ya está registrado
    existing_user = db.query(User).filter(User.student_id == user_data.student_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El ID de estudiante ya está registrado"
        )
    
    # Buscar los datos del estudiante en la tabla base
    student_record = db.query(StudentData).filter(
        StudentData.id == user_data.student_id
    ).first()
    
    if not student_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ID de estudiante no válido"
        )
    
    # Crear nuevo usuario
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        student_id=user_data.student_id,
        student_data_id=student_record.id,
        program=student_record.programa,
        role=UserRole.STUDENT,
        is_admin=False,
        data_validated=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/validate-data", status_code=status.HTTP_200_OK)
def validate_student_data(
    validation: StudentDataValidation,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Valida y actualiza los datos del estudiante."""
    if current_user.data_validated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Los datos ya han sido validados"
        )
    
    if not current_user.student_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron datos del estudiante"
        )
    
    # Actualizar los datos validados
    student_data = current_user.student_data
    validation_data = validation.validation_data
    
    if validation_data.estrato is not None:
        student_data.estrato = validation_data.estrato
    if validation_data.fecha_nacimiento is not None:
        student_data.fecha_nacimiento = validation_data.fecha_nacimiento
    if validation_data.sexo is not None:
        student_data.sexo = validation_data.sexo
    if validation_data.estado_civil is not None:
        student_data.estado_civil = validation_data.estado_civil
    if validation_data.telefono1 is not None:
        student_data.telefono1 = validation_data.telefono1
    if validation_data.ciudad1 is not None:
        student_data.ciudad1 = validation_data.ciudad1
    if validation_data.ptj_matematicas is not None:
        student_data.ptj_matematicas = validation_data.ptj_matematicas
    if validation_data.ptj_lectura_critica is not None:
        student_data.ptj_lectura_critica = validation_data.ptj_lectura_critica
    if validation_data.ptj_ingles is not None:
        student_data.ptj_ingles = validation_data.ptj_ingles
    
    # Marcar como validado
    student_data.is_validated = True
    student_data.validation_date = datetime.now()
    current_user.data_validated = True
    current_user.validation_completed_at = datetime.now()
    
    db.commit()
    
    return {"message": "Datos validados correctamente"}

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Autentica un usuario y devuelve un token JWT."""
    # Buscar usuario por correo
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar contraseña
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Actualizar último login
    user.last_login = datetime.now()
    db.commit()

    # Crear token de acceso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_role": user.role.value,
        "data_validated": user.data_validated
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Devuelve información del usuario actual."""
    return current_user
