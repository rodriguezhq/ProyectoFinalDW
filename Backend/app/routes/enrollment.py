from pydantic import BaseModel, Field

from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from app.Controllers import enrollmentController
from app.schemas.common_schema import MessageResponse
from app.schemas.enrollment_schema import (
    EstadisticasResponse,
    MatriculaListResponse,
    MatriculaResponse,
    PagoBody,
    PagoResponse,
    SolicitarMatriculaBody,
)
from app.utils.decorators import role_required

enrollment_tag = Tag(name="Matrícula", description="Solicitud, validación, pago y ficha de matrícula")
enrollment_bp = APIBlueprint("enrollment", __name__, abp_tags=[enrollment_tag])


class MatriculaPath(BaseModel):
    id_matricula: int = Field(..., description="ID de la matrícula (cabecera)")


class PeriodoPath(BaseModel):
    id_periodo: int = Field(..., description="ID del periodo académico")


class ListarMatriculasQuery(BaseModel):
    id_periodo: int | None = None
    estado: str | None = None


@enrollment_bp.post(
    "/",
    summary="Solicitar matrícula",
    responses={201: MatriculaResponse, 403: MessageResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante")
def solicitar(body: SolicitarMatriculaBody):
    response, status = enrollmentController.solicitar(body)
    return response, status


@enrollment_bp.get(
    "/",
    summary="Listar todas las matrículas (Administrador)",
    responses={200: MatriculaListResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def listar_todas(query: ListarMatriculasQuery):
    response, status = enrollmentController.listar_todas(query.id_periodo, query.estado)
    return response, status


@enrollment_bp.get(
    "/mias",
    summary="Mis matrículas",
    responses={200: MatriculaListResponse, 403: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante")
def mias():
    response, status = enrollmentController.mis_matriculas()
    return response, status


@enrollment_bp.post(
    "/<int:id_matricula>/validar",
    summary="Validar requisitos de matrícula",
    responses={200: MatriculaResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def validar(path: MatriculaPath):
    response, status = enrollmentController.validar(path.id_matricula)
    return response, status


@enrollment_bp.post(
    "/<int:id_matricula>/pago",
    summary="Registrar pago de matrícula",
    responses={201: PagoResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def pago(path: MatriculaPath, body: PagoBody):
    response, status = enrollmentController.pago(path.id_matricula, body)
    return response, status


@enrollment_bp.get(
    "/<int:id_matricula>/ficha",
    summary="Descargar ficha oficial (PDF)",
    responses={404: MessageResponse, 403: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante", "Administrador")
def ficha(path: MatriculaPath):
    return enrollmentController.ficha(path.id_matricula)


@enrollment_bp.get(
    "/estadisticas/<int:id_periodo>",
    summary="Estadísticas de matrícula del periodo",
    responses={200: EstadisticasResponse},
    security=[{"jwt": []}],
)
@role_required("Direccion")
def estadisticas(path: PeriodoPath):
    response, status = enrollmentController.estadisticas(path.id_periodo)
    return response, status
