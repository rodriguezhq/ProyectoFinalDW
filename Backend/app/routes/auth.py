from pydantic import BaseModel

from flask_openapi3.blueprint import APIBlueprint
from app.services.auth_service import login_user

auth_bp = APIBlueprint("auth", __name__)


class LoginBody(BaseModel):
    username: str
    password: str


class UserData(BaseModel):
    id_usuario: int
    username: str
    nombres: str | None
    apellidos: str | None
    correo: str | None
    id_rol: int
    rol: str | None


class LoginResponse(BaseModel):
    msg: str
    access_token: str
    refresh_token: str
    user: UserData


class MessageResponse(BaseModel):
    msg: str


@auth_bp.post("/login", summary="Iniciar sesión", responses={200: LoginResponse, 401: MessageResponse})
def login(body: LoginBody):
    """Autentica un usuario y devuelve tokens JWT."""
    result = login_user(body.username, body.password)
    if not result:
        return {"msg": "Credenciales inválidas"}, 401
    return {"msg": "Login exitoso", **result}, 200


@auth_bp.post("/logout", summary="Cerrar sesión", responses={200: MessageResponse})
def logout():
    """Cierra la sesión del usuario."""
    return {"msg": "Logout exitoso"}, 200