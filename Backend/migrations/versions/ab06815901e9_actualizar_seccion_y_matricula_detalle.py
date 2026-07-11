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
    # Modificar la tabla matricula_detalle
    # 1. Crear primero el nuevo constraint único uq_matricula_seccion (soportará la FK matricula_detalle_ibfk_1)
    with op.batch_alter_table('matricula_detalle', schema=None) as batch_op:
        batch_op.create_unique_constraint('uq_matricula_seccion', ['id_matricula', 'id_seccion'])

    # 2. Ahora eliminar el índice antiguo uq_matricula_curso
    op.drop_index('uq_matricula_curso', table_name='matricula_detalle')
    
    # 3. Eliminar la columna id_curso y crear la FK para id_seccion
    with op.batch_alter_table('matricula_detalle', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_matricula_detalle_seccion', 'seccion', ['id_seccion'], ['id_seccion'])
        batch_op.drop_column('id_curso')


def downgrade():
    with op.batch_alter_table('matricula_detalle', schema=None) as batch_op:
        batch_op.add_column(sa.Column('id_curso', mysql.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint('fk_matricula_detalle_seccion', type_='foreignkey')
        batch_op.create_foreign_key('matricula_detalle_ibfk_2', 'curso', ['id_curso'], ['id_curso'])
        batch_op.drop_constraint('uq_matricula_seccion', type_='unique')
        batch_op.create_index('uq_matricula_curso', ['id_matricula', 'id_curso'], unique=True)
