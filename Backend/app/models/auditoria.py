from app.extensions import db


class Auditoria(db.Model):
    __tablename__ = "auditoria"

    id_auditoria = db.Column(db.Integer, primary_key=True)
    accion = db.Column(db.String(100), nullable=False)
    tabla = db.Column(db.String(50), nullable=False)
    registro = db.Column(db.String(50), nullable=True)
    fecha = db.Column(db.DateTime, nullable=False, default=db.func.now())
    ip = db.Column(db.String(45), nullable=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuario.id_usuario"), nullable=True)

    usuario = db.relationship("Usuario", back_populates="auditorias")
