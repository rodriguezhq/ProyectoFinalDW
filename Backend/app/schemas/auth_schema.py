from pydantic import BaseModel

from app.schemas.user_schema import UserData


class LoginBody(BaseModel):
    correo: str
    password: str


class LoginResponse(BaseModel):
    msg: str
    access_token: str
    refresh_token: str
    user: UserData


class ProfileUpdateBody(BaseModel):
    telefono: str | None = None
    password: str | None = None
    currentPassword: str | None = None


class ProfileResponse(BaseModel):
    id_usuario: int
    username: str
    nombres: str | None
    apellidos: str | None
    correo: str | None
    telefono: str | None
    rol: str | None
    id_estudiante: int | None = None
    id_docente: int | None = None
    ciclo: int | None = None

