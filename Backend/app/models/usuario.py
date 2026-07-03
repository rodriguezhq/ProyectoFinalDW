from app.extensions import db


class Usuario(db.Model):
    __tablename__ = "usuario"

    id_usuario = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="activo")
    id_rol = db.Column(db.Integer, db.ForeignKey("rol.id_rol"), nullable=False)
    id_estudiante = db.Column(
        db.Integer, db.ForeignKey("estudiante.id_estudiante"), nullable=True, unique=True
    )
    id_docente = db.Column(
        db.Integer, db.ForeignKey("docente.id_docente"), nullable=True, unique=True
    )
    nombres = db.Column(db.String(100), nullable=True)
    apellidos = db.Column(db.String(100), nullable=True)
    correo = db.Column(db.String(120), nullable=True)

    rol = db.relationship("Rol", back_populates="usuarios")
    estudiante = db.relationship("Estudiante", back_populates="usuario")
    docente = db.relationship("Docente", back_populates="usuario")
    documentos_emitidos = db.relationship(
        "Documento",
        back_populates="usuario_emite",
        foreign_keys="Documento.id_usuario_emite",
    )
    documentos_autorizados = db.relationship(
        "Documento",
        back_populates="usuario_autoriza",
        foreign_keys="Documento.id_usuario_autoriza",
    )
    auditorias = db.relationship("Auditoria", back_populates="usuario")
