from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Importar todos los modelos para que SQLAlchemy los registre
from app.models.models import Base, User, StudentData, AcademicRecord, Course, Enrollment, Survey, Question, Option, SurveyResponse, AnswerDetail, Notification, SupportTicket, TicketAttachment

# Importar rutas
from app.routes import users, surveys, support, dashboard
from app.routes import auth, admin

app = FastAPI(
    title="Sistema de Prevención de Deserción Estudiantil",
    description="API para el sistema de prevención de deserción estudiantil",
    version="2.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# Incluir rutas
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(surveys.router, prefix="/api/surveys", tags=["surveys"])
app.include_router(support.router, prefix="/api/support", tags=["support"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Sistema de Prevención de Deserción Estudiantil API v2.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "2.0.0"}
