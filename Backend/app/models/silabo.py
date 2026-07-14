from app.extensions import db


class Silabo(db.Model):
    __tablename__ = "silabo"
    __table_args__ = (
        db.UniqueConstraint("id_periodo", "id_curso", name="uq_silabo_periodo_curso"),
    )

    id_silabo = db.Column(db.Integer, primary_key=True)
    archivo = db.Column(db.String(255), nullable=False)
    fecha_subida = db.Column(db.DateTime, nullable=False, default=db.func.now())
    estado = db.Column(db.String(20), nullable=False, default="pendiente")
    id_curso = db.Column(
        db.Integer, db.ForeignKey("curso.id_curso"), nullable=False
    )
    id_periodo = db.Column(
        db.Integer, db.ForeignKey("periodo_academico.id_periodo"), nullable=False
    )

    curso = db.relationship("Curso")
    periodo = db.relationship("PeriodoAcademico")

