from enum import Enum
from pydantic import BaseModel, EmailStr, validator, Field
import re
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"

# Esquemas para datos del estudiante del Excel
class StudentDataResponse(BaseModel):
    id: str
    codigo_antiguo: Optional[str] = None
    programa: Optional[str] = None
    sexo: Optional[str] = None
    estado_civil: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    estrato: Optional[int] = None
    ptj_matematicas: Optional[float] = None
    ptj_lectura_critica: Optional[float] = None
    ptj_ingles: Optional[float] = None
    pga_acumulado: Optional[float] = None
    situacion: Optional[str] = None
    tipo_estudiante: Optional[str] = None
    is_validated: bool = False
    
    class Config:
        from_attributes = True

class StudentValidationData(BaseModel):
    estrato: Optional[int] = None
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    estado_civil: Optional[str] = None
    telefono1: Optional[str] = None
    ciudad1: Optional[str] = None
    ptj_matematicas: Optional[float] = None
    ptj_lectura_critica: Optional[float] = None
    ptj_ingles: Optional[float] = None

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

# Esquema para registro inicial (solo datos básicos)
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    full_name: str
    student_id: str  # ID que debe existir en la tabla de estudiantes
    
    @validator('email')
    def email_must_be_institutional(cls, v):
        if not v.endswith('.edu.co'):
            raise ValueError('El correo debe ser institucional (.edu.co)')
        return v
    
    @validator('password')
    def password_strength(cls, v):
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

# Esquema para validación de datos del estudiante
class StudentDataValidation(BaseModel):
    validation_data: StudentValidationData
    confirmed_fields: List[str]  # Lista de campos que el usuario confirmó como correctos

# Esquema para creación de usuario (mantener compatibilidad)
class UserCreate(UserBase):
    password: str
    confirm_password: str
    student_id: Optional[str] = None
    program: Optional[str] = None
    semester: Optional[int] = None
    icfes_score: Optional[int] = None
    role: Optional[UserRole] = None

    @validator('password')
    def password_strength(cls, v):
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

# Esquema para actualización de usuario
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    program: Optional[str] = None
    semester: Optional[int] = None
    icfes_score: Optional[int] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    
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
    phone: Optional[str] = None
    bio: Optional[str] = None

# Esquema para cambio de contraseña
class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def password_strength(cls, v):
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
    role: Optional[str] = None
    is_admin: bool
    last_login: Optional[datetime] = None
    data_validated: bool = False
    validation_completed_at: Optional[datetime] = None
    student_data: Optional[StudentDataResponse] = None
    
    class Config:
        from_attributes = True

# Esquema para token
class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    data_validated: bool = False

# Esquema para datos del token
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

# Esquemas para estadísticas del dashboard de admin
class AdminDashboardStats(BaseModel):
    total_students: int
    active_students: int
    validated_students: int
    pending_validation: int
    average_gpa: float
    average_icfes: float
    students_by_program: Dict[str, int]
    students_by_situation: Dict[str, int]
    students_by_stratum: Dict[str, int]
    recent_registrations: int
    dropout_risk_students: int

class StudentStatsResponse(BaseModel):
    id: int
    full_name: str
    student_id: str
    program: Optional[str] = None
    situacion: Optional[str] = None
    pga_acumulado: Optional[float] = None
    estrato: Optional[int] = None
    data_validated: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Esquemas existentes (mantener compatibilidad)
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
        
class DashboardStats(BaseModel):
    users: int
    courses: int
    participationRate: float
    uptime: float

class UserList(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    pages: int
