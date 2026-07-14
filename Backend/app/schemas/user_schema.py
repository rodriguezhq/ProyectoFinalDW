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
    password: str | None = None
    id_estudiante: int | None = None
    id_docente: int | None = None
    nombres: str | None = None
    apellidos: str | None = None
    correo: str | None = None
    codigo: str | None = None
    dni: str | None = None
    id_facultad: int | None = None
    id_especialidad: int | None = None
    ciclo: int | None = None


class UsuarioCreateResponse(BaseModel):
    id_usuario: int
    username: str
    password_temporal: str
    id_rol: int


class UsuarioUpdateBody(BaseModel):
    estado: str | None = None
    id_rol: int | None = None
    nombres: str | None = None
    apellidos: str | None = None
    correo: str | None = None
    ciclo: int | None = None


class UsuarioResponse(BaseModel):
    id_usuario: int
    username: str
    estado: str
    id_rol: int
    rol: str | None
    nombres: str | None
    apellidos: str | None
    correo: str | None
    id_facultad: int | None = None
    facultad_nombre: str | None = None
    id_especialidad: int | None = None
    especialidad_nombre: str | None = None
    ciclo: int | None = None


class UsuarioListResponse(BaseModel):
    usuarios: list[UsuarioResponse]
    total: int
    page: int
    per_page: int
    hay_mas: bool


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
    total: int
    page: int
    per_page: int
    hay_mas: bool


# ---------------- Docente ----------------

class DocenteItem(BaseModel):
    id_docente: int
    codigo: str
    dni: str
    nombres: str
    apellidos: str
    correo: str | None = None
    telefono: str | None = None
    categoria: str | None = None
    condicion: str | None = None
    estado: str
    id_facultad: int


class DocenteListResponse(BaseModel):
    docentes: list[DocenteItem]

