"""silabo_por_periodo

Revision ID: 2ac52a7baaf7
Revises: d46b6304ea31
Create Date: 2026-07-14 12:17:52.676437

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2ac52a7baaf7'
down_revision = 'd46b6304ea31'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Eliminar la restricción de FK de id_curso en silabo
    try:
        op.drop_constraint('silabo_ibfk_1', 'silabo', type_='foreignkey')
    except Exception as e:
        print(f"Advertencia al eliminar silabo_ibfk_1: {e}")

    # 2. Eliminar el índice único 'id_curso'
    try:
        op.drop_index('id_curso', table_name='silabo')
    except Exception as e:
        print(f"Advertencia al eliminar indice id_curso: {e}")

    # 3. Agregar la columna id_periodo (nullable por ahora: la tabla ya
    # puede tener filas, y una columna NOT NULL sin default falla en MySQL
    # en modo estricto si hay datos existentes).
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    columns = [col['name'] for col in inspector.get_columns('silabo')]
    if 'id_periodo' not in columns:
        op.add_column('silabo', sa.Column('id_periodo', sa.Integer(), nullable=True))

    # 3b. Rellenar los silabos existentes con el periodo activo (o, si no
    # hubiera ninguno activo, el mas reciente). Recien despues de esto se
    # puede volver la columna obligatoria.
    connection.execute(sa.text("""
        UPDATE silabo
        SET id_periodo = (
            SELECT id_periodo FROM periodo_academico
            ORDER BY es_matricula_activa DESC, id_periodo DESC
            LIMIT 1
        )
        WHERE id_periodo IS NULL
    """))
    op.alter_column('silabo', 'id_periodo', existing_type=sa.Integer(), nullable=False)

    # 4. Crear el constraint compuesto uq_silabo_periodo_curso
    op.create_unique_constraint('uq_silabo_periodo_curso', 'silabo', ['id_periodo', 'id_curso'])

    # 5. Crear la FK de id_curso de nuevo
    op.create_foreign_key('fk_silabo_curso', 'silabo', 'curso', ['id_curso'], ['id_curso'])

    # 6. Crear la FK de id_periodo
    op.create_foreign_key('fk_silabo_periodo', 'silabo', 'periodo_academico', ['id_periodo'], ['id_periodo'])


def downgrade():
    try:
        op.drop_constraint('fk_silabo_periodo', 'silabo', type_='foreignkey')
    except Exception as e:
        pass
    try:
        op.drop_constraint('fk_silabo_curso', 'silabo', type_='foreignkey')
    except Exception as e:
        pass
    try:
        op.drop_constraint('uq_silabo_periodo_curso', 'silabo', type_='unique')
    except Exception as e:
        pass
    try:
        op.drop_column('silabo', 'id_periodo')
    except Exception as e:
        pass
    try:
        op.create_index('id_curso', 'silabo', ['id_curso'], unique=True)
    except Exception as e:
        pass
    try:
        op.create_foreign_key('silabo_ibfk_1', 'silabo', 'curso', ['id_curso'], ['id_curso'])
    except Exception as e:
        pass
