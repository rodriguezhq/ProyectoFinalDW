from pydantic import BaseModel


class PerfilResponse(BaseModel):
    id_usuario: int
    username: str
    nombres: str | None
    apellidos: str | None
    correo: str | None
    rol: str | None
    telefono: str | None


class PerfilUpdateBody(BaseModel):
    password: str | None = None
    telefono: str | None = None
