from pydantic import BaseModel, Field
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from app.Controllers import periodController
from app.schemas.period_schema import (
    PeriodoCreateBody,
    PeriodoResponse,
    PeriodoListResponse,
)
from app.schemas.common_schema import MessageResponse
from app.utils.decorators import role_required

period_tag = Tag(
    name="Periodos Académicos",
    description="Gestión administrativa de los semestres y periodos de estudio",
)
period_bp = APIBlueprint("period", __name__, abp_tags=[period_tag])


class PeriodoPath(BaseModel):
    id_periodo: int = Field(..., description="ID del periodo académico")


@period_bp.post(
    "/",
    summary="Crear nuevo periodo académico",
    responses={201: PeriodoResponse, 409: MessageResponse},
)
@role_required("Administrador")
def crear_periodo(body: PeriodoCreateBody):
    """Crea un nuevo periodo académico con estado por defecto cerrado."""
    response, status = periodController.crear_periodo_ctrl(body)
    return response, status


@period_bp.get(
    "/",
    summary="Listar todos los periodos académicos",
    responses={200: PeriodoListResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador", "Direccion")
def listar_periodos():
    """Retorna la lista completa de todos los periodos académicos."""
    response, status = periodController.listar_periodos_ctrl()
    return response, status


@period_bp.post(
    "/<int:id_periodo>/activar",
    summary="Activar periodo y cerrar el anterior en cascada",
    responses={200: PeriodoResponse, 404: MessageResponse, 400: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def activar_periodo(path: PeriodoPath):
    """Activa el periodo especificado, cerrando automáticamente el periodo anterior y sus secciones."""
    response, status = periodController.activar_periodo_ctrl(path.id_periodo)
    return response, status


@period_bp.post(
    "/<int:id_periodo>/establecer-matricula",
    summary="Establecer periodo principal para matricula de estudiantes",
    responses={200: PeriodoResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def establecer_matricula_principal(path: PeriodoPath):
    """Establece el periodo especificado como el periodo principal para la matricula de los estudiantes."""
    response, status = periodController.establecer_matricula_principal_ctrl(
        path.id_periodo
    )
    return response, status


@period_bp.post(
    "/<int:id_periodo>/desactivar",
    summary="Cerrar/desactivar periodo académico",
    responses={200: PeriodoResponse, 404: MessageResponse, 400: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def desactivar_periodo(path: PeriodoPath):
    """Cierra el periodo especificado desactivando también su matrícula si correspondía."""
    response, status = periodController.desactivar_periodo_ctrl(path.id_periodo)
    return response, status
