from pydantic import BaseModel


class UserData(BaseModel):
    id_usuario: int
    username: str
    nombres: str | None
    apellidos: str | None
    correo: str | None
    id_rol: int
    rol: str | None
