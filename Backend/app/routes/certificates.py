from pydantic import BaseModel, Field
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from app.Controllers import certificateController
from app.schemas.certificate_schema import (
    DocumentoListResponse,
    DocumentoResponse,
    SolicitarDocumentoBody,
    DocumentoPath,
    VerificacionPath,
    VerificacionResponse,
)
from app.schemas.common_schema import MessageResponse
from app.utils.decorators import role_required

certificates_tag = Tag(
    name="Certificados y Documentos",
    description="Solicitud, autorización y emisión de certificados/constancias",
)
certificates_bp = APIBlueprint("certificates", __name__, abp_tags=[certificates_tag])


class DocumentosQuery(BaseModel):
    page: int = 1
    per_page: int = 10


@certificates_bp.get(
    "/verificar/<string:codigo_qr>",
    summary="Verificar autenticidad de un documento (endpoint público, sin login)",
    responses={200: VerificacionResponse, 404: MessageResponse},
)
def verificar(path: VerificacionPath):
    response, status = certificateController.verificar(path.codigo_qr)
    return response, status


@certificates_bp.post(
    "/",
    summary="Solicitar certificado/constancia",
    responses={201: DocumentoResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante")
def solicitar(body: SolicitarDocumentoBody):
    response, status = certificateController.solicitar(body)
    return response, status


@certificates_bp.post(
    "/<int:id_documento>/autorizar",
    summary="Autorizar emisión de documento",
    responses={200: DocumentoResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Direccion")
def autorizar(path: DocumentoPath):
    response, status = certificateController.autorizar(path.id_documento)
    return response, status


@certificates_bp.post(
    "/<int:id_documento>/emitir",
    summary="Emitir documento con código QR",
    responses={200: DocumentoResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def emitir(path: DocumentoPath):
    response, status = certificateController.emitir(path.id_documento)
    return response, status


@certificates_bp.get(
    "/mis-documentos",
    summary="Mis documentos solicitados",
    responses={200: DocumentoListResponse, 403: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante")
def mis_documentos(query: DocumentosQuery):
    response, status = certificateController.mis_documentos(query.page, query.per_page)
    return response, status


@certificates_bp.get(
    "/<int:id_documento>",
    summary="Ver detalle de un documento",
    responses={200: DocumentoResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante", "Administrador", "Direccion")
def detalle(path: DocumentoPath):
    response, status = certificateController.detalle(path.id_documento)
    return response, status


@certificates_bp.get(
    "/",
    summary="Listar todos los documentos",
    responses={200: DocumentoListResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador", "Direccion")
def listar_todos(query: DocumentosQuery):
    response, status = certificateController.listar_todos(query.page, query.per_page)
    return response, status


@certificates_bp.get(
    "/<int:id_documento>/pdf",
    summary="Descargar el PDF del documento emitido",
    responses={403: MessageResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Estudiante", "Administrador", "Direccion")
def descargar_pdf(path: DocumentoPath):
    return certificateController.pdf(path.id_documento)
