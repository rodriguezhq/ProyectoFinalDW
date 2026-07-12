from pydantic import BaseModel, Field

from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from app.schemas.grade_schema import (
    GradeBody,
    GradeResponse,
    GradeListResponse,
    MessageResponse,
)
from app.Controllers import gradeController
from app.utils.decorators import role_required

grades_tag = Tag(name="Notas", description="Registro y consulta de notas académicas")
grades_bp = APIBlueprint("grades", __name__, abp_tags=[grades_tag])


class MatriculaDetallePath(BaseModel):
    id_matricula_detalle: int = Field(..., description="ID del detalle de matrícula")


class EstudiantePath(BaseModel):
    id_estudiante: int = Field(..., description="ID del estudiante")


class IdCursoPath(BaseModel):
    id_curso: int = Field(..., description="ID del curso")



@grades_bp.post(
    "/<int:id_matricula_detalle>",
    summary="Registrar o actualizar notas",
    description="El docente registra las notas (parcial1, parcial2, final, sustitutorio) "
    "para un detalle de matrícula específico. El promedio se calcula automáticamente.",
    responses={200: GradeResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Docente", "Administrador")
def registrar_notas(path: MatriculaDetallePath, body: GradeBody):
    """Registra o actualiza notas de un matricula_detalle."""
    response, status = gradeController.registrar_notas(path.id_matricula_detalle, body)
    return response, status


@grades_bp.get(
    "/estudiante/<int:id_estudiante>",
    summary="Consultar notas de un estudiante",
    description="Devuelve todas las notas del estudiante con info del curso, "
    "sección y periodo. Requiere autenticación JWT.",
    responses={200: GradeListResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante", "Docente", "Administrador", "Direccion")
def consultar_notas_estudiante(path: EstudiantePath):
    """Consulta todas las notas de un estudiante."""
    response, status = gradeController.consultar_notas_estudiante(path.id_estudiante)
    return response, status


@grades_bp.get(
    "/curso/<int:id_curso>",
    summary="Consultar notas de un curso",
    description="Devuelve las notas de todos los estudiantes matriculados en "
    "un curso. Útil para que el docente vea su clase completa.",
    responses={200: GradeListResponse},
    security=[{"jwt": []}],
)
@role_required("Docente", "Administrador", "Direccion")
def consultar_notas_curso(path: IdCursoPath):
    """Consulta las notas de todos los estudiantes de un curso."""
    response, status = gradeController.consultar_notas_curso(path.id_curso)
    return response, status


class PeriodoQuery(BaseModel):
    id_periodo: int = Field(..., description="ID del periodo académico")


class ActaPath(BaseModel):
    id_seccion: int = Field(..., description="ID de la sección")
    id_curso: int = Field(..., description="ID del curso")


@grades_bp.get(
    "/actas",
    summary="Listar actas del periodo académico",
    description="Devuelve el listado de clases con su estado de acta para el periodo especificado.",
    responses={200: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def listar_actas(query: PeriodoQuery):
    response, status = gradeController.obtener_actas_periodo(query.id_periodo)
    return response, status


@grades_bp.get(
    "/actas/seccion/<int:id_seccion>/curso/<int:id_curso>",
    summary="Obtener detalle de notas del acta",
    description="Devuelve la lista de estudiantes y sus notas para una sección y curso específicos.",
    responses={200: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def obtener_detalle_acta(path: ActaPath):
    response, status = gradeController.obtener_detalle_acta(path.id_seccion, path.id_curso)
    return response, status


@grades_bp.post(
    "/actas/seccion/<int:id_seccion>/curso/<int:id_curso>/validar",
    summary="Validar y consolidar notas del acta",
    description="Actualiza el estado de las notas a 'validada', bloqueando cambios.",
    responses={200: MessageResponse, 400: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def validar_acta(path: ActaPath):
    response, status = gradeController.validar_acta(path.id_seccion, path.id_curso)
    return response, status

