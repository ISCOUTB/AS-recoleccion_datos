import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import inspect, text

# Agregar el directorio raíz al path para importar los módulos de la aplicación
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import engine, Base, SessionLocal

# Verificar si las tablas existen usando SQLAlchemy
def check_tables():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f"Tablas existentes en SQLAlchemy: {existing_tables}")
    return existing_tables

# Crear tablas directamente con SQL
def create_tables_with_sql():
    # Extraer los componentes de la URL de la base de datos
    DATABASE_URL = settings.DATABASE_URL
    parts = DATABASE_URL.replace("postgresql://", "").split("@")
    credentials = parts[0].split(":")
    host_port_db = parts[1].split("/")
    host_port = host_port_db[0].split(":")

    user = credentials[0]
    password = credentials[1] if len(credentials) > 1 else ""
    host = host_port[0]
    port = host_port[1] if len(host_port) > 1 else "5432"
    dbname = host_port_db[1].split("?")[0]  # Eliminar parámetros adicionales

    print(f"Conectando a PostgreSQL: {host}:{port}/{dbname} como {user}")

    # Conectar a PostgreSQL
    conn = psycopg2.connect(
        user=user,
        password=password,
        host=host,
        port=port,
        dbname=dbname
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    # Crear las tablas
    tables = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE,
            student_id VARCHAR(50) UNIQUE,
            program VARCHAR(255),
            semester INTEGER,
            icfes_score INTEGER
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS academic_records (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            period VARCHAR(50),
            average_score FLOAT,
            credits_completed INTEGER,
            total_credits INTEGER,
            status VARCHAR(50),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            credits INTEGER,
            program VARCHAR(255)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS enrollments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            course_id INTEGER REFERENCES courses(id),
            period VARCHAR(50),
            grade FLOAT,
            status VARCHAR(50),
            enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS surveys (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            end_date TIMESTAMP WITH TIME ZONE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS questions (
            id SERIAL PRIMARY KEY,
            survey_id INTEGER REFERENCES surveys(id),
            question_text VARCHAR(255) NOT NULL,
            question_type VARCHAR(50),
            "order" INTEGER,
            required BOOLEAN DEFAULT TRUE
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS options (
            id SERIAL PRIMARY KEY,
            question_id INTEGER REFERENCES questions(id),
            option_text VARCHAR(255) NOT NULL,
            "order" INTEGER
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS survey_responses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            survey_id INTEGER REFERENCES surveys(id),
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS answer_details (
            id SERIAL PRIMARY KEY,
            response_id INTEGER REFERENCES survey_responses(id),
            question_id INTEGER REFERENCES questions(id),
            answer_text TEXT,
            selected_option_id INTEGER REFERENCES options(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            type VARCHAR(50),
            message VARCHAR(255) NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]

    print("Creando tablas en la base de datos...")
    for table_sql in tables:
        try:
            cursor.execute(table_sql)
            print(f"Tabla creada exitosamente.")
        except Exception as e:
            print(f"Error al crear tabla: {e}")

    # Verificar que las tablas existan
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    existing_tables = cursor.fetchall()
    print("\nTablas existentes en la base de datos:")
    for table in existing_tables:
        print(f"- {table[0]}")

    # Cerrar la conexión
    cursor.close()
    conn.close()

# Verificar si podemos acceder a la tabla academic_records
def test_academic_records_table():
    db = SessionLocal()
    try:
        # Intentar ejecutar una consulta directa
        result = db.execute(text("SELECT * FROM academic_records LIMIT 1"))
        rows = result.fetchall()
        print(f"Consulta exitosa a academic_records. Filas encontradas: {len(rows)}")
        return True
    except Exception as e:
        print(f"Error al consultar academic_records: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("Verificando tablas existentes...")
    existing_tables = check_tables()
    
    if "academic_records" not in existing_tables:
        print("La tabla academic_records no existe. Creando tablas con SQL directo...")
        create_tables_with_sql()
    
    print("\nVerificando acceso a la tabla academic_records...")
    if test_academic_records_table():
        print("\n¡ÉXITO! La tabla academic_records existe y es accesible.")
        print("Ahora puedes ejecutar el script de población de datos.")
    else:
        print("\nERROR: Todavía hay problemas con la tabla academic_records.")
        print("Intenta reiniciar la aplicación o verificar la conexión a la base de datos.")