from app.extensions import db


class Curso(db.Model):
    __tablename__ = "curso"

    id_curso = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    creditos = db.Column(db.Integer, nullable=False)
    horas_teoria = db.Column(db.Integer, nullable=False, default=0)
    horas_practica = db.Column(db.Integer, nullable=False, default=0)

    planes = db.relationship("PlanCurso", back_populates="curso")
