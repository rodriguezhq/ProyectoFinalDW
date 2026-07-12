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
    OfertaAcademicaResponse,
    MatriculaBody,
    FichaMatriculaResponse,
    ConfirmarMatriculaAdminBody,
)
from app.utils.decorators import role_required

enrollment_tag = Tag(
    name="Matrícula", description="Solicitud, validación, pago y ficha de matrícula"
)
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
    responses={
        201: MatriculaResponse,
        403: MessageResponse,
        404: MessageResponse,
        409: MessageResponse,
    },
)
@role_required("Estudiante")
def solicitar(body: SolicitarMatriculaBody):
    response, status = enrollmentController.solicitar(body)
    return response, status


@enrollment_bp.get(
    "/",
    summary="Listar todas las matrículas (Administrador)",
    responses={200: MatriculaListResponse},
)
@role_required("Administrador", "Direccion")
def listar_todas(query: ListarMatriculasQuery):
    response, status = enrollmentController.listar_todas_matriculas_ctrl()
    return response, status


@enrollment_bp.get(
    "/<int:id_matricula>/detalle",
    summary="Obtener detalle de matrícula (Administrador)",
    responses={200: MatriculaResponse, 404: MessageResponse},
)
@role_required("Administrador")
def obtener_detalle(path: MatriculaPath):
    response, status = enrollmentController.obtener_detalle_matricula_ctrl(
        path.id_matricula
    )
    return response, status


@enrollment_bp.post(
    "/<int:id_matricula>/confirmar",
    summary="Confirmar y registrar pago opcional de matrícula (Administrador)",
    responses={200: MatriculaResponse, 404: MessageResponse, 409: MessageResponse},
)
@role_required("Administrador")
def confirmar_matricula(path: MatriculaPath, body: ConfirmarMatriculaAdminBody):
    response, status = enrollmentController.confirmar_matricula_admin_ctrl(
        path.id_matricula, body
    )
    return response, status


@enrollment_bp.get(
    "/mias",
    summary="Mis matrículas",
    responses={200: MatriculaListResponse, 403: MessageResponse},
)
@role_required("Estudiante")
def mias():
    response, status = enrollmentController.mis_matriculas()
    return response, status


class PagoPath(BaseModel):
    id_pago: int = Field(..., description="ID del pago")


@enrollment_bp.post(
    "/<int:id_matricula>/validar",
    summary="Validar requisitos de matrícula",
    responses={200: MatriculaResponse, 404: MessageResponse, 409: MessageResponse},
)
@role_required("Administrador")
def validar(path: MatriculaPath):
    response, status = enrollmentController.validar(path.id_matricula)
    return response, status


@enrollment_bp.post(
    "/<int:id_matricula>/rechazar",
    summary="Rechazar solicitud de matrícula",
    responses={200: MatriculaResponse, 404: MessageResponse, 409: MessageResponse},
)
@role_required("Administrador")
def rechazar(path: MatriculaPath):
    response, status = enrollmentController.rechazar(path.id_matricula)
    return response, status


@enrollment_bp.post(
    "/<int:id_matricula>/pago",
    summary="Registrar pago de matrícula",
    responses={201: PagoResponse, 404: MessageResponse, 409: MessageResponse},
)
@role_required("Administrador")
def pago(path: MatriculaPath, body: PagoBody):
    response, status = enrollmentController.pago(path.id_matricula, body)
    return response, status


@enrollment_bp.post(
    "/pago/<int:id_pago>/validar",
    summary="Validar/confirmar pago de matrícula",
    responses={200: PagoResponse, 404: MessageResponse, 409: MessageResponse},
)
@role_required("Administrador")
def validar_pago(path: PagoPath):
    response, status = enrollmentController.validar_pago_ctrl(path.id_pago)
    return response, status


@enrollment_bp.get(
    "/<int:id_matricula>/ficha",
    summary="Descargar ficha oficial (PDF)",
    responses={404: MessageResponse, 403: MessageResponse},
)
@role_required("Estudiante", "Administrador")
def ficha(path: MatriculaPath):
    return enrollmentController.ficha(path.id_matricula)


@enrollment_bp.get(
    "/estadisticas/<int:id_periodo>",
    summary="Estadísticas de matrícula del periodo",
    responses={200: EstadisticasResponse},
)
@role_required("Direccion")
def estadisticas(path: PeriodoPath):
    response, status = enrollmentController.estadisticas(path.id_periodo)
    return response, status


@enrollment_bp.get(
    "/oferta-academica",
    summary="Obtener oferta académica disponible para el estudiante",
    responses={
        200: OfertaAcademicaResponse,
        400: MessageResponse,
        403: MessageResponse,
    },
)
@role_required("Estudiante")
def obtener_oferta_academica():
    """Retorna la lista de asignaturas y secciones disponibles para matricularse en el periodo activo."""
    response, status = enrollmentController.obtener_oferta_academica_ctrl()
    return response, status


@enrollment_bp.post(
    "/matricular",
    summary="Registrar la matrícula del estudiante",
    responses={
        201: FichaMatriculaResponse,
        400: MessageResponse,
        403: MessageResponse,
        404: MessageResponse,
    },
)
@role_required("Estudiante")
def registrar_matricula(body: MatriculaBody):
    """Procesa e inscribe al estudiante en las secciones seleccionadas."""
    response, status = enrollmentController.registrar_matricula_estudiante_ctrl(body)
    return response, status


@enrollment_bp.get(
    "/matricula/<int:id_matricula>/pdf",
    summary="Descargar PDF de la Ficha de Matrícula",
    responses={403: MessageResponse, 404: MessageResponse},
)
@role_required("Estudiante", "Administrador", "Direccion")
def descargar_ficha_matricula_pdf(path: MatriculaPath):
    """Genera y descarga la Ficha de Matrícula en PDF."""
    return enrollmentController.descargar_ficha_matricula_pdf_ctrl(path.id_matricula)
