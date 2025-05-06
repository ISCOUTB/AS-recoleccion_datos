#import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
#from dotenv import load_dotenv
from app.config import settings

# Clase Singleton para la conexión a la base de datos
class DatabaseConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Inicializa la conexión a la base de datos."""
        # Crear engine con pool de conexiones adaptando a entorno
        if settings.ENVIRONMENT == "development":
            # Para desarrollo, configuración simple
            self.engine = create_engine(
                settings.DATABASE_URL,
                echo=True,  # Mostrar queries SQL en consola (útil para desarrollo)
                pool_size=5,
                max_overflow=2,
                pool_timeout=30,
                pool_recycle=1800
            )
        else:
            # Para producción, configuración más robusta
            self.engine = create_engine(
                settings.DATABASE_URL,
                pool_size=10,
                max_overflow=5,
                pool_timeout=30,
                pool_recycle=1800,
                echo=False  # No mostrar queries en producción
            )
        
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.Base = declarative_base()
        
        print("Conexión a la base de datos inicializada")
    
    def get_session(self):
        """Retorna una nueva sesión de base de datos."""
        return self.SessionLocal()
    
    def get_engine(self):
        """Retorna el engine de SQLAlchemy."""
        return self.engine
    
    def get_base(self):
        """Retorna la clase Base para los modelos ORM."""
        return self.Base
    
    def init_db(self):
        """Inicializa la base de datos creando todas las tablas definidas."""
        # Importar todos los modelos aquí para asegurarse de que estén registrados con Base
        from app.models.models import (
            User, AcademicRecord, Course, Enrollment, Survey, 
            Question, Option, SurveyResponse, AnswerDetail, Notification
        )
        
        # Verificar qué tablas ya existen
        inspector = inspect(self.engine)
        existing_tables = inspector.get_table_names()
        
        print(f"Tablas existentes: {existing_tables}")
        print("Creando tablas que no existen...")
        
        # Crear todas las tablas
        self.Base.metadata.create_all(bind=self.engine)
        
        # Verificar nuevamente las tablas
        inspector = inspect(self.engine)
        updated_tables = inspector.get_table_names()
        
        print(f"Tablas después de la creación: {updated_tables}")
        print(f"Tablas creadas: {set(updated_tables) - set(existing_tables)}")
        
        return True

# Crear una instancia única de la conexión a la base de datos
db_connection = DatabaseConnection()

# Exportar los elementos necesarios para mantener compatibilidad con el código existente
engine = db_connection.get_engine()
SessionLocal = db_connection.SessionLocal
Base = db_connection.get_base()

class DatabaseConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Inicializa la conexión a la base de datos."""
        # Crear engine con pool de conexiones adaptando a entorno
        if settings.ENVIRONMENT == "development":
            # Para desarrollo, configuración simple
            self.engine = create_engine(
                settings.DATABASE_URL,
                echo=True,  # Mostrar queries SQL en consola (útil para desarrollo)
                pool_size=5,
                max_overflow=2,
                pool_timeout=30,
                pool_recycle=1800
            )
        else:
            # Para producción, configuración más robusta
            self.engine = create_engine(
                settings.DATABASE_URL,
                pool_size=10,
                max_overflow=5,
                pool_timeout=30,
                pool_recycle=1800,
                echo=False  # No mostrar queries en producción
            )
        
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def get_engine(self):
        """Retorna la instancia del engine."""
        return self.engine
    
    def get_session(self):
        """Retorna una nueva sesión."""
        return self.SessionLocal()


# Instancia global del singleton
db_connection = DatabaseConnection()

def get_db():
    """Proporciona una sesión de base de datos."""
    db = db_connection.get_session()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Inicializa la base de datos creando todas las tablas definidas."""
    return db_connection.init_db()
