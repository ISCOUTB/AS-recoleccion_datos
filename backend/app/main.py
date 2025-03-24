import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.models import Base
from app.routes.users import router as users_router
from app.config import settings

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,  # Deshabilitar docs en producción
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None  # Deshabilitar redoc en producción
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(users_router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido al Sistema de Prevención de Deserción Estudiantil",
        "environment": settings.ENVIRONMENT,
        "documentation": f"{settings.API_BASE_URL}/docs"
    }

# Esto permite ejecutar el archivo directamente con python main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )