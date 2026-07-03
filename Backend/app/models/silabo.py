from app.extensions import db


class Silabo(db.Model):
    __tablename__ = "silabo"

    id_silabo = db.Column(db.Integer, primary_key=True)
    archivo = db.Column(db.String(255), nullable=False)
    fecha_subida = db.Column(db.DateTime, nullable=False, default=db.func.now())
    estado = db.Column(db.String(20), nullable=False, default="pendiente")
    id_seccion = db.Column(
        db.Integer, db.ForeignKey("seccion.id_seccion"), nullable=False, unique=True
    )

    seccion = db.relationship("Seccion", back_populates="silabo")
