from pydantic import BaseModel, field_validator


class PerfilResponse(BaseModel):
    id_usuario: int
    username: str
    nombres: str | None
    apellidos: str | None
    correo: str | None
    rol: str | None
    telefono: str | None


class PerfilUpdateBody(BaseModel):
    password_actual: str | None = None
    password: str | None = None
    telefono: str | None = None

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, v):
        if v is not None and v != "":
            if not v.isdigit() or len(v) != 9:
                raise ValueError("El teléfono debe tener exactamente 9 dígitos")
        return v
