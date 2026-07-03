from app.extensions import db


class Matricula(db.Model):
    __tablename__ = "matricula"
    __table_args__ = (
        db.UniqueConstraint("id_estudiante", "id_periodo", name="uq_matricula_estudiante_periodo"),
    )

    id_matricula = db.Column(db.Integer, primary_key=True)
    id_estudiante = db.Column(
        db.Integer, db.ForeignKey("estudiante.id_estudiante"), nullable=False
    )
    id_periodo = db.Column(
        db.Integer, db.ForeignKey("periodo_academico.id_periodo"), nullable=False
    )
    fecha_matricula = db.Column(db.DateTime, nullable=False, default=db.func.now())
    estado = db.Column(db.String(20), nullable=False, default="pendiente")

    estudiante = db.relationship("Estudiante", back_populates="matriculas")
    periodo = db.relationship("PeriodoAcademico", back_populates="matriculas")
    detalles = db.relationship("MatriculaDetalle", back_populates="matricula")
    pagos = db.relationship("Pago", back_populates="matricula")
