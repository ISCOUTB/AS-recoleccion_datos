from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta

from app.database import get_db
from app.models.models import User
from app.schemas import UserCreate, UserResponse, UserLogin, Token, UserProfileUpdate, PasswordChange
from app.auth.password import verify_password, get_password_hash
from app.auth.jwt import create_access_token, get_current_active_user
from app.config import settings
import os
import shutil
from uuid import uuid4

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario."""
    # Verificar si el correo ya existe
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )
    
    # Verificar si el ID de estudiante ya existe (si se proporciona)
    if user.student_id:
        db_student = db.query(User).filter(User.student_id == user.student_id).first()
        if db_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El ID de estudiante ya está registrado"
            )
    
    # Crear nuevo usuario
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        student_id=user.student_id,
        program=user.program,
        semester=user.semester,
        icfes_score=user.icfes_score
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

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
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Devuelve información del usuario actual."""
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    full_name: str = Form(...),
    phone: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    delete_previous_avatar: Optional[bool] = Form(False),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza el perfil del usuario."""
    # Guardar la URL del avatar anterior para posible eliminación
    previous_avatar_url = current_user.avatar_url
    
    # Actualizar datos del usuario
    current_user.full_name = full_name
    current_user.phone = phone
    current_user.bio = bio
    
    # Procesar avatar si se proporciona
    if avatar:
        # Crear directorio para avatares si no existe
        avatar_dir = os.path.join("static", "avatars")
        os.makedirs(avatar_dir, exist_ok=True)
        
        # Generar nombre único para el archivo
        file_extension = os.path.splitext(avatar.filename)[1]
        avatar_filename = f"{uuid4()}{file_extension}"
        avatar_path = os.path.join(avatar_dir, avatar_filename)
        
        # Guardar archivo
        with open(avatar_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        
        # Actualizar ruta del avatar en la base de datos
        avatar_url = f"/static/avatars/{avatar_filename}"
        current_user.avatar_url = avatar_url
        
        # Eliminar avatar anterior si existe y se solicita
        if delete_previous_avatar and previous_avatar_url and previous_avatar_url.startswith("/static/avatars/"):
            try:
                # Extraer el nombre del archivo de la ruta
                old_filename = previous_avatar_url.split("/")[-1]
                old_avatar_path = os.path.join("static", "avatars", old_filename)
                
                # Verificar que el archivo exista antes de eliminarlo
                if os.path.exists(old_avatar_path):
                    os.remove(old_avatar_path)
                    print(f"Avatar anterior eliminado: {old_avatar_path}")
            except Exception as e:
                print(f"Error al eliminar avatar anterior: {str(e)}")
                # No interrumpimos el flujo si falla la eliminación
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cambia la contraseña del usuario."""
    # Verificar contraseña actual
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )
    
    # Actualizar contraseña
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}

@router.get("/users", response_model=List[UserResponse])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Devuelve una lista de usuarios (solo para administradores)."""
    # Verificar si el usuario es administrador
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Devuelve información de un usuario específico."""
    # Verificar si el usuario es administrador o es el propio usuario
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta información"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user

@router.delete("/delete-avatar/{filename}", status_code=status.HTTP_200_OK)
async def delete_avatar(
    filename: str,
    current_user: User = Depends(get_current_active_user)
):
    """Elimina un archivo de avatar antiguo."""
    try:
        # Verificar que el archivo pertenezca a la carpeta de avatares
        if not filename or ".." in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nombre de archivo inválido"
            )
        
        # Construir la ruta del archivo
        avatar_path = os.path.join("static", "avatars", filename)
        
        # Verificar que el archivo exista
        if not os.path.exists(avatar_path):
            return {"message": "El archivo no existe o ya fue eliminado"}
        
        # Eliminar el archivo
        os.remove(avatar_path)
        
        return {"message": "Avatar eliminado correctamente"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el avatar: {str(e)}"
        )
