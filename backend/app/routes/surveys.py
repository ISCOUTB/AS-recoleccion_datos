from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, Survey, Question, Option, SurveyResponse, AnswerDetail, Notification
from app.schemas import SurveyResponse as SurveyResponseSchema, SurveyDetail, SurveySubmission
from app.auth.jwt import get_current_active_user

router = APIRouter()

@router.get("/active", response_model=List[SurveyResponseSchema])
def get_active_surveys(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Obtiene las encuestas activas disponibles para el usuario."""
    surveys = db.query(Survey).filter(Survey.is_active == True).all()
    return surveys

@router.get("/{survey_id}", response_model=SurveyDetail)
def get_survey_detail(
    survey_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene los detalles de una encuesta específica."""
    survey = db.query(Survey).filter(Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuesta no encontrada"
        )
    
    # Verificar si el usuario ya completó esta encuesta
    existing_response = db.query(SurveyResponse).filter(
        SurveyResponse.user_id == current_user.id,
        SurveyResponse.survey_id == survey_id
    ).first()
    
    if existing_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has completado esta encuesta"
        )
    
    return survey

@router.post("/{survey_id}/submit", status_code=status.HTTP_201_CREATED)
def submit_survey(
    survey_id: int,
    submission: SurveySubmission,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Envía las respuestas de una encuesta."""
    # Verificar si la encuesta existe y está activa
    survey = db.query(Survey).filter(Survey.id == survey_id, Survey.is_active == True).first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuesta no encontrada o inactiva"
        )
    
    # Verificar si el usuario ya completó esta encuesta
    existing_response = db.query(SurveyResponse).filter(
        SurveyResponse.user_id == current_user.id,
        SurveyResponse.survey_id == survey_id
    ).first()
    
    if existing_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has completado esta encuesta"
        )
    
    # Crear registro de respuesta
    survey_response = SurveyResponse(
        user_id=current_user.id,
        survey_id=survey_id
    )
    db.add(survey_response)
    db.flush()  # Para obtener el ID generado
    
    # Guardar detalles de respuestas
    for answer in submission.answers:
        answer_detail = AnswerDetail(
            response_id=survey_response.id,
            question_id=answer.question_id,
            answer_text=answer.answer_text,
            selected_option_id=answer.selected_option_id
        )
        db.add(answer_detail)
    
    db.commit()
    
    # Crear notificación para el usuario
    notification = Notification(
        user_id=current_user.id,
        type="success",
        message=f"Has completado la encuesta: {survey.title}"
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Encuesta enviada correctamente"}

