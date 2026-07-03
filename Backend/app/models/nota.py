from app.extensions import db


class Nota(db.Model):
    __tablename__ = "nota"

    id_nota = db.Column(db.Integer, primary_key=True)
    parcial1 = db.Column(db.Numeric(4, 2), nullable=True)
    parcial2 = db.Column(db.Numeric(4, 2), nullable=True)
    final = db.Column(db.Numeric(4, 2), nullable=True)
    sustitutorio = db.Column(db.Numeric(4, 2), nullable=True)
    promedio = db.Column(db.Numeric(4, 2), nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="registrada")
    id_matricula_detalle = db.Column(
        db.Integer,
        db.ForeignKey("matricula_detalle.id_matricula_detalle"),
        nullable=False,
        unique=True,
    )

    matricula_detalle = db.relationship("MatriculaDetalle", back_populates="nota")
