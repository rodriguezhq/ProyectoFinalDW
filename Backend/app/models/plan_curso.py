from app.extensions import db


class PlanCurso(db.Model):
    __tablename__ = "plan_curso"
    __table_args__ = (db.UniqueConstraint("id_plan", "id_curso", name="uq_plan_curso"),)

    id_plan_curso = db.Column(db.Integer, primary_key=True)
    id_plan = db.Column(db.Integer, db.ForeignKey("plan_estudios.id_plan"), nullable=False)
    id_curso = db.Column(db.Integer, db.ForeignKey("curso.id_curso"), nullable=False)
    ciclo = db.Column(db.Integer, nullable=False)

    plan = db.relationship("PlanEstudios", back_populates="cursos_plan")
    curso = db.relationship("Curso", back_populates="planes")
    secciones = db.relationship("Seccion", back_populates="plan_curso")
