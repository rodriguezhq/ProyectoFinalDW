from app.extensions import db


class Pago(db.Model):
    __tablename__ = "pago"

    id_pago = db.Column(db.Integer, primary_key=True)
    fecha_pago = db.Column(db.DateTime, nullable=False, default=db.func.now())
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    metodo_pago = db.Column(db.String(30), nullable=True)
    codigo_operacion = db.Column(db.String(50), nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="pendiente")
    id_matricula = db.Column(
        db.Integer, db.ForeignKey("matricula.id_matricula"), nullable=False
    )

    matricula = db.relationship("Matricula", back_populates="pagos")
