from sqlalchemy import Boolean, Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"

# DEFINIR PRIMERO StudentData
class StudentData(Base):
    __tablename__ = "student_data"
    
    id = Column(String, primary_key=True, index=True)  # ID como string (ej: "T000YAHAA")
    codigo_antiguo = Column(String)
    periodo_catalogo = Column(String)
    programa = Column(String)
    snies = Column(String)
    pensum = Column(String)
    expedida_en = Column(String)
    fecha_exp_doc = Column(DateTime(timezone=True))
    sexo = Column(String)
    estado_civil = Column(String)
    fecha_nacimiento = Column(DateTime(timezone=True))
    ciudad1 = Column(String)
    direccion1 = Column(String)
    telefono1 = Column(String)
    ciudad2 = Column(String)
    direccion = Column(String)
    nivel = Column(String)
    cod_col = Column(String)
    colegio = Column(String)
    dir_colegio = Column(String)
    ciudad_colegio = Column(String)
    depto_colegio = Column(String)
    municipio_colegio = Column(String)
    pais_colegio = Column(String)
    fecha_graduacion = Column(DateTime(timezone=True))
    
    # Puntajes ICFES
    ptj_fisica = Column(Float)
    ptj_quimica = Column(Float)
    ptj_geografia = Column(Float)
    ptj_ciencias_sociales = Column(Float)
    ptj_sociales_ciudadano = Column(Float)
    ptj_ciencias_naturales = Column(Float)
    ptj_biologia = Column(Float)
    ptj_filosofia = Column(Float)
    ptj_lenguaje = Column(Float)
    ptj_lectura_critica = Column(Float)
    ptj_ingles = Column(Float)
    ptj_historia = Column(Float)
    ptj_matematicas = Column(Float)
    icfes_antes_del_2000 = Column(Boolean)
    ecaes = Column(Float)
    
    # Estado académico
    cod_estado = Column(String)
    estado = Column(String)
    cod_tipo = Column(String)
    tipo_estudiante = Column(String)
    
    # Información académica
    pga_acumulado = Column(Float)
    pga_acumulado_periodo_busqueda = Column(Float)
    creditos_matriculados = Column(Integer)
    creditos_intentadas = Column(Integer)
    creditos_ganadas = Column(Integer)
    creditos_pasadas = Column(Integer)
    creditos_pga = Column(Integer)
    puntos_calidad_pga = Column(Float)
    promedio_periodo = Column(Float)
    creditos_intentadas_periodo = Column(Integer)
    creditos_ganadas_periodo = Column(Integer)
    creditos_pasadas_periodo = Column(Integer)
    creditos_pga_periodo = Column(Integer)
    puntos_calidad_pga_periodo = Column(Float)
    nro_materias_cursadas = Column(Integer)
    nro_materias_reprobadas = Column(Integer)
    nro_materias_aprobadas = Column(Integer)
    nro_materias_matriculadas = Column(Integer)
    nro_materias_finalizadas = Column(Integer)
    situacion = Column(String)
    estrato = Column(Integer)
    becas = Column(String)
    ceres = Column(String)
    periodo_ingreso = Column(String)
    peri_in_prog_vigente = Column(String)
    
    # Relación con User
    user = relationship("User", back_populates="student_data", uselist=False)

# AHORA DEFINIR User
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Campos adicionales para el sistema de prevención de deserción
    student_id = Column(String, unique=True, index=True)  # String para IDs como "T000YAHAA"
    program = Column(String)
    semester = Column(Integer)
    icfes_score = Column(Integer)
    
    # Campos adicionales para el perfil
    phone = Column(String)
    bio = Column(Text)
    avatar_url = Column(String)

    # Añadir campo de rol
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relación con datos del estudiante del Excel
    student_data_id = Column(String, ForeignKey("student_data.id"), nullable=True)
    student_data = relationship("StudentData", back_populates="user")
    
    # Estado de validación de datos
    data_validated = Column(Boolean, default=False)
    validation_completed_at = Column(DateTime(timezone=True), nullable=True)
        
    # Relaciones existentes
    academic_records = relationship("AcademicRecord", back_populates="user")
    enrollments = relationship("Enrollment", back_populates="user")
    survey_responses = relationship("SurveyResponse", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    support_tickets = relationship("SupportTicket", back_populates="user")

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    period = Column(String)  # Ej: "2025-1"
    average_score = Column(Float)
    credits_completed = Column(Integer)
    total_credits = Column(Integer)
    status = Column(String)  # Ej: "En curso", "Finalizado"
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="academic_records")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    credits = Column(Integer)
    program = Column(String)
    
    # Relaciones
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    period = Column(String)  # Ej: "2025-1"
    grade = Column(Float, nullable=True)
    status = Column(String)  # Ej: "Activo", "Completado", "Retirado"
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Survey(Base):
    __tablename__ = "surveys"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relaciones
    questions = relationship("Question", back_populates="survey")
    responses = relationship("SurveyResponse", back_populates="survey")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.id"))
    question_text = Column(String, nullable=False)
    question_type = Column(String)  # Ej: "multiple_choice", "open_ended"
    order = Column(Integer)
    required = Column(Boolean, default=True)
    
    # Relaciones
    survey = relationship("Survey", back_populates="questions")
    options = relationship("Option", back_populates="question")
    answers = relationship("AnswerDetail", back_populates="question")

class Option(Base):
    __tablename__ = "options"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    option_text = Column(String, nullable=False)
    order = Column(Integer)
    
    # Relaciones
    question = relationship("Question", back_populates="options")
    selected_answers = relationship("AnswerDetail", back_populates="selected_option")

class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    survey_id = Column(Integer, ForeignKey("surveys.id"))
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="survey_responses")
    survey = relationship("Survey", back_populates="responses")
    answer_details = relationship("AnswerDetail", back_populates="response")

class AnswerDetail(Base):
    __tablename__ = "answer_details"
    
    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("survey_responses.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    answer_text = Column(Text, nullable=True)  # Para preguntas abiertas
    selected_option_id = Column(Integer, ForeignKey("options.id"), nullable=True)  # Para preguntas de opción múltiple
    
    # Relaciones
    response = relationship("SurveyResponse", back_populates="answer_details")
    question = relationship("Question", back_populates="answers")
    selected_option = relationship("Option", back_populates="selected_answers")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # Ej: "success", "warning", "info"
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="notifications")

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    issue_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, nullable=False)  # abierto, en_proceso, cerrado
    contact_email = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    user = relationship("User", back_populates="support_tickets")
    attachments = relationship("TicketAttachment", back_populates="ticket")

class TicketAttachment(Base):
    __tablename__ = "ticket_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    ticket = relationship("SupportTicket", back_populates="attachments")
