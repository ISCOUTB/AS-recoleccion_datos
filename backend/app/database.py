import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app.config import settings

# Crear engine con pool de conexiones adaptando a entorno
if settings.ENVIRONMENT == "development":
    # Para desarrollo, configuración simple
    engine = create_engine(
        settings.DATABASE_URL,
        echo=True,  # Mostrar queries SQL en consola (útil para desarrollo)
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800
    )
else:
    # Para producción, configuración más robusta
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=5,
        pool_timeout=30,
        pool_recycle=1800,
        echo=False  # No mostrar queries en producción
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Proporciona una sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Inicializa la base de datos creando todas las tablas definidas."""
    # Importar todos los modelos aquí para asegurarse de que estén registrados con Base
    from app.models.models import (
        User, AcademicRecord, Course, Enrollment, Survey, 
        Question, Option, SurveyResponse, AnswerDetail, Notification
    )
    
    # Verificar qué tablas ya existen
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print(f"Tablas existentes: {existing_tables}")
    print("Creando tablas que no existen...")
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    # Verificar nuevamente las tablas
    inspector = inspect(engine)
    updated_tables = inspector.get_table_names()
    
    print(f"Tablas después de la creación: {updated_tables}")
    print(f"Tablas creadas: {set(updated_tables) - set(existing_tables)}")
    
    return True