from app.extensions import db


class Documento(db.Model):
    __tablename__ = "documento"

    id_documento = db.Column(db.Integer, primary_key=True)
    tipo_documento = db.Column(db.String(50), nullable=False)
    fecha_solicitud = db.Column(db.DateTime, nullable=False, default=db.func.now())
    fecha_emision = db.Column(db.DateTime, nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="solicitado")
    archivo = db.Column(db.String(255), nullable=True)
    codigo_qr = db.Column(db.String(255), nullable=True)
    id_estudiante = db.Column(
        db.Integer, db.ForeignKey("estudiante.id_estudiante"), nullable=False
    )
    id_usuario_emite = db.Column(
        db.Integer, db.ForeignKey("usuario.id_usuario"), nullable=True
    )
    id_usuario_autoriza = db.Column(
        db.Integer, db.ForeignKey("usuario.id_usuario"), nullable=True
    )

    estudiante = db.relationship("Estudiante", back_populates="documentos")
    usuario_emite = db.relationship(
        "Usuario", back_populates="documentos_emitidos", foreign_keys=[id_usuario_emite]
    )
    usuario_autoriza = db.relationship(
        "Usuario",
        back_populates="documentos_autorizados",
        foreign_keys=[id_usuario_autoriza],
    )
