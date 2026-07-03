from app.extensions import db


class Rol(db.Model):
    __tablename__ = "rol"

    id_rol = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(30), unique=True, nullable=False)
    descripcion = db.Column(db.String(150), nullable=True)

    usuarios = db.relationship("Usuario", back_populates="rol")
