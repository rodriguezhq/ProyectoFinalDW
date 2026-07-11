from app.models.auditoria import Auditoria
from app.models.curso import Curso
from app.models.docente import Docente
from app.models.documento import Documento
from app.models.especialidad import Especialidad
from app.models.estudiante import Estudiante
from app.models.facultad import Facultad
from app.models.matricula import Matricula
from app.models.matricula_detalle import MatriculaDetalle
from app.models.nota import Nota
from app.models.pago import Pago
from app.models.periodo_academico import PeriodoAcademico
from app.models.rol import Rol
from app.models.horario import Horario
from app.models.silabo import Silabo
from app.models.usuario import Usuario
from app.models.seccion import Seccion

__all__ = [
    "Facultad",
    "Especialidad",
    "Curso",
    "PeriodoAcademico",
    "Horario",
    "Rol",
    "Usuario",
    "Estudiante",
    "Docente",
    "Silabo",
    "Matricula",
    "MatriculaDetalle",
    "Pago",
    "Nota",
    "Documento",
    "Auditoria",
    "Seccion",
]
