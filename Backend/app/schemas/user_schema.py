from datetime import datetime

from pydantic import BaseModel


class UserData(BaseModel):
    id_usuario: int
    username: str
    nombres: str | None
    apellidos: str | None
    correo: str | None
    id_rol: int
    rol: str | None


# ---------------- Usuario (Administración) ----------------

class UsuarioCreateBody(BaseModel):
    username: str
    id_rol: int
    id_estudiante: int | None = None
    id_docente: int | None = None
    nombres: str | None = None
    apellidos: str | None = None
    correo: str | None = None


class UsuarioCreateResponse(BaseModel):
    id_usuario: int
    username: str
    password_temporal: str
    id_rol: int


class UsuarioUpdateBody(BaseModel):
    estado: str | None = None
    id_rol: int | None = None


class UsuarioResponse(BaseModel):
    id_usuario: int
    username: str
    estado: str
    id_rol: int
    rol: str | None
    nombres: str | None
    apellidos: str | None
    correo: str | None


class UsuarioListResponse(BaseModel):
    usuarios: list[UsuarioResponse]


# ---------------- Rol ----------------

class RolBody(BaseModel):
    nombre: str
    descripcion: str | None = None


class RolResponse(BaseModel):
    id_rol: int
    nombre: str
    descripcion: str | None


class RolListResponse(BaseModel):
    roles: list[RolResponse]


# ---------------- Auditoria ----------------

class AuditoriaItem(BaseModel):
    id_auditoria: int
    accion: str
    tabla: str
    registro: str | None
    fecha: datetime
    ip: str | None
    id_usuario: int | None
    usuario_nombre: str | None


class AuditoriaListResponse(BaseModel):
    auditorias: list[AuditoriaItem]
