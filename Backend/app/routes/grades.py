from pydantic import BaseModel, Field

from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from app.schemas.grade_schema import (
    GradeBody,
    GradeResponse,
    GradeListResponse,
    MessageResponse,
    BulkGradeBody,
)
from app.Controllers import gradeController
from app.utils.decorators import role_required

grades_tag = Tag(name="Notas", description="Registro y consulta de notas académicas")
grades_bp = APIBlueprint("grades", __name__, abp_tags=[grades_tag])


class MatriculaDetallePath(BaseModel):
    id_matricula_detalle: int = Field(..., description="ID del detalle de matrícula")


class EstudiantePath(BaseModel):
    id_estudiante: int = Field(..., description="ID del estudiante")


class SeccionPath(BaseModel):
    id_seccion: int = Field(..., description="ID de la sección")


@grades_bp.post(
    "/<int:id_matricula_detalle>",
    summary="Registrar o actualizar notas",
    description="El docente registra las notas (parcial1, parcial2, final, sustitutorio) "
    "para un detalle de matrícula específico. El promedio se calcula automáticamente.",
    responses={200: GradeResponse, 404: MessageResponse},
    security=[{"cookie": []}],
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
    security=[{"cookie": []}],
)
@role_required("Estudiante", "Docente", "Administrador", "Direccion")
def consultar_notas_estudiante(path: EstudiantePath):
    """Consulta todas las notas de un estudiante."""
    response, status = gradeController.consultar_notas_estudiante(path.id_estudiante)
    return response, status


@grades_bp.get(
    "/seccion/<int:id_seccion>",
    summary="Consultar notas de una sección",
    description="Devuelve las notas de todos los estudiantes matriculados en "
    "una sección. Útil para que el docente vea su clase completa.",
    responses={200: GradeListResponse},
    security=[{"cookie": []}],
)
@role_required("Docente", "Administrador", "Direccion")
def consultar_notas_seccion(path: SeccionPath):
    """Consulta las notas de todos los estudiantes de una sección."""
    response, status = gradeController.consultar_notas_seccion(path.id_seccion)
    return response, status


@grades_bp.post(
    "/bulk",
    summary="Registrar o actualizar notas en lote",
    description="El docente registra las notas (parcial1, parcial2, final, sustitutorio) "
    "para varios detalles de matrícula a la vez.",
    responses={200: MessageResponse, 400: MessageResponse},
    security=[{"cookie": []}],
)
@role_required("Docente", "Administrador")
def registrar_notas_bulk(body: BulkGradeBody):
    """Registra o actualiza notas de varios estudiantes en lote."""
    response, status = gradeController.registrar_notas_bulk(body)
    return response, status

