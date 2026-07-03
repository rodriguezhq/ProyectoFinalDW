from app.extensions import db


class PlanEstudios(db.Model):
    __tablename__ = "plan_estudios"

    id_plan = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    version = db.Column(db.String(20), nullable=False)
    fecha_aprobacion = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="vigente")
    id_especialidad = db.Column(
        db.Integer, db.ForeignKey("especialidad.id_especialidad"), nullable=False
    )

    especialidad = db.relationship("Especialidad", back_populates="planes_estudio")
    cursos_plan = db.relationship("PlanCurso", back_populates="plan")
