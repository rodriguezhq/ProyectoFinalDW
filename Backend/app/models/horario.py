from app.extensions import db

class Horario(db.Model):
    __tablename__ = "horario"
    __table_args__ = (
        db.UniqueConstraint("id_periodo", "id_facultad", "id_especialidad", "ciclo", name="uq_horario_ciclo"),
    )

    id_horario = db.Column(db.Integer, primary_key=True)
    id_periodo = db.Column(db.Integer, db.ForeignKey("periodo_academico.id_periodo"), nullable=False)
    id_facultad = db.Column(db.Integer, db.ForeignKey("facultad.id_facultad"), nullable=False)
    id_especialidad = db.Column(db.Integer, db.ForeignKey("especialidad.id_especialidad"), nullable=False)
    ciclo = db.Column(db.Integer, nullable=False)
    detalles = db.Column(db.JSON, nullable=False, default=[]) # Almacena la lista de bloques de horario en formato JSON
    estado = db.Column(db.String(20), nullable=False, default="activo")

    periodo = db.relationship("PeriodoAcademico")
    facultad = db.relationship("Facultad")
    especialidad = db.relationship("Especialidad")
