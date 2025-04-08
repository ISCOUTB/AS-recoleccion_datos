import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
load_dotenv()

class Settings(BaseSettings):
    """Configuración de la aplicación."""
    # Entorno (development, production, testing)
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Información del proyecto
    PROJECT_NAME: str = "Sistema de Prevención de Deserción Estudiantil"
    PROJECT_VERSION: str = "1.0.0"
    
    # Configuración de la base de datos
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/AS-recoleccion_datos"
    )
    
    # Seguridad
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "local-dev-secret-key-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Configuración de CORS para desarrollo y producción
    CORS_ORIGINS: list = [
        "http://localhost:3000",  # React default
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # Permitir todas las origenes (solo para desarrollo)
    ]
    
    # Host y puerto para el servidor
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # URL base para el backend (útil para la configuración del frontend)
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    
    # Configuración para archivos
    UPLOAD_DIR: str = "static"
    AVATAR_DIR: str = "static/avatars"
    ATTACHMENTS_DIR: str = "static/attachments"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Crear instancia de configuración global
settings = Settings()

def get_settings():
    return settings
