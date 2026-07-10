from app.extensions import db


class Facultad(db.Model):
    __tablename__ = "facultad"

    id_facultad = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    id_decano = db.Column(db.Integer, db.ForeignKey("docente.id_docente"), nullable=True)

    decano = db.relationship("Docente", foreign_keys=[id_decano])
    especialidades = db.relationship("Especialidad", back_populates="facultad")
    docentes = db.relationship(
        "Docente", back_populates="facultad", foreign_keys="Docente.id_facultad"
    )
    cursos = db.relationship("Curso", back_populates="facultad")
