import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv
import sys

# Cargar variables de entorno
load_dotenv()

def get_connection_params():
    """Obtener parámetros de conexión desde variables de entorno."""
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
        db_host = os.getenv("DB_HOST", "db")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "as_recoleccion_datos")
    
    return db_user, db_pass, db_host, db_port, db_name

def update_database():
    """Actualizar la base de datos para añadir la columna role a la tabla users."""
    db_user, db_pass, db_host, db_port, db_name = get_connection_params()
    
    print("Conectando a la base de datos...")
    print(f"Host: {db_host}, Puerto: {db_port}, BD: {db_name}, Usuario: {db_user}")
    
    conn = None
    cursor = None
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_pass,
            host=db_host,
            port=db_port
        )
        
        # Establecer nivel de aislamiento
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        # Crear cursor
        cursor = conn.cursor()
        
        print("Verificando si la columna role ya existe...")
        
        # Verificar si la columna role ya existe
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role';
        """)
        role_exists = cursor.fetchone() is not None
        
        # Verificar si el tipo enum ya existe
        cursor.execute("""
            SELECT typname FROM pg_type WHERE typname = 'userrole';
        """)
        enum_exists = cursor.fetchone() is not None
        
        # Añadir columna si no existe
        if not role_exists:
            print("Añadiendo columna 'role'...")
            
            # El enum ya existe, así que solo añadimos la columna
            cursor.execute("""
                ALTER TABLE users ADD COLUMN role userrole DEFAULT 'STUDENT';
            """)
            
            # Actualizar roles basados en is_admin
            print("Actualizando roles basados en is_admin...")
            cursor.execute("""
                UPDATE users SET role = 'ADMIN' WHERE is_admin = TRUE;
            """)
            
            print("Columna 'role' añadida correctamente.")
        else:
            print("La columna 'role' ya existe.")
        
        # Verificar si la columna last_login ya existe
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='last_login';
        """)
        last_login_exists = cursor.fetchone() is not None
        
        # Añadir columna last_login si no existe
        if not last_login_exists:
            print("Añadiendo columna 'last_login'...")
            cursor.execute("""
                ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
            """)
            print("Columna 'last_login' añadida correctamente.")
        else:
            print("La columna 'last_login' ya existe.")
        
        print("Operación completada con éxito.")
        
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    
    return True

if __name__ == "__main__":
    print("Iniciando actualización de la base de datos...")
    success = update_database()
    print("Proceso completado.")
    sys.exit(0 if success else 1)