import os
from sqlalchemy import create_engine
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