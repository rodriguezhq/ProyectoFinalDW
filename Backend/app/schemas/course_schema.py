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


# ---------------- PlanEstudios ----------------
class PlanEstudiosBody(BaseModel):
    nombre: str
    version: str
    fecha_aprobacion: date
    estado: str = "vigente"
    id_especialidad: int


class PlanEstudiosResponse(BaseModel):
    id_plan: int
    nombre: str
    version: str
    fecha_aprobacion: date
    estado: str
    id_especialidad: int


class PlanEstudiosListResponse(BaseModel):
    planes: list[PlanEstudiosResponse]


# ---------------- Curso ----------------
class CursoBody(BaseModel):
    codigo: str
    nombre: str
    creditos: int
    horas_teoria: int = 0
    horas_practica: int = 0


class CursoResponse(BaseModel):
    id_curso: int
    codigo: str
    nombre: str
    creditos: int
    horas_teoria: int
    horas_practica: int


class CursoListResponse(BaseModel):
    cursos: list[CursoResponse]


# ---------------- PlanCurso ----------------
class PlanCursoBody(BaseModel):
    id_plan: int
    id_curso: int
    ciclo: int


class PlanCursoResponse(BaseModel):
    id_plan_curso: int
    id_plan: int
    id_curso: int
    curso_nombre: str
    ciclo: int


class PlanCursoListResponse(BaseModel):
    planes_curso: list[PlanCursoResponse]


# ---------------- Seccion ----------------
class SeccionBody(BaseModel):
    codigo: str
    horario: str | None = None
    aula: str | None = None
    capacidad: int = 30
    id_plan_curso: int
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
    curso_nombre: str
    id_periodo: int
    periodo_nombre: str | None = None
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
