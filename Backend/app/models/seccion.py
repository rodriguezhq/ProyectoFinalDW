from app.extensions import db


class Seccion(db.Model):
    __tablename__ = "seccion"

    id_seccion = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(5), nullable=False)
    horario = db.Column(db.String(100), nullable=True)
    aula = db.Column(db.String(50), nullable=True)
    capacidad = db.Column(db.Integer, nullable=False, default=30)
    estado = db.Column(db.String(20), nullable=False, default="abierta")
    id_curso = db.Column(
        db.Integer, db.ForeignKey("curso.id_curso"), nullable=False
    )
    id_docente = db.Column(db.Integer, db.ForeignKey("docente.id_docente"), nullable=True)
    id_periodo = db.Column(
        db.Integer, db.ForeignKey("periodo_academico.id_periodo"), nullable=False
    )

    curso = db.relationship("Curso", back_populates="secciones")
    docente = db.relationship("Docente", back_populates="secciones")
    periodo = db.relationship("PeriodoAcademico", back_populates="secciones")
    silabo = db.relationship("Silabo", back_populates="seccion", uselist=False)
    matricula_detalles = db.relationship("MatriculaDetalle", back_populates="seccion")
