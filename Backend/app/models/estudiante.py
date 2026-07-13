from app.extensions import db


class Estudiante(db.Model):
    __tablename__ = "estudiante"

    id_estudiante = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    dni = db.Column(db.String(15), unique=True, nullable=False)
    nombres = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(120), nullable=True)
    telefono = db.Column(db.String(20), nullable=True)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="activo")
    ciclo = db.Column(db.Integer, nullable=True, default=1)
    id_especialidad = db.Column(
        db.Integer, db.ForeignKey("especialidad.id_especialidad"), nullable=False
    )
    especialidad = db.relationship("Especialidad", back_populates="estudiantes")
    usuario = db.relationship("Usuario", back_populates="estudiante", uselist=False)
    matriculas = db.relationship("Matricula", back_populates="estudiante")
    documentos = db.relationship("Documento", back_populates="estudiante")
