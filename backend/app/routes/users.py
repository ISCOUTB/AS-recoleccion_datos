from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import timedelta, datetime
from app.database import get_db
from app.models.models import User, UserRole
from app.schemas import UserCreate,UserList, UserResponse, UserLogin, Token, UserProfileUpdate, PasswordChange, UserRole as SchemaUserRole, UserUpdate
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
    # Determinar el rol del usuario
    role = UserRole.STUDENT
    if user.role:
        role = UserRole(user.role.value)
    
    # Determinar si es administrador basado en el rol
    is_admin = role == UserRole.ADMIN
    # Crear nuevo usuario
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        student_id=user.student_id,
        program=user.program,
        semester=user.semester,
        icfes_score=user.icfes_score,
        role=role,
        is_admin=is_admin
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
    
    # Actualizar último login
    user.last_login = datetime.now()
    db.commit()

    # Crear token de acceso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_role": user.role.value}

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

@router.get("/users", response_model=UserList)
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[bool] = None,
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
    
    # Construir la consulta base
    query = db.query(User)
    
    # Aplicar filtros si se proporcionan
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%")) |
            (User.student_id.ilike(f"%{search}%"))
        )
    
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            # Si el rol no es válido, ignoramos este filtro
            pass
    
    if status is not None:
        query = query.filter(User.is_active == status)
    
    # Aplicar paginación
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    # Devolver resultados con metadatos de paginación
    return {
        "items": users,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }


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

from app.utils.serialization import sqlalchemy_to_dict, sqlalchemy_list_to_dict

@router.get("/users", response_model=Dict[str, Any])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[bool] = None,
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
    
    # Construir la consulta base
    query = db.query(User)
    
    # Aplicar filtros si se proporcionan
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%")) |
            (User.student_id.ilike(f"%{search}%"))
        )
    
    if role:
        try:
            role_enum = UserRole(role)
            query = query.filter(User.role == role_enum)
        except ValueError:
            # Si el rol no es válido, ignoramos este filtro
            pass
    
    if status is not None:
        query = query.filter(User.is_active == status)
    
    # Aplicar paginación
    total = query.count()
    users_db = query.offset(skip).limit(limit).all()
    
    # Convertir objetos SQLAlchemy a diccionarios
    users = sqlalchemy_list_to_dict(users_db)
    
    # Devolver resultados con metadatos de paginación
    return {
        "items": users,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }



@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Actualiza información de un usuario (solo para administradores)."""
    # Verificar si el usuario es administrador
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción"
        )
    
    # Buscar el usuario a actualizar
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si se está actualizando el correo y si ya existe
    if user_update.email and user_update.email != db_user.email:
        existing_email = db.query(User).filter(User.email == user_update.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo ya está registrado por otro usuario"
            )
        db_user.email = user_update.email
    
    # Actualizar campos si se proporcionan
    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name
    
    if user_update.student_id is not None:
        # Verificar si el ID de estudiante ya existe
        if user_update.student_id != db_user.student_id:
            existing_student_id = db.query(User).filter(User.student_id == user_update.student_id).first()
            if existing_student_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El ID de estudiante ya está registrado por otro usuario"
                )
        db_user.student_id = user_update.student_id
    
    if user_update.program is not None:
        db_user.program = user_update.program
    
    if user_update.semester is not None:
        db_user.semester = user_update.semester
    
    if user_update.icfes_score is not None:
        db_user.icfes_score = user_update.icfes_score
    
    if user_update.role is not None:
        try:
            role = UserRole(user_update.role.value)
            db_user.role = role
            db_user.is_admin = (role == UserRole.ADMIN)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rol no válido"
            )
    
    if user_update.is_active is not None:
        db_user.is_active = user_update.is_active
    
    if user_update.password:
        db_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Elimina un usuario (solo para administradores)."""
    # Verificar si el usuario es administrador
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción"
        )
    
    # No permitir eliminar al propio usuario
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario"
        )
    
    # Buscar el usuario a eliminar
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Opción 1: Eliminación física (no recomendada en producción)
    # db.delete(db_user)
    
    # Opción 2: Eliminación lógica (recomendada)
    db_user.is_active = False
    
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

@router.delete("/delete-avatar/{filename}", status_code=status.HTTP_200_OK)
async def delete_avatar(
    filename: str,
    current_user: User = Depends(get_current_active_user)
):
    """Elimina un archivo de avatar antiguo de forma segura."""
    try:
        # Validar que el nombre del archivo sea seguro y no contenga rutas
        safe_filename = os.path.basename(filename)
        if not safe_filename or safe_filename != filename or any(c in filename for c in ["..", "/", "\\"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nombre de archivo inválido"
            )
        # Construir la ruta absoluta del archivo
        avatar_dir = os.path.abspath(os.path.join("static", "avatars"))
        avatar_path = os.path.abspath(os.path.join(avatar_dir, safe_filename))
        # Verificar que el archivo esté dentro del directorio de avatares
        if not avatar_path.startswith(avatar_dir):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ruta de archivo no permitida"
            )
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
