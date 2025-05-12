# -*- coding: utf-8 -*-
import sys
import os
from datetime import datetime, timedelta
import random
import traceback
import enum
import psycopg2
import bcrypt 
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Definir UserRole enum igual que en models.py para referencia
class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"

def get_connection_params():
    """Obtener parametros de conexion desde variables de entorno."""
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Parsear la URL de la base de datos
        # Formato: postgresql://usuario:contrasena@host:puerto/nombre_db
        database_url = database_url.replace("postgresql://", "")
        db_parts = database_url.split("/")
        db_name = db_parts[1]
        db_conn_parts = db_parts[0].split("@")
        db_user_pass = db_conn_parts[0].split(":")
        db_user = db_user_pass[0]
        db_pass = db_user_pass[1] if len(db_user_pass) > 1 else ""
        db_host_port = db_conn_parts[1].split(":")
        db_host = db_host_port[0]
        db_port = db_host_port[1] if len(db_host_port) > 1 else "5432"
    else:
        # Usar valores predeterminados si no hay DATABASE_URL
        db_user = os.getenv("DB_USER", "postgres")
        db_pass = os.getenv("DB_PASSWORD", "postgres")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "as_recoleccion_datos")
    
    return db_user, db_pass, db_host, db_port, db_name

def get_password_hash(password):
    """Función para generar hash de contraseña usando bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def table_exists(cursor, table_name):
    """Verificar si una tabla existe en la base de datos."""
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = %s
        );
    """, (table_name,))
    return cursor.fetchone()[0]

def clear_database(conn, cursor):
    """Eliminar todos los datos existentes en la base de datos."""
    try:
        print("Eliminando datos existentes...")
        
        # Orden de eliminación para respetar las restricciones de clave foránea
        tables = [
            "notifications",
            "options",
            "questions",
            "surveys",
            "enrollments",
            "academic_records",
            "courses",
            "users"
        ]
        
        # Verificar y eliminar cada tabla si existe
        for table in tables:
            if table_exists(cursor, table):
                try:
                    # Usar CASCADE para forzar la eliminación incluso con dependencias
                    cursor.execute(f"TRUNCATE TABLE {table} CASCADE")
                    print(f"Tabla {table} limpiada.")
                except Exception as e:
                    print(f"Error al limpiar la tabla {table}: {e}")
                    # Intentar con DELETE si TRUNCATE falla
                    try:
                        cursor.execute(f"DELETE FROM {table}")
                        print(f"Tabla {table} limpiada con DELETE.")
                    except Exception as e2:
                        print(f"Error al usar DELETE en la tabla {table}: {e2}")
                        conn.rollback()
                        # Continuar con la siguiente tabla
            else:
                print(f"La tabla {table} no existe, omitiendo.")
        
        conn.commit()
        print("Limpieza de datos completada.")
    except Exception as e:
        print(f"Error al limpiar la base de datos: {e}")
        traceback.print_exc()
        conn.rollback()

