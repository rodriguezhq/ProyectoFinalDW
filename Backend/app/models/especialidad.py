from app.extensions import db


class Especialidad(db.Model):
    __tablename__ = "especialidad"

    id_especialidad = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    id_facultad = db.Column(db.Integer, db.ForeignKey("facultad.id_facultad"), nullable=False)

    facultad = db.relationship("Facultad", back_populates="especialidades")
    estudiantes = db.relationship("Estudiante", back_populates="especialidad")
    cursos = db.relationship(
        "Curso",
        secondary="curso_especialidad",
        back_populates="especialidades"
    )
