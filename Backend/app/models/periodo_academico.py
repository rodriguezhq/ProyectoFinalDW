from app.extensions import db


class PeriodoAcademico(db.Model):
    __tablename__ = "periodo_academico"

    id_periodo = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="activo")

    matriculas = db.relationship("Matricula", back_populates="periodo")
