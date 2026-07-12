from app.extensions import db


class PeriodoAcademico(db.Model):
    __tablename__ = "periodo_academico"

    id_periodo = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="activo")
    es_matricula_activa = db.Column(db.Boolean, default=False, nullable=False)

    matriculas = db.relationship("Matricula", back_populates="periodo")
