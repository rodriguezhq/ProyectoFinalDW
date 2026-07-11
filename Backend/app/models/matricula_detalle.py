from app.extensions import db


class MatriculaDetalle(db.Model):
    __tablename__ = "matricula_detalle"
    __table_args__ = (
        db.UniqueConstraint("id_matricula", "id_curso", name="uq_matricula_curso"),
    )

    id_matricula_detalle = db.Column(db.Integer, primary_key=True)
    id_matricula = db.Column(
        db.Integer, db.ForeignKey("matricula.id_matricula"), nullable=False
    )
    id_seccion = db.Column(db.Integer, db.ForeignKey("seccion.id_seccion"), nullable=False)
    id_curso = db.Column(db.Integer, db.ForeignKey("curso.id_curso"), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="matriculado")

    matricula = db.relationship("Matricula", back_populates="detalles")
    seccion = db.relationship("Seccion")
    curso = db.relationship("Curso")
    nota = db.relationship("Nota", back_populates="matricula_detalle", uselist=False)
