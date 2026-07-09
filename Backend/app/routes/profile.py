from flask_jwt_extended import jwt_required
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from app.Controllers import profileController
from app.schemas.common_schema import MessageResponse
from app.schemas.perfil_schema import PerfilResponse, PerfilUpdateBody

profile_tag = Tag(name="Perfil", description="Gestión del perfil del usuario autenticado")
profile_bp = APIBlueprint("profile", __name__, abp_tags=[profile_tag])


@profile_bp.get(
    "/",
    summary="Obtener perfil del usuario actual",
    responses={200: PerfilResponse, 401: MessageResponse, 404: MessageResponse},
    security=[{"cookie": []}],
)
@jwt_required()
def obtener_perfil():
    response, status = profileController.obtener_perfil_ctrl()
    return response, status


@profile_bp.put(
    "/",
    summary="Actualizar perfil (contraseña y/o teléfono)",
    responses={200: PerfilResponse, 401: MessageResponse, 404: MessageResponse},
    security=[{"cookie": []}],
)
@jwt_required()
def actualizar_perfil(body: PerfilUpdateBody):
    response, status = profileController.actualizar_perfil_ctrl(body)
    return response, status
