from flask_openapi3.blueprint import APIBlueprint
from app.Controllers import authController
from app.schemas.auth_schema import LoginBody, LoginResponse
from flask_openapi3.models.tag import Tag
from app.schemas.common_schema import MessageResponse

auth_tag = Tag(name="Autenticación", description="login y Logout de usuarios")
auth_bp = APIBlueprint("auth", __name__, abp_tags=[auth_tag])


@auth_bp.post(
    "/login",
    summary="Iniciar sesión",
    responses={200: LoginResponse, 401: MessageResponse},
)
def login(body: LoginBody):
    return authController.login(body)


@auth_bp.post("/logout", summary="Cerrar sesión", responses={200: MessageResponse})
def logout():
    return authController.logout()
