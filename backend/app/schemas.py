from pydantic import BaseModel, EmailStr, validator, Field
import re
from typing import Optional
from datetime import datetime

# Esquema base para usuario
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    
    @validator('email')
    def email_must_be_institutional(cls, v):
        # Validar que el correo sea institucional (ejemplo)
        if not v.endswith('.edu.co'):
            raise ValueError('El correo debe ser institucional (.edu.co)')
        return v

# Esquema para creación de usuario
class UserCreate(UserBase):
    password: str
    confirm_password: str
    student_id: Optional[str] = None
    program: Optional[str] = None
    semester: Optional[int] = None
    # El campo icfes_score ahora es completamente opcional y no se incluye en el formulario inicial
    icfes_score: Optional[int] = None
    
    @validator('password')
    def password_strength(cls, v):
        # Validar fortaleza de contraseña
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe tener al menos una mayúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe tener al menos una minúscula')
        if not re.search(r'[0-9]', v):
            raise ValueError('La contraseña debe tener al menos un número')
        if not re.search(r'[^A-Za-z0-9]', v):
            raise ValueError('La contraseña debe tener al menos un carácter especial')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v
    
    @validator('icfes_score')
    def validate_icfes_score(cls, v):
        if v is not None and (v < 0 or v > 500):
            raise ValueError('El puntaje ICFES debe estar entre 0 y 500')
        return v

# Esquema para login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Esquema para respuesta de usuario
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    student_id: Optional[str] = None
    program: Optional[str] = None
    semester: Optional[int] = None
    
    class Config:
        orm_mode = True

# Esquema para token
class Token(BaseModel):
    access_token: str
    token_type: str

# Esquema para datos del token
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None