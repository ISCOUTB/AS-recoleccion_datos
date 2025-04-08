from sqlalchemy import Boolean, Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

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
    student_id = Column(String, unique=True, index=True)
    program = Column(String)
    semester = Column(Integer)
    icfes_score = Column(Integer)
    
    # Campos adicionales para el perfil
    phone = Column(String)
    bio = Column(Text)
    avatar_url = Column(String)
    
    # Relaciones
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
