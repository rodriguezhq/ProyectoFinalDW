from app.extensions import db

# Tabla de asociación para la relación autorreferencial de prerrequisitos (N a N)
curso_prerrequisito = db.Table(
    "curso_prerrequisito",
    db.Column("id_curso", db.Integer, db.ForeignKey("curso.id_curso"), primary_key=True),
    db.Column("id_prerrequisito", db.Integer, db.ForeignKey("curso.id_curso"), primary_key=True)
)

# Tabla de asociación para vincular cursos con especialidades (carreras)
curso_especialidad = db.Table(
    "curso_especialidad",
    db.Column("id_curso", db.Integer, db.ForeignKey("curso.id_curso"), primary_key=True),
    db.Column("id_especialidad", db.Integer, db.ForeignKey("especialidad.id_especialidad"), primary_key=True)
)


class Curso(db.Model):
    __tablename__ = "curso"

    id_curso = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    creditos = db.Column(db.Integer, nullable=False)
    horas_teoria = db.Column(db.Integer, nullable=False, default=0)
    horas_practica = db.Column(db.Integer, nullable=False, default=0)
    ciclo = db.Column(db.Integer, nullable=False, default=1)
    id_facultad = db.Column(db.Integer, db.ForeignKey("facultad.id_facultad"), nullable=False)

    facultad = db.relationship("Facultad", back_populates="cursos")

    # Relación de prerrequisitos (un curso puede tener más de un prerrequisito)
    prerrequisitos = db.relationship(
        "Curso",
        secondary=curso_prerrequisito,
        primaryjoin="Curso.id_curso==curso_prerrequisito.c.id_curso",
        secondaryjoin="Curso.id_curso==curso_prerrequisito.c.id_prerrequisito",
        backref="es_prerrequisito_de"
    )

    # Relación de especialidades (un curso puede estar en varias carreras/especialidades)
    especialidades = db.relationship(
        "Especialidad",
        secondary=curso_especialidad,
        back_populates="cursos"
    )


