from datetime import date

from pydantic import BaseModel, ConfigDict
from flask_openapi3 import FileStorage


# ---------------- Facultad ----------------
class FacultadBody(BaseModel):
    nombre: str
    codigo: str
    id_decano: int | None = None


class FacultadResponse(BaseModel):
    id_facultad: int
    nombre: str
    codigo: str
    id_decano: int | None


class FacultadListResponse(BaseModel):
    facultades: list[FacultadResponse]


# ---------------- Especialidad ----------------
class EspecialidadBody(BaseModel):
    nombre: str
    codigo: str
    id_facultad: int


class EspecialidadResponse(BaseModel):
    id_especialidad: int
    nombre: str
    codigo: str
    id_facultad: int


class EspecialidadListResponse(BaseModel):
    especialidades: list[EspecialidadResponse]


# ---------------- Curso ----------------
class CursoBody(BaseModel):
    codigo: str
    nombre: str
    creditos: int
    horas_teoria: int = 0
    horas_practica: int = 0
    ciclo: int = 1
    id_facultad: int
    id_prerrequisitos: list[int] | None = None
    id_especialidades: list[int] | None = None


class CursoResponse(BaseModel):
    id_curso: int
    codigo: str
    nombre: str
    creditos: int
    horas_teoria: int
    horas_practica: int
    ciclo: int
    id_facultad: int
    facultad_nombre: str | None = None
    id_prerrequisitos: list[int]
    id_especialidades: list[int]
    especialidades_nombres: list[str]


class CursoListResponse(BaseModel):
    cursos: list[CursoResponse]


# ---------------- Seccion ----------------
class SeccionBody(BaseModel):
    codigo: str
    horario: str | None = None
    aula: str | None = None
    capacidad: int = 30
    id_curso: int
    id_docente: int | None = None
    id_periodo: int


class SeccionUpdateBody(BaseModel):
    horario: str | None = None
    aula: str | None = None
    capacidad: int | None = None
    id_docente: int | None = None
    estado: str | None = None


class SeccionResponse(BaseModel):
    id_seccion: int
    codigo: str
    horario: str | None
    aula: str | None
    capacidad: int
    estado: str
    id_curso: int
    curso_nombre: str
    id_periodo: int
    id_docente: int | None
    docente_nombre: str | None


class SeccionListResponse(BaseModel):
    secciones: list[SeccionResponse]


# ---------------- Silabo (Docente) ----------------
class SilaboForm(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    archivo: FileStorage


class SilaboResponse(BaseModel):
    id_silabo: int
    archivo: str
    estado: str


# ---------------- Direccion ----------------
class CargaDocenteItem(BaseModel):
    id_docente: int
    nombre: str
    total_secciones: int
    total_horas: int


class CargaDocenteResponse(BaseModel):
    carga: list[CargaDocenteItem]


class CumplimientoCursoItem(BaseModel):
    id_curso: int
    curso: str
    ciclo: int
    tiene_seccion_abierta: bool


class CumplimientoPlanResponse(BaseModel):
    id_plan: int
    total_cursos: int
    cursos_con_seccion: int
    porcentaje_cumplimiento: float
    detalle: list[CumplimientoCursoItem]


# ---------------- Seccion Lote ----------------
class SeccionBatchItem(BaseModel):
    id_seccion: int | None = None
    codigo: str
    horario: str | None = None
    aula: str | None = None
    capacidad: int = 30
    id_curso: int
    id_docente: int | None = None
    id_periodo: int
    eliminar: bool | None = False


class SeccionBatchBody(BaseModel):
    secciones: list[SeccionBatchItem]