def create_users(conn, cursor):
    """Crear usuarios de ejemplo"""
    users_data = [
        {
            "email": "ana.garcia@universidad.edu.co",
            "full_name": "Ana Maria Garcia",
            "password": "Contrasena123!",
            "student_id": "20210001",
            "program": "Ingenieria en Sistemas",
            "semester": 6,
            "icfes_score": 380,
            "role": "STUDENT"
        },
        {
            "email": "carlos.rodriguez@universidad.edu.co",
            "full_name": "Carlos Rodriguez",
            "password": "Contrasena123!",
            "student_id": "20210002",
            "program": "Ingenieria Electronica",
            "semester": 5,
            "icfes_score": 410,
            "role": "STUDENT"
        },
        {
            "email": "laura.martinez@universidad.edu.co",
            "full_name": "Laura Martinez",
            "password": "Contrasena123!",
            "student_id": "20210003",
            "program": "Psicologia",
            "semester": 7,
            "icfes_score": 395,
            "role": "STUDENT"
        },
        {
            "email": "profesor@universidad.edu.co",
            "full_name": "Profesor Ejemplo",
            "password": "Profesor123!",
            "role": "TEACHER"
        },
        {
            "email": "admin@universidad.edu.co",
            "full_name": "Administrador",
            "password": "Admin123!",
            "is_admin": True,
            "role": "ADMIN"
        }
    ]
    
    created_users = []
    for user_data in users_data:
        try:
            # Verificar si el usuario ya existe y eliminarlo si es necesario
            cursor.execute(
                "SELECT id FROM users WHERE email = %s",
                (user_data["email"],)
            )
            existing_user = cursor.fetchone()
            
            if existing_user:
                print(f"Usuario {user_data['email']} ya existe, eliminándolo...")
                user_id = existing_user[0]
                
                # Eliminar registros relacionados primero
                if table_exists(cursor, "notifications"):
                    cursor.execute("DELETE FROM notifications WHERE user_id = %s", (user_id,))
                
                if table_exists(cursor, "enrollments"):
                    cursor.execute("DELETE FROM enrollments WHERE user_id = %s", (user_id,))
                
                if table_exists(cursor, "academic_records"):
                    cursor.execute("DELETE FROM academic_records WHERE user_id = %s", (user_id,))
                
                # Finalmente eliminar el usuario
                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                conn.commit()
            
            # Crear nuevo usuario
            password = user_data.pop("password")
            hashed_password = get_password_hash(password)
            
            # Manejar is_admin si existe
            is_admin = user_data.pop("is_admin", False)
            
            # Preparar datos para inserción
            cursor.execute(
                """
                INSERT INTO users (
                    email, hashed_password, full_name, is_admin, role, 
                    student_id, program, semester, icfes_score, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                ) RETURNING id
                """,
                (
                    user_data["email"],
                    hashed_password,
                    user_data["full_name"],
                    is_admin,
                    user_data["role"],
                    user_data.get("student_id"),
                    user_data.get("program"),
                    user_data.get("semester"),
                    user_data.get("icfes_score"),
                    datetime.now()
                )
            )
            user_id = cursor.fetchone()[0]
            conn.commit()
            
            # Añadir a la lista de usuarios creados
            created_users.append({
                "id": user_id,
                "email": user_data["email"],
                "full_name": user_data["full_name"],
                "is_admin": is_admin,
                "role": user_data["role"]
            })
            print(f"Usuario {user_data['email']} creado con ID {user_id}")
        except Exception as e:
            print(f"Error al crear usuario {user_data.get('email')}: {e}")
            traceback.print_exc()
            conn.rollback()
    
    return created_users

def create_academic_records(conn, cursor, users):
    """Crear registros academicos para los usuarios"""
    for user in users:
        try:
            if user["role"] != "STUDENT":
                continue  # Saltar usuarios que no son estudiantes
            
            # Verificar si ya tiene un registro académico y eliminarlo
            cursor.execute(
                "SELECT id FROM academic_records WHERE user_id = %s",
                (user["id"],)
            )
            existing_record = cursor.fetchone()
            
            if existing_record:
                print(f"Registro académico para {user['email']} ya existe, eliminándolo...")
                cursor.execute("DELETE FROM academic_records WHERE user_id = %s", (user["id"],))
                conn.commit()
            
            # Calcular creditos completados basados en el semestre
            cursor.execute(
                "SELECT semester FROM users WHERE id = %s",
                (user["id"],)
            )
            semester_result = cursor.fetchone()
            
            semester = semester_result[0] if semester_result and semester_result[0] else 1
            credits_per_semester = 20
            credits_completed = semester * credits_per_semester
            total_credits = 180  # Ejemplo: carrera de 180 creditos
            
            # Crear registro academico
            cursor.execute(
                """
                INSERT INTO academic_records (
                    user_id, period, average_score, credits_completed, total_credits, status, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s
                )
                """,
                (
                    user["id"],
                    "2025-1",
                    round(random.uniform(3.0, 4.8), 1),
                    credits_completed,
                    total_credits,
                    "En curso",
                    datetime.now()
                )
            )
            conn.commit()
            print(f"Registro academico creado para {user['email']}")
        except Exception as e:
            print(f"Error al crear registro academico para {user['email']}: {e}")
            traceback.print_exc()
            conn.rollback()

