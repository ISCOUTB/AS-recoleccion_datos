"""
Script mejorado para crear la base de datos local para desarrollo.
Ejecutar con: python create_local_db.py
"""
import os
import sys
import subprocess
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def create_database():
    """Crea la base de datos local con mejor manejo de errores y feedback"""
    db_url = os.getenv("DATABASE_URL", "")
    
    if not db_url:
        print("Error: DATABASE_URL no está definido en el archivo .env")
        print("Por favor, configura la variable DATABASE_URL en tu archivo .env")
        sys.exit(1)
    
    print(f"URL de la base de datos: {db_url}")
    
    # Extraer componentes del URL de la base de datos
    # Formato típico: postgresql://usuario:contraseña@host:puerto/nombre_db
    try:
        # Dividir la URL para obtener las partes
        parts = db_url.split("//")[1].split("@")
        user_pass = parts[0].split(":")
        host_db = parts[1].split("/")
        
        username = user_pass[0]
        # La contraseña puede contener caracteres especiales, así que la extraemos con cuidado
        password = user_pass[1] if len(user_pass) > 1 else ""
        
        host_port = host_db[0].split(":")
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else "5432"
        
        db_name = host_db[1]
        
        print(f"Usuario: {username}")
        print(f"Host: {host}")
        print(f"Puerto: {port}")
        print(f"Base de datos: {db_name}")
        
    except Exception as e:
        print(f"Error al analizar DATABASE_URL: {e}")
        print("Asegúrate de que DATABASE_URL tenga el formato: postgresql://usuario:contraseña@host:puerto/nombre_db")
        sys.exit(1)
    
    # Configurar variables de entorno para psql
    env_vars = os.environ.copy()
    if password:
        env_vars["PGPASSWORD"] = password
    
    try:
        # Verificar si podemos conectarnos a PostgreSQL
        print("\nVerificando conexión a PostgreSQL...")
        check_connection_cmd = ["psql", "-h", host, "-U", username, "-p", port, "-c", "SELECT version();"]
        
        connection_process = subprocess.run(
            check_connection_cmd, 
            env=env_vars,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if connection_process.returncode != 0:
            print("Error al conectar a PostgreSQL:")
            print(connection_process.stderr)
            sys.exit(1)
        
        print("Conexión a PostgreSQL exitosa.")
        
        # Verificar si la base de datos ya existe
        print(f"\nVerificando si la base de datos '{db_name}' ya existe...")
        check_db_cmd = ["psql", "-h", host, "-U", username, "-p", port, "-lqt"]
        
        db_check_process = subprocess.run(
            check_db_cmd,
            env=env_vars,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if db_check_process.returncode != 0:
            print("Error al verificar bases de datos existentes:")
            print(db_check_process.stderr)
            sys.exit(1)
        
        # Buscar la base de datos en la lista
        if f"| {db_name} |" in db_check_process.stdout:
            print(f"La base de datos '{db_name}' ya existe.")
            return
        
        # Crear la base de datos
        print(f"\nCreando base de datos '{db_name}'...")
        create_db_cmd = ["createdb", "-h", host, "-U", username, "-p", port, db_name]
        
        create_process = subprocess.run(
            create_db_cmd,
            env=env_vars,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if create_process.returncode != 0:
            print(f"Error al crear la base de datos '{db_name}':")
            print(create_process.stderr)
            sys.exit(1)
        
        print(f"Base de datos '{db_name}' creada exitosamente.")
        
    except Exception as e:
        print(f"Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=== Creación de Base de Datos Local ===")
    create_database()
    print("\n¡Proceso completado!")