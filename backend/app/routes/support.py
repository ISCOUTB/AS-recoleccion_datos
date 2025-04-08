from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import User, SupportTicket, TicketAttachment
from app.schemas import TicketResponse
from app.auth.jwt import get_current_active_user
import os
import shutil
from uuid import uuid4

router = APIRouter()

@router.post("/ticket", status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    issue_type: str = Form(...),
    description: str = Form(...),
    priority: str = Form(...),
    contact_email: Optional[str] = Form(None),
    attachments: List[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea un nuevo ticket de soporte."""
    # Crear ticket
    ticket = SupportTicket(
        user_id=current_user.id if current_user else None,
        issue_type=issue_type,
        description=description,
        priority=priority,
        contact_email=contact_email or (current_user.email if current_user else None),
        status="abierto"
    )
    
    db.add(ticket)
    db.flush()  # Para obtener el ID del ticket
    
    # Procesar archivos adjuntos
    if attachments:
        # Crear directorio para archivos si no existe
        attachments_dir = os.path.join("static", "attachments")
        os.makedirs(attachments_dir, exist_ok=True)
        
        for attachment in attachments:
            if attachment.filename:
                # Generar nombre único para el archivo
                file_extension = os.path.splitext(attachment.filename)[1]
                attachment_filename = f"{uuid4()}{file_extension}"
                attachment_path = os.path.join(attachments_dir, attachment_filename)
                
                # Guardar archivo
                with open(attachment_path, "wb") as buffer:
                    shutil.copyfileobj(attachment.file, buffer)
                
                # Crear registro en la base de datos
                db_attachment = TicketAttachment(
                    ticket_id=ticket.id,
                    file_path=f"/static/attachments/{attachment_filename}",
                    original_filename=attachment.filename
                )
                
                db.add(db_attachment)
    
    db.commit()
    
    return {"message": "Ticket creado correctamente", "ticket_id": ticket.id}

@router.get("/tickets", response_model=List[TicketResponse])
async def get_user_tickets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene los tickets de soporte del usuario actual."""
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).all()
    return tickets

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket_detail(
    ticket_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene el detalle de un ticket específico."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket no encontrado"
        )
    
    # Verificar si el usuario es el propietario del ticket o es administrador
    if ticket.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este ticket"
        )
    
    return ticket
