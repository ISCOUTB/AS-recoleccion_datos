from pydantic import BaseModel, EmailStr, validator, Field
import re
from typing import Optional, List
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

# Esquema para actualización de perfil
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    # Omitimos phone y bio porque no existen en la base de datos aún

# Esquema para cambio de contraseña
class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
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

# Esquema para respuesta de usuario
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    student_id: Optional[str] = None
    program: Optional[str] = None
    semester: Optional[int] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True

# Esquema para token
class Token(BaseModel):
    access_token: str
    token_type: str

# Esquema para datos del token
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class AcademicRecordResponse(BaseModel):
    id: int
    user_id: int
    period: str
    average_score: float
    credits_completed: int
    total_credits: int
    status: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    credits: int
    program: Optional[str] = None
    
    class Config:
        from_attributes = True

class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    period: str
    grade: Optional[float] = None
    status: str
    enrollment_date: datetime
    course: CourseResponse
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas para encuestas
class OptionResponse(BaseModel):
    id: int
    option_text: str
    order: int
    
    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    order: int
    required: bool
    options: List[OptionResponse] = []
    
    class Config:
        from_attributes = True

class SurveyResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    end_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SurveyDetail(SurveyResponse):
    questions: List[QuestionResponse] = []
    
    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: int
    answer_text: Optional[str] = None
    selected_option_id: Optional[int] = None

class SurveySubmission(BaseModel):
    answers: List[AnswerSubmission]

# Esquemas para tickets de soporte
class TicketCreate(BaseModel):
    issue_type: str
    description: str
    priority: str
    contact_email: Optional[str] = None

class TicketAttachmentResponse(BaseModel):
    id: int
    file_path: str
    original_filename: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TicketResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    issue_type: str
    description: str
    priority: str
    status: str
    contact_email: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    attachments: List[TicketAttachmentResponse] = []
    
    class Config:
        from_attributes = True
