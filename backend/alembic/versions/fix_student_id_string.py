"""Fix student ID to be string instead of integer

Revision ID: fix_student_id_string
Revises: new_student_data
Create Date: 2025-05-25 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_student_id_string'
down_revision: Union[str, None] = 'new_student_data'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Change student_data.id from Integer to String."""
    
    # Primero, eliminar la foreign key constraint
    op.drop_constraint("fk_users_student_data_id", "users", type_="foreignkey")
    
    # Cambiar el tipo de columna de student_data.id de Integer a String
    op.alter_column("student_data", "id", 
                   existing_type=sa.Integer(),
                   type_=sa.String(),
                   existing_nullable=False)
    
    # Cambiar el tipo de columna de users.student_data_id de Integer a String
    op.alter_column("users", "student_data_id",
                   existing_type=sa.Integer(),
                   type_=sa.String(),
                   existing_nullable=True)
    
    # Recrear la foreign key constraint
    op.create_foreign_key(
        "fk_users_student_data_id",
        "users",
        "student_data",
        ["student_data_id"],
        ["id"]
    )


def downgrade() -> None:
    """Downgrade schema - Change back to Integer (may lose data)."""
    
    # Eliminar foreign key constraint
    op.drop_constraint("fk_users_student_data_id", "users", type_="foreignkey")
    
    # Cambiar de vuelta a Integer (ADVERTENCIA: puede perder datos)
    op.alter_column("users", "student_data_id",
                   existing_type=sa.String(),
                   type_=sa.Integer(),
                   existing_nullable=True)
    
    op.alter_column("student_data", "id",
                   existing_type=sa.String(),
                   type_=sa.Integer(),
                   existing_nullable=False)
    
    # Recrear foreign key constraint
    op.create_foreign_key(
        "fk_users_student_data_id",
        "users",
        "student_data",
        ["student_data_id"],
        ["id"]
    )
