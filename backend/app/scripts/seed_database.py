import sys
import os
from datetime import datetime, timedelta
import random

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.models import (
    User, AcademicRecord, Course, Enrollment, Survey, 
    Question, Option, Notification
)
from app.auth.password import get_password_hash

# Crear una sesión de base de datos
db = SessionLocal()

def create_users():
    """Crear usuarios de ejemplo"""
    users_data = [
        {
            "email": "ana.garcia@universidad.edu.co",
            "full_name": "Ana María García",
            "password": "Contraseña123!",
            "student_id": "20210001",
            "program": "Ingeniería en Sistemas",
            "semester": 6,
            "icfes_score": 380
        },
        {
            "email": "carlos.rodriguez@universidad.edu.co",
            "full_name": "Carlos Rodríguez",
            "password": "Contraseña123!",
            "student_id": "20210002",
            "program": "Ingeniería Electrónica",
            "semester": 5,
            "icfes_score": 410
        },
        {
            "email": "laura.martinez@universidad.edu.co",
            "full_name": "Laura Martínez",
            "password": "Contraseña123!",
            "student_id": "20210003",
            "program": "Psicología",
            "semester": 7,
            "icfes_score": 395
        },
        {
            "email": "admin@universidad.edu.co",
            "full_name": "Administrador",
            "password": "Admin123!",
            "is_admin": True
        }
    ]
    
    created_users = []
    for user_data in users_data:
        # Verificar si el usuario ya existe
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            print(f"Usuario {user_data['email']} ya existe, omitiendo...")
            created_users.append(existing_user)
            continue
        
        # Crear nuevo usuario
        hashed_password = get_password_hash(user_data.pop("password"))
        user = User(hashed_password=hashed_password, **user_data)
        db.add(user)
        db.flush()
        created_users.append(user)
        print(f"Usuario {user.email} creado con ID {user.id}")
    
    db.commit()
    return created_users

def create_academic_records(users):
    """Crear registros académicos para los usuarios"""
    for user in users:
        if hasattr(user, 'is_admin') and user.is_admin:
            continue  # Saltar administradores
        
        # Verificar si ya tiene un registro académico
        existing_record = db.query(AcademicRecord).filter(AcademicRecord.user_id == user.id).first()
        if existing_record:
            print(f"Registro académico para {user.email} ya existe, omitiendo...")
            continue
        
        # Calcular créditos completados basados en el semestre
        credits_per_semester = 20
        credits_completed = user.semester * credits_per_semester if user.semester else 0
        total_credits = 180  # Ejemplo: carrera de 180 créditos
        
        # Crear registro académico
        academic_record = AcademicRecord(
            user_id=user.id,
            period="2025-1",
            average_score=round(random.uniform(3.0, 4.8), 1),
            credits_completed=credits_completed,
            total_credits=total_credits,
            status="En curso"
        )
        db.add(academic_record)
        print(f"Registro académico creado para {user.email}")
    
    db.commit()

def create_courses():
    """Crear cursos de ejemplo"""
    courses_data = [
        {
            "code": "MAT101",
            "name": "Matemáticas Avanzadas",
            "description": "Curso de matemáticas avanzadas para ingeniería",
            "credits": 4,
            "program": "Ingeniería"
        },
        {
            "code": "PRG202",
            "name": "Programación Web",
            "description": "Desarrollo de aplicaciones web modernas",
            "credits": 3,
            "program": "Ingeniería en Sistemas"
        },
        {
            "code": "DB303",
            "name": "Bases de Datos",
            "description": "Diseño y gestión de bases de datos relacionales",
            "credits": 4,
            "program": "Ingeniería en Sistemas"
        },
        {
            "code": "FIS104",
            "name": "Física",
            "description": "Principios fundamentales de la física",
            "credits": 4,
            "program": "Ingeniería"
        },
        {
            "code": "QUI105",
            "name": "Química",
            "description": "Fundamentos de química para ingeniería",
            "credits": 3,
            "program": "Ingeniería"
        },
        {
            "code": "ING106",
            "name": "Inglés",
            "description": "Inglés técnico para profesionales",
            "credits": 2,
            "program": "General"
        }
    ]
    
    created_courses = []
    for course_data in courses_data:
        # Verificar si el curso ya existe
        existing_course = db.query(Course).filter(Course.code == course_data["code"]).first()
        if existing_course:
            print(f"Curso {course_data['code']} ya existe, omitiendo...")
            created_courses.append(existing_course)
            continue
        
        # Crear nuevo curso
        course = Course(**course_data)
        db.add(course)
        db.flush()
        created_courses.append(course)
        print(f"Curso {course.name} creado con ID {course.id}")
    
    db.commit()
    return created_courses

def create_enrollments(users, courses):
    """Crear matrículas para los usuarios en los cursos"""
    for user in users:
        if hasattr(user, 'is_admin') and user.is_admin:
            continue  # Saltar administradores
        
        # Determinar cuántos cursos matricular (entre 3 y 5)
        num_courses = random.randint(3, min(5, len(courses)))
        selected_courses = random.sample(courses, num_courses)
        
        for course in selected_courses:
            # Verificar si ya está matriculado
            existing_enrollment = db.query(Enrollment).filter(
                Enrollment.user_id == user.id,
                Enrollment.course_id == course.id
            ).first()
            
            if existing_enrollment:
                print(f"Usuario {user.email} ya está matriculado en {course.name}, omitiendo...")
                continue
            
            # Crear matrícula
            enrollment = Enrollment(
                user_id=user.id,
                course_id=course.id,
                period="2025-1",
                status="Activo",
                grade=round(random.uniform(3.0, 5.0), 1) if random.random() > 0.3 else None
            )
            db.add(enrollment)
            print(f"Matrícula creada para {user.email} en {course.name}")
    
    db.commit()

def create_survey():
    """Crear encuesta de deserción estudiantil"""
    # Verificar si ya existe una encuesta activa
    existing_survey = db.query(Survey).filter(Survey.is_active == True).first()
    if existing_survey:
        print(f"Ya existe una encuesta activa: {existing_survey.title}, omitiendo...")
        return existing_survey
    
    # Crear nueva encuesta
    survey = Survey(
        title="Encuesta de Prevención de Deserción Estudiantil",
        description="Esta encuesta nos ayudará a identificar factores de riesgo de deserción y brindar apoyo oportuno.",
        is_active=True,
        end_date=datetime.now() + timedelta(days=30)
    )
    db.add(survey)
    db.flush()
    
    # Crear preguntas para la encuesta
    questions_data = [
        {
            "question_text": "¿Cómo calificarías tu experiencia académica actual?",
            "question_type": "multiple_choice",
            "order": 1,
            "options": ["Excelente", "Buena", "Regular", "Difícil"]
        },
        {
            "question_text": "¿Has considerado abandonar tus estudios en algún momento?",
            "question_type": "multiple_choice",
            "order": 2,
            "options": ["Nunca", "Rara vez", "Ocasionalmente", "Frecuentemente"]
        },
        {
            "question_text": "¿Cuál es el principal factor que te motivaría a abandonar tus estudios?",
            "question_type": "multiple_choice",
            "order": 3,
            "options": ["Dificultades económicas", "Bajo rendimiento académico", "Problemas personales/familiares", "Falta de interés en la carrera", "Problemas de salud"]
        },
        {
            "question_text": "¿Qué tipo de apoyo consideras que necesitas para continuar tus estudios?",
            "question_type": "multiple_choice",
            "order": 4,
            "options": ["Tutoría académica", "Apoyo económico", "Orientación vocacional", "Apoyo psicológico", "Flexibilidad horaria"]
        },
        {
            "question_text": "Describe brevemente las principales dificultades que has enfrentado durante tu carrera",
            "question_type": "open_ended",
            "order": 5,
            "options": []
        },
        {
            "question_text": "¿Qué sugerencias tienes para mejorar tu experiencia académica?",
            "question_type": "open_ended",
            "order": 6,
            "options": []
        }
    ]
    
    for q_data in questions_data:
        options_data = q_data.pop("options")
        question = Question(
            survey_id=survey.id,
            **q_data,
            required=True
        )
        db.add(question)
        db.flush()
        
        # Crear opciones para preguntas de opción múltiple
        if q_data["question_type"] == "multiple_choice":
            for i, option_text in enumerate(options_data):
                option = Option(
                    question_id=question.id,
                    option_text=option_text,
                    order=i+1
                )
                db.add(option)
        
        print(f"Pregunta creada: {q_data['question_text']}")
    
    db.commit()
    print(f"Encuesta creada: {survey.title}")
    return survey

def create_notifications(users):
    """Crear notificaciones para los usuarios"""
    notification_types = ["success", "warning", "info"]
    notification_messages = [
        "Calificación registrada: Matemáticas Avanzadas",
        "Recordatorio: Entrega de proyecto final",
        "Nueva encuesta disponible",
        "Fecha límite de pago próxima",
        "Actualización de horario de clases"
    ]
    
    for user in users:
        if hasattr(user, 'is_admin') and user.is_admin:
            continue  # Saltar administradores
        
        # Crear entre 2 y 4 notificaciones por usuario
        num_notifications = random.randint(2, 4)
        for _ in range(num_notifications):
            notification = Notification(
                user_id=user.id,
                type=random.choice(notification_types),
                message=random.choice(notification_messages),
                read=random.random() > 0.7  # 30% de probabilidad de estar leída
            )
            db.add(notification)
            print(f"Notificación creada para {user.email}")
    
    db.commit()

def main():
    """Función principal para poblar la base de datos"""
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas exitosamente.")
    
    print("Iniciando población de la base de datos...")
    
    # Crear datos
    users = create_users()
    create_academic_records(users)
    courses = create_courses()
    create_enrollments(users, courses)
    create_survey()
    create_notifications(users)
    
    print("Base de datos poblada exitosamente.")

if __name__ == "__main__":
    main()

