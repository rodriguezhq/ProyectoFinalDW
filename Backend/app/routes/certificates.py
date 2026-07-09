from pydantic import BaseModel, Field
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from app.Controllers import certificateController
from app.schemas.certificate_schema import (
    DocumentoListResponse,
    DocumentoResponse,
    SolicitarDocumentoBody,
    DocumentoPath,
)
from app.schemas.common_schema import MessageResponse
from app.utils.decorators import role_required

certificates_tag = Tag(
    name="Certificados y Documentos",
    description="Solicitud, autorización y emisión de certificados/constancias",
)
certificates_bp = APIBlueprint("certificates", __name__, abp_tags=[certificates_tag])


@certificates_bp.post(
    "/",
    summary="Solicitar certificado/constancia",
    responses={201: DocumentoResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"cookie": []}],
)
@role_required("Estudiante")
def solicitar(body: SolicitarDocumentoBody):
    response, status = certificateController.solicitar(body)
    return response, status


@certificates_bp.post(
    "/<int:id_documento>/autorizar",
    summary="Autorizar emisión de documento",
    responses={200: DocumentoResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"cookie": []}],
)
@role_required("Direccion")
def autorizar(path: DocumentoPath):
    response, status = certificateController.autorizar(path.id_documento)
    return response, status


@certificates_bp.post(
    "/<int:id_documento>/emitir",
    summary="Emitir documento con código QR",
    responses={200: DocumentoResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"cookie": []}],
)
@role_required("Administrador")
def emitir(path: DocumentoPath):
    response, status = certificateController.emitir(path.id_documento)
    return response, status


@certificates_bp.get(
    "/mis-documentos",
    summary="Mis documentos solicitados",
    responses={200: DocumentoListResponse, 403: MessageResponse},
    security=[{"cookie": []}],
)
@role_required("Estudiante")
def mis_documentos():
    response, status = certificateController.mis_documentos()
    return response, status


@certificates_bp.get(
    "/<int:id_documento>",
    summary="Ver detalle de un documento",
    responses={200: DocumentoResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"cookie": []}],
)
@role_required("Estudiante", "Administrador", "Direccion")
def detalle(path: DocumentoPath):
    response, status = certificateController.detalle(path.id_documento)
    return response, status


@certificates_bp.get(
    "/",
    summary="Listar todos los documentos",
    responses={200: DocumentoListResponse},
    security=[{"cookie": []}],
)
@role_required("Administrador", "Direccion")
def listar_todos():
    response, status = certificateController.listar_todos()
    return response, status
