import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from app.database import db_connection
from app.models.models import Base
from app.routes.users import router as users_router
from app.routes.dashboard import router as dashboard_router
from app.routes.surveys import router as surveys_router
from app.routes.support import router as support_router
from app.config import settings

# Crear tablas en la base de datos
Base.metadata.create_all(bind=db_connection.get_engine())

# Crear directorios para archivos estáticos si no existen
os.makedirs(os.path.join("static", "avatars"), exist_ok=True)
os.makedirs(os.path.join("static", "attachments"), exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar directorio de archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Incluir rutas
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(surveys_router, prefix="/api/surveys", tags=["surveys"])
app.include_router(support_router, prefix="/api/support", tags=["support"])
@app.get("/")
def read_root():
    return {
        "message": "Bienvenido al Sistema de Prevención de Deserción Estudiantil",
        "environment": settings.ENVIRONMENT,
        "documentation": f"{settings.API_BASE_URL}/docs"
    }

# Manejador de excepciones para rutas no encontradas
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=404,
        content={"detail": "La ruta solicitada no existe"}
    )

# Esto permite ejecutar el archivo directamente con python main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