def create_courses(conn, cursor):
    """Crear cursos de ejemplo"""
    courses_data = [
        {
            "code": "MAT101",
            "name": "Matematicas Avanzadas",
            "description": "Curso de matematicas avanzadas para ingenieria",
            "credits": 4,
            "program": "Ingenieria"
        },
        {
            "code": "PRG202",
            "name": "Programacion Web",
            "description": "Desarrollo de aplicaciones web modernas",
            "credits": 3,
            "program": "Ingenieria en Sistemas"
        },
        {
            "code": "DB303",
            "name": "Bases de Datos",
            "description": "Diseno y gestion de bases de datos relacionales",
            "credits": 4,
            "program": "Ingenieria en Sistemas"
        },
        {
            "code": "FIS104",
            "name": "Fisica",
            "description": "Principios fundamentales de la fisica",
            "credits": 4,
            "program": "Ingenieria"
        },
        {
            "code": "QUI105",
            "name": "Quimica",
            "description": "Fundamentos de quimica para ingenieria",
            "credits": 3,
            "program": "Ingenieria"
        },
        {
            "code": "ING106",
            "name": "Ingles",
            "description": "Ingles tecnico para profesionales",
            "credits": 2,
            "program": "General"
        }
    ]
    
    created_courses = []
    for course_data in courses_data:
        try:
            # Verificar si el curso ya existe y eliminarlo
            cursor.execute(
                "SELECT id FROM courses WHERE code = %s",
                (course_data["code"],)
            )
            existing_course = cursor.fetchone()
            
            if existing_course:
                print(f"Curso {course_data['code']} ya existe, eliminándolo...")
                course_id = existing_course[0]
                
                # Eliminar matrículas relacionadas primero
                if table_exists(cursor, "enrollments"):
                    cursor.execute("DELETE FROM enrollments WHERE course_id = %s", (course_id,))
                
                # Eliminar el curso
                cursor.execute("DELETE FROM courses WHERE id = %s", (course_id,))
                conn.commit()
            
            # Crear nuevo curso
            cursor.execute(
                """
                INSERT INTO courses (
                    code, name, description, credits, program
                ) VALUES (
                    %s, %s, %s, %s, %s
                ) RETURNING id
                """,
                (
                    course_data["code"],
                    course_data["name"],
                    course_data["description"],
                    course_data["credits"],
                    course_data["program"]
                )
            )
            course_id = cursor.fetchone()[0]
            conn.commit()
            
            # Añadir a la lista de cursos creados
            created_courses.append({
                "id": course_id,
                "code": course_data["code"],
                "name": course_data["name"]
            })
            print(f"Curso {course_data['name']} creado con ID {course_id}")
        except Exception as e:
            print(f"Error al crear curso {course_data.get('code')}: {e}")
            traceback.print_exc()
            conn.rollback()
    
    return created_courses

def create_enrollments(conn, cursor, users, courses):
    """Crear matriculas para los usuarios en los cursos"""
    for user in users:
        try:
            if user["role"] != "STUDENT":
                continue  # Saltar usuarios que no son estudiantes
            
            # Eliminar matrículas existentes para este usuario
            cursor.execute("DELETE FROM enrollments WHERE user_id = %s", (user["id"],))
            conn.commit()
            
            # Determinar cuantos cursos matricular (entre 3 y 5)
            num_courses = random.randint(3, min(5, len(courses)))
            selected_courses = random.sample(courses, num_courses)
            
            for course in selected_courses:
                # Crear matricula
                cursor.execute(
                    """
                    INSERT INTO enrollments (
                        user_id, course_id, period, grade, status, enrollment_date
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        user["id"],
                        course["id"],
                        "2025-1",
                        round(random.uniform(3.0, 5.0), 1) if random.random() > 0.3 else None,
                        "Activo",
                        datetime.now()
                    )
                )
                conn.commit()
                print(f"Matricula creada para {user['email']} en {course['name']}")
        except Exception as e:
            print(f"Error al crear matricula para {user['email']}: {e}")
            traceback.print_exc()
            conn.rollback()

def create_survey(conn, cursor):
    """Crear encuesta de desercion estudiantil"""
    try:
        # Verificar si ya existe una encuesta activa y eliminarla
        cursor.execute("SELECT id FROM surveys WHERE is_active = TRUE")
        existing_survey = cursor.fetchone()
        
        if existing_survey:
            survey_id = existing_survey[0]
            print(f"Ya existe una encuesta activa con ID {survey_id}, eliminándola...")
            
            # Eliminar opciones y preguntas relacionadas primero
            if table_exists(cursor, "options"):
                cursor.execute("""
                    DELETE FROM options 
                    WHERE question_id IN (SELECT id FROM questions WHERE survey_id = %s)
                """, (survey_id,))
            
            if table_exists(cursor, "questions"):
                cursor.execute("DELETE FROM questions WHERE survey_id = %s", (survey_id,))
            
            # Eliminar la encuesta
            cursor.execute("DELETE FROM surveys WHERE id = %s", (survey_id,))
            conn.commit()
        
        # Crear nueva encuesta
        cursor.execute(
            """
            INSERT INTO surveys (
                title, description, is_active, created_at, end_date
            ) VALUES (
                %s, %s, %s, %s, %s
            ) RETURNING id
            """,
            (
                "Encuesta de Prevencion de Desercion Estudiantil",
                "Esta encuesta nos ayudara a identificar factores de riesgo de desercion y brindar apoyo oportuno.",
                True,
                datetime.now(),
                datetime.now() + timedelta(days=30)
            )
        )
        survey_id = cursor.fetchone()[0]
        conn.commit()
        
        # Crear preguntas para la encuesta
        questions_data = [
            {
                "question_text": "Como calificarias tu experiencia academica actual?",
                "question_type": "multiple_choice",
                "order_num": 1,
                "options": ["Excelente", "Buena", "Regular", "Dificil"]
            },
            {
                "question_text": "Has considerado abandonar tus estudios en algun momento?",
                "question_type": "multiple_choice",
                "order_num": 2,
                "options": ["Nunca", "Rara vez", "Ocasionalmente", "Frecuentemente"]
            },
            {
                "question_text": "Cual es el principal factor que te motivaria a abandonar tus estudios?",
                "question_type": "multiple_choice",
                "order_num": 3,
                "options": ["Dificultades economicas", "Bajo rendimiento academico", "Problemas personales/familiares", "Falta de interes en la carrera", "Problemas de salud"]
            },
            {
                "question_text": "Que tipo de apoyo consideras que necesitas para continuar tus estudios?",
                "question_type": "multiple_choice",
                "order_num": 4,
                "options": ["Tutoria academica", "Apoyo economico", "Orientacion vocacional", "Apoyo psicologico", "Flexibilidad horaria"]
            },
            {
                "question_text": "Describe brevemente las principales dificultades que has enfrentado durante tu carrera",
                "question_type": "open_ended",
                "order_num": 5,
                "options": []
            },
            {
                "question_text": "Que sugerencias tienes para mejorar tu experiencia academica?",
                "question_type": "open_ended",
                "order_num": 6,
                "options": []
            }
        ]
        
        for q_data in questions_data:
            options_data = q_data.pop("options")
            
            # Crear pregunta
            cursor.execute(
                """
                INSERT INTO questions (
                    survey_id, question_text, question_type, order_num, required
                ) VALUES (
                    %s, %s, %s, %s, %s
                ) RETURNING id
                """,
                (
                    survey_id,
                    q_data["question_text"],
                    q_data["question_type"],
                    q_data["order_num"],
                    True
                )
            )
            question_id = cursor.fetchone()[0]
            conn.commit()
            
            # Crear opciones para preguntas de opcion multiple
            if q_data["question_type"] == "multiple_choice":
                for i, option_text in enumerate(options_data):
                    cursor.execute(
                        """
                        INSERT INTO options (
                            question_id, option_text, order_num
                        ) VALUES (
                            %s, %s, %s
                        )
                        """,
                        (
                            question_id,
                            option_text,
                            i+1
                        )
                    )
                conn.commit()
            
            print(f"Pregunta creada: {q_data['question_text']}")
        
        print(f"Encuesta creada: Encuesta de Prevencion de Desercion Estudiantil")
        
        return {"id": survey_id}
    except Exception as e:
        print(f"Error al crear encuesta: {e}")
        traceback.print_exc()
        conn.rollback()
        return None

def create_notifications(conn, cursor, users):
    """Crear notificaciones para los usuarios"""
    notification_types = ["success", "warning", "info"]
    notification_messages = [
        "Calificacion registrada: Matematicas Avanzadas",
        "Recordatorio: Entrega de proyecto final",
        "Nueva encuesta disponible",
        "Fecha limite de pago proxima",
        "Actualizacion de horario de clases"
    ]
    
    for user in users:
        try:
            if user["role"] == "ADMIN":
                continue  # Saltar administradores
            
            # Eliminar notificaciones existentes para este usuario
            cursor.execute("DELETE FROM notifications WHERE user_id = %s", (user["id"],))
            conn.commit()
            
            # Crear entre 2 y 4 notificaciones por usuario
            num_notifications = random.randint(2, 4)
            for _ in range(num_notifications):
                cursor.execute(
                    """
                    INSERT INTO notifications (
                        user_id, type, message, read, created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s
                    )
                    """,
                    (
                        user["id"],
                        random.choice(notification_types),
                        random.choice(notification_messages),
                        random.random() > 0.7,  # 30% de probabilidad de estar leida
                        datetime.now() - timedelta(days=random.randint(0, 10))
                    )
                )
                conn.commit()
                print(f"Notificacion creada para {user['email']}")
        except Exception as e:
            print(f"Error al crear notificacion para {user['email']}: {e}")
            traceback.print_exc()
            conn.rollback()

def main():
    """Funcion principal para poblar la base de datos"""
    try:
        # Obtener parámetros de conexión
        db_user, db_pass, db_host, db_port, db_name = get_connection_params()
        
        print("Conectando a la base de datos...")
        print(f"Host: {db_host}, Puerto: {db_port}, BD: {db_name}, Usuario: {db_user}")
        
        # Conectar a la base de datos
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_pass,
            host=db_host,
            port=db_port
        )
        
        # Crear cursor
        cursor = conn.cursor()
        
        print("Verificando conexion a la base de datos...")
        # Intentar ejecutar una consulta simple para verificar la conexion
        cursor.execute("SELECT 1")
        print("Conexion exitosa a la base de datos.")
        
        print("Iniciando poblacion de la base de datos...")
        
        # Intentar limpiar la base de datos primero
        try:
            clear_database(conn, cursor)
        except Exception as e:
            print(f"Error durante la limpieza de la base de datos: {e}")
            print("Continuando con el proceso de población...")
        
        # Crear datos
        users = create_users(conn, cursor)
        create_academic_records(conn, cursor, users)
        courses = create_courses(conn, cursor)
        create_enrollments(conn, cursor, users, courses)
        create_survey(conn, cursor)
        create_notifications(conn, cursor, users)
        
        print("Base de datos poblada exitosamente.")
        return True
    except Exception as e:
        print(f"Error inesperado: {e}")
        traceback.print_exc()
        return False
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)