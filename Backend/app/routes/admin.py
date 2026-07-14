from pydantic import BaseModel

from flask_jwt_extended import jwt_required
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from app.Controllers import auditController, userController
from app.schemas.common_schema import MessageResponse
from app.schemas.user_schema import (
    AuditoriaListResponse,
    RolBody,
    RolListResponse,
    RolResponse,
    UsuarioCreateBody,
    UsuarioCreateResponse,
    UsuarioListResponse,
    UsuarioResponse,
    UsuarioUpdateBody,
    DocenteListResponse,
)
from app.utils.decorators import role_required

admin_tag = Tag(name="Administración y Seguridad", description="Usuarios, roles y auditoría")
admin_bp = APIBlueprint("admin", __name__, abp_tags=[admin_tag])


class UsuarioPath(BaseModel):
    id_usuario: int


class AuditoriaQuery(BaseModel):
    id_usuario: int | None = None
    accion: str | None = None
    page: int = 1
    per_page: int = 50


class UsuariosQuery(BaseModel):
    page: int = 1
    per_page: int = 10
    rol: str | None = None
    nombre: str | None = None
    id_facultad: int | None = None
    ciclo: int | None = None


@admin_bp.post(
    "/usuarios",
    responses={201: UsuarioCreateResponse, 400: MessageResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def crear_usuario(body: UsuarioCreateBody):
    response, status = userController.crear_usuario_ctrl(body)
    return response, status


@admin_bp.get("/usuarios", responses={200: UsuarioListResponse}, security=[{"jwt": []}])
@role_required("Administrador", "Direccion")
def listar_usuarios(query: UsuariosQuery):
    response, status = userController.listar_usuarios_ctrl(
        query.page, query.per_page, query.rol, query.nombre, query.id_facultad, query.ciclo
    )
    return response, status


@admin_bp.put(
    "/usuarios/<int:id_usuario>", responses={200: UsuarioResponse, 404: MessageResponse}, security=[{"jwt": []}]
)
@role_required("Administrador")
def actualizar_usuario(path: UsuarioPath, body: UsuarioUpdateBody):
    response, status = userController.actualizar_usuario_ctrl(path.id_usuario, body)
    return response, status


@admin_bp.post("/roles", responses={201: RolResponse, 409: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def crear_rol(body: RolBody):
    response, status = userController.crear_rol_ctrl(body)
    return response, status


@admin_bp.get("/roles", responses={200: RolListResponse}, security=[{"jwt": []}])
@jwt_required()
def listar_roles():
    response, status = userController.listar_roles_ctrl()
    return response, status


@admin_bp.get("/auditoria", responses={200: AuditoriaListResponse}, security=[{"jwt": []}])
@role_required("Direccion")
def listar_auditoria(query: AuditoriaQuery):
    response, status = auditController.listar_auditoria_ctrl(
        query.id_usuario, query.accion, query.page, query.per_page
    )
    return response, status


@admin_bp.get("/docentes", responses={200: DocenteListResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def listar_docentes():
    # Retorna la lista de docentes registrados en el sistema
    response, status = userController.listar_docentes_ctrl()
    return response, status

