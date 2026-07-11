from app.extensions import db

class Seccion(db.Model):
    __tablename__ = "seccion"
    __table_args__ = (
        db.UniqueConstraint("id_periodo", "id_especialidad", "ciclo", "codigo", name="uq_seccion_ciclo"),
    )

    id_seccion = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(5), nullable=False) # Código de la sección (e.g. A, B, C)
    id_especialidad = db.Column(db.Integer, db.ForeignKey("especialidad.id_especialidad"), nullable=False) # Relación con la carrera
    ciclo = db.Column(db.Integer, nullable=False) # Ciclo académico (1 al 10)
    id_periodo = db.Column(db.Integer, db.ForeignKey("periodo_academico.id_periodo"), nullable=False) # Relación con el periodo académico

    # Relaciones SQLAlchemy
    especialidad = db.relationship("Especialidad")
    periodo = db.relationship("PeriodoAcademico")
