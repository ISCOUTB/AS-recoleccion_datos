"""Add student data table and update user model

Revision ID: new_student_data
Revises: e41f6d8fc14f
Create Date: 2025-05-25 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'new_student_data'
down_revision: Union[str, None] = 'e41f6d8fc14f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Crear tabla student_data
    op.create_table(
        "student_data",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("codigo_antiguo", sa.String(), nullable=True),
        sa.Column("periodo_catalogo", sa.String(), nullable=True),
        sa.Column("programa", sa.String(), nullable=True),
        sa.Column("snies", sa.String(), nullable=True),
        sa.Column("pensum", sa.String(), nullable=True),
        sa.Column("expedida_en", sa.String(), nullable=True),
        sa.Column("fecha_exp_doc", sa.Date(), nullable=True),
        sa.Column("sexo", sa.String(), nullable=True),
        sa.Column("estado_civil", sa.String(), nullable=True),
        sa.Column("fecha_nacimiento", sa.Date(), nullable=True),
        sa.Column("ciudad1", sa.String(), nullable=True),
        sa.Column("direccion1", sa.String(), nullable=True),
        sa.Column("telefono1", sa.String(), nullable=True),
        sa.Column("ciudad2", sa.String(), nullable=True),
        sa.Column("direccion", sa.String(), nullable=True),
        sa.Column("nivel", sa.String(), nullable=True),
        sa.Column("cod_col", sa.String(), nullable=True),
        sa.Column("colegio", sa.String(), nullable=True),
        sa.Column("dir_colegio", sa.String(), nullable=True),
        sa.Column("ciudad_colegio", sa.String(), nullable=True),
        sa.Column("depto_colegio", sa.String(), nullable=True),
        sa.Column("municipio_colegio", sa.String(), nullable=True),
        sa.Column("pais_colegio", sa.String(), nullable=True),
        sa.Column("fecha_graduacion", sa.Date(), nullable=True),
        sa.Column("ptj_fisica", sa.Float(), nullable=True),
        sa.Column("ptj_quimica", sa.Float(), nullable=True),
        sa.Column("ptj_geografia", sa.Float(), nullable=True),
        sa.Column("ptj_ciencias_sociales", sa.Float(), nullable=True),
        sa.Column("ptj_sociales_ciudadano", sa.Float(), nullable=True),
        sa.Column("ptj_ciencias_naturales", sa.Float(), nullable=True),
        sa.Column("ptj_biologia", sa.Float(), nullable=True),
        sa.Column("ptj_filosofia", sa.Float(), nullable=True),
        sa.Column("ptj_lenguaje", sa.Float(), nullable=True),
        sa.Column("ptj_lectura_critica", sa.Float(), nullable=True),
        sa.Column("ptj_ingles", sa.Float(), nullable=True),
        sa.Column("ptj_historia", sa.Float(), nullable=True),
        sa.Column("ptj_matematicas", sa.Float(), nullable=True),
        sa.Column("icfes_antes_del_2000", sa.Boolean(), nullable=True),
        sa.Column("ecaes", sa.Float(), nullable=True),
        sa.Column("cod_estado", sa.String(), nullable=True),
        sa.Column("estado", sa.String(), nullable=True),
        sa.Column("cod_tipo", sa.String(), nullable=True),
        sa.Column("tipo_estudiante", sa.String(), nullable=True),
        sa.Column("pga_acumulado", sa.Float(), nullable=True),
        sa.Column("pga_acumulado_periodo_busqueda", sa.Float(), nullable=True),
        sa.Column("creditos_matriculados", sa.Integer(), nullable=True),
        sa.Column("creditos_intentadas", sa.Integer(), nullable=True),
        sa.Column("creditos_ganadas", sa.Integer(), nullable=True),
        sa.Column("creditos_pasadas", sa.Integer(), nullable=True),
        sa.Column("creditos_pga", sa.Integer(), nullable=True),
        sa.Column("puntos_calidad_pga", sa.Float(), nullable=True),
        sa.Column("promedio_periodo", sa.Float(), nullable=True),
        sa.Column("creditos_intentadas_periodo", sa.Integer(), nullable=True),
        sa.Column("creditos_ganadas_periodo", sa.Integer(), nullable=True),
        sa.Column("creditos_pasadas_periodo", sa.Integer(), nullable=True),
        sa.Column("creditos_pga_periodo", sa.Integer(), nullable=True),
        sa.Column("puntos_calidad_pga_periodo", sa.Float(), nullable=True),
        sa.Column("nro_materias_cursadas", sa.Integer(), nullable=True),
        sa.Column("nro_materias_reprobadas", sa.Integer(), nullable=True),
        sa.Column("nro_materias_aprobadas", sa.Integer(), nullable=True),
        sa.Column("nro_materias_matriculadas", sa.Integer(), nullable=True),
        sa.Column("nro_materias_finalizadas", sa.Integer(), nullable=True),
        sa.Column("situacion", sa.String(), nullable=True),
        sa.Column("estrato", sa.Integer(), nullable=True),
        sa.Column("becas", sa.String(), nullable=True),
        sa.Column("ceres", sa.String(), nullable=True),
        sa.Column("periodo_ingreso", sa.String(), nullable=True),
        sa.Column("peri_in_prog_vigente", sa.String(), nullable=True),
        sa.Column("is_validated", sa.Boolean(), nullable=True, default=False),
        sa.Column("validation_date", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_student_data_id"), "student_data", ["id"], unique=False)
    op.create_index(op.f("ix_student_data_codigo_antiguo"), "student_data", ["codigo_antiguo"], unique=False)
    
    # Agregar nuevas columnas a la tabla users
    op.add_column("users", sa.Column("student_data_id", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("data_validated", sa.Boolean(), nullable=True, default=False))
    op.add_column("users", sa.Column("validation_completed_at", sa.DateTime(timezone=True), nullable=True))
    
    # Crear foreign key constraint
    op.create_foreign_key(
        "fk_users_student_data_id",
        "users",
        "student_data",
        ["student_data_id"],
        ["id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Eliminar foreign key constraint
    op.drop_constraint("fk_users_student_data_id", "users", type_="foreignkey")
    
    # Eliminar columnas agregadas a users
    op.drop_column("users", "validation_completed_at")
    op.drop_column("users", "data_validated")
    op.drop_column("users", "student_data_id")
    
    # Eliminar tabla student_data
    op.drop_index(op.f("ix_student_data_codigo_antiguo"), table_name="student_data")
    op.drop_index(op.f("ix_student_data_id"), table_name="student_data")
    op.drop_table("student_data")
