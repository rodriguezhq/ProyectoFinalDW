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


# ---------------- Horario ----------------
class HorarioBody(BaseModel):
    id_periodo: int
    id_facultad: int
    id_especialidad: int
    ciclo: int
    detalles: list | dict | None = []
    estado: str = "activo"


class HorarioResponse(BaseModel):
    id_horario: int
    id_periodo: int
    id_facultad: int
    id_especialidad: int
    ciclo: int
    detalles: list | dict
    estado: str


class HorarioQuery(BaseModel):
    id_periodo: int
    id_facultad: int
    id_especialidad: int
    ciclo: int



# ---------------- Silabo (Docente) ----------------
class SilaboForm(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    archivo: FileStorage


class SilaboResponse(BaseModel):
    id_silabo: int
    archivo: str
    estado: str


# ---------------- Direccion ----------------
class ClaseDocenteItem(BaseModel):
    curso_codigo: str
    curso_nombre: str
    seccion: str
    dia: str
    horaInicio: str
    horaFin: str
    ambiente: str | None = None


class CargaDocenteItem(BaseModel):
    id_docente: int
    nombre: str
    total_secciones: int
    total_horas: int
    id_facultad: int
    clases: list[ClaseDocenteItem]


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


# ---------------- Horario List ----------------
class HorarioListResponse(BaseModel):
    horarios: list[HorarioResponse]


# ---------------- Seccion ----------------
class SeccionBody(BaseModel):
    codigo: str
    id_especialidad: int
    ciclo: int
    id_periodo: int


class SeccionResponse(BaseModel):
    id_seccion: int
    codigo: str
    id_especialidad: int
    especialidad_nombre: str | None = None
    ciclo: int
    id_periodo: int


class SeccionListResponse(BaseModel):
    secciones: list[SeccionResponse]


# ---------------- Respuestas Docente (Nuevas) ----------------

class PeriodoItemSchema(BaseModel):
    id_periodo: int
    nombre: str
    estado: str


class MisPeriodosResponse(BaseModel):
    periodos: list[PeriodoItemSchema]


class CursoDetalleInfoSchema(BaseModel):
    id_curso: int
    codigo: str
    nombre: str
    creditos: int
    ciclo: int
    especialidad_nombre: str


class PeriodoDetalleInfoSchema(BaseModel):
    id_periodo: int
    nombre: str
    activo: bool


class SilaboDetalleInfoSchema(BaseModel):
    id_silabo: int
    archivo: str
    estado: str


class CursoDetalleDocenteResponse(BaseModel):
    curso: CursoDetalleInfoSchema
    periodo: PeriodoDetalleInfoSchema
    silabo: SilaboDetalleInfoSchema | None = None


class EstudianteCalificacionItemSchema(BaseModel):
    id_nota: int | None = None
    parcial1: float | None = None
    parcial2: float | None = None
    final: float | None = None
    sustitutorio: float | None = None
    promedio: float | None = None
    estado: str
    id_matricula_detalle: int
    curso_nombre: str | None = None
    curso_codigo: str | None = None
    seccion_codigo: str | None = None
    periodo_nombre: str | None = None
    docente_nombre: str | None = None
    estudiante_nombre: str
    estudiante_codigo: str


class CursoEstudiantesDocenteResponse(BaseModel):
    notas: list[EstudianteCalificacionItemSchema]
    activo: bool


