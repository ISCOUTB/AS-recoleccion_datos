"""
Script para ejecutar el servidor local.
Ejecutar con: python run_local.py
"""
import uvicorn
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Obtener configuración
host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8000"))
env = os.getenv("ENVIRONMENT", "development")

if __name__ == "__main__":
    print(f"Iniciando servidor en modo {env}")
    print(f"Servidor disponible en http://{host}:{port}")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=env == "development"
    )