"""
Script para añadir campos de perfil a la tabla users.
Este script debe ejecutarse manualmente después de respaldar la base de datos.
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener la URL de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/AS-recoleccion_datos")

# Parsear la URL de la base de datos
# Formato: postgresql://usuario:contraseña@host:puerto/nombre_db
db_parts = DATABASE_URL.replace("postgresql://", "").split("/")
db_name = db_parts[1]
db_conn_parts = db_parts[0].split("@")
db_user_pass = db_conn_parts[0].split(":")
db_user = db_user_pass[0]
db_pass = db_user_pass[1] if len(db_user_pass) > 1 else ""
db_host_port = db_conn_parts[1].split(":")
db_host = db_host_port[0]
db_port = db_host_port[1] if len(db_host_port) > 1 else "5432"

def main():
    print("Conectando a la base de datos...")
    
    # Conectar a la base de datos
    conn = psycopg2.connect(DATABASE_URL)

    
    # Establecer nivel de aislamiento
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    # Crear cursor
    cursor = conn.cursor()
    
    try:
        print("Verificando si las columnas ya existen...")
        
        # Verificar si la columna phone ya existe
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='phone';
        """)
        phone_exists = cursor.fetchone() is not None
        
        # Verificar si la columna bio ya existe
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='bio';
        """)
        bio_exists = cursor.fetchone() is not None
        
        # Verificar si la columna avatar_url ya existe
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='avatar_url';
        """)
        avatar_url_exists = cursor.fetchone() is not None
        
        # Añadir columnas que no existen
        if not phone_exists:
            print("Añadiendo columna 'phone'...")
            cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR;")
        else:
            print("La columna 'phone' ya existe.")
            
        if not bio_exists:
            print("Añadiendo columna 'bio'...")
            cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT;")
        else:
            print("La columna 'bio' ya existe.")
            
        if not avatar_url_exists:
            print("Añadiendo columna 'avatar_url'...")
            cursor.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR;")
        else:
            print("La columna 'avatar_url' ya existe.")
        
        print("Verificando si las tablas de soporte existen...")
        
        # Verificar si la tabla support_tickets existe
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name='support_tickets';
        """)
        support_tickets_exists = cursor.fetchone() is not None
        
        # Verificar si la tabla ticket_attachments existe
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name='ticket_attachments';
        """)
        ticket_attachments_exists = cursor.fetchone() is not None
        
        # Crear tablas de soporte si no existen
        if not support_tickets_exists:
            print("Creando tabla 'support_tickets'...")
            cursor.execute("""
                CREATE TABLE support_tickets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    issue_type VARCHAR NOT NULL,
                    description TEXT NOT NULL,
                    priority VARCHAR NOT NULL,
                    status VARCHAR NOT NULL,
                    contact_email VARCHAR,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                );
            """)
        else:
            print("La tabla 'support_tickets' ya existe.")
            
        if not ticket_attachments_exists:
            print("Creando tabla 'ticket_attachments'...")
            cursor.execute("""
                CREATE TABLE ticket_attachments (
                    id SERIAL PRIMARY KEY,
                    ticket_id INTEGER REFERENCES support_tickets(id),
                    file_path VARCHAR NOT NULL,
                    original_filename VARCHAR NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
        else:
            print("La tabla 'ticket_attachments' ya existe.")
        
        print("Operación completada con éxito.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
