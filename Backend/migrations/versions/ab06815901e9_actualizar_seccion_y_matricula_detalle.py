"""actualizar_seccion_y_matricula_detalle

Revision ID: ab06815901e9
Revises: 4d1c6f81bb44
Create Date: 2026-07-11 16:19:00.082470

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'ab06815901e9'
down_revision = '4d1c6f81bb44'
branch_labels = None
depends_on = None


def upgrade():
    # NOTA: la version original de esta migracion asumia que 'id_curso' se
    # eliminaba de matricula_detalle, pero el codigo actual (enrollment_service.py)
    # todavia escribe id_curso al crear una MatriculaDetalle, y el modelo sigue
    # declarando ambas columnas. Por eso esta migracion solo AGREGA id_seccion
    # (que el modelo si exige) sin tocar id_curso ni sus constraints existentes.
    with op.batch_alter_table('matricula_detalle', schema=None) as batch_op:
        batch_op.add_column(sa.Column('id_seccion', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_matricula_detalle_seccion', 'seccion', ['id_seccion'], ['id_seccion'])


def downgrade():
    with op.batch_alter_table('matricula_detalle', schema=None) as batch_op:
        batch_op.drop_constraint('fk_matricula_detalle_seccion', type_='foreignkey')
        batch_op.drop_column('id_seccion')
