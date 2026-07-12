from datetime import datetime

from pydantic import BaseModel


class AsignaturaMatriculaInput(BaseModel):
    id_curso: int
    id_seccion: int


class SolicitarMatriculaBody(BaseModel):
    id_periodo: int
    secciones: list[AsignaturaMatriculaInput | int]


class MatriculaDetalleResponse(BaseModel):
    id_matricula_detalle: int
    id_curso: int
    curso: str
    codigo_curso: str
    id_seccion: int
    seccion_codigo: str | None = None
    estado: str
    horario: str | None = None


class MatriculaResponse(BaseModel):
    id_matricula: int
    id_estudiante: int
    estudiante_nombre: str
    id_periodo: int
    fecha_matricula: datetime
    estado: str
    detalles: list[MatriculaDetalleResponse]


class MatriculaListResponse(BaseModel):
    matriculas: list[MatriculaResponse]


class PagoBody(BaseModel):
    monto: float
    metodo_pago: str
    codigo_operacion: str | None = None


class PagoResponse(BaseModel):
    id_pago: int
    monto: float
    estado: str


class EstadisticasResponse(BaseModel):
    total_matriculados: int
    por_estado: dict[str, int]
    por_especialidad: dict[str, int]


class BloqueHorarioSchema(BaseModel):
    codigo: str
    seccion: str
    dia: str
    horaInicio: str
    horaFin: str
    id_curso: int
    curso_nombre: str
    id_docente: int | None = None
    docente_nombre: str | None = None


class SeccionOfertaSchema(BaseModel):
    id_seccion: int
    codigo: str
    ciclo: int
    horarios: list[BloqueHorarioSchema]


class CursoOfertaSchema(BaseModel):
    id_curso: int
    codigo: str
    nombre: str
    creditos: int
    ciclo: int
    secciones: list[SeccionOfertaSchema]


class OfertaAcademicaResponse(BaseModel):
    ya_matriculado: bool
    id_matricula: int | None = None
    periodo_nombre: str
    cursos: list[CursoOfertaSchema]


class MatriculaBody(BaseModel):
    secciones: list[AsignaturaMatriculaInput]


class CursoMatriculadoSchema(BaseModel):
    id_curso: int
    codigo: str
    nombre: str
    creditos: int
    seccion_codigo: str
    horarios: list[BloqueHorarioSchema]


class FichaMatriculaResponse(BaseModel):
    id_matricula: int
    fecha_matricula: str
    estado: str
    periodo_nombre: str
    estudiante_nombres: str
    estudiante_apellidos: str
    estudiante_codigo: str
    cursos: list[CursoMatriculadoSchema]
    total_creditos: int


class ConfirmarMatriculaAdminBody(BaseModel):
    registrar_pago: bool
    monto: float | None = None
    metodo_pago: str | None = None
    codigo_operacion: str | None = None
