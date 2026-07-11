from app.extensions import db


class Docente(db.Model):
    __tablename__ = "docente"

    id_docente = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    dni = db.Column(db.String(15), unique=True, nullable=False)
    nombres = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    correo = db.Column(db.String(120), nullable=True)
    telefono = db.Column(db.String(20), nullable=True)
    categoria = db.Column(db.String(50), nullable=True)
    condicion = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="activo")
    # use_alter=True: le avisa a SQLAlchemy que esta FK forma un ciclo con
    # facultad.id_decano (a proposito, ver facultad.py) y que puede crearla/
    # borrarla por separado con ALTER TABLE, en vez de tirar un warning.
    id_facultad = db.Column(
        db.Integer, db.ForeignKey("facultad.id_facultad", use_alter=True), nullable=False
    )

    facultad = db.relationship(
        "Facultad", back_populates="docentes", foreign_keys=[id_facultad]
    )
    usuario = db.relationship("Usuario", back_populates="docente", uselist=False)

