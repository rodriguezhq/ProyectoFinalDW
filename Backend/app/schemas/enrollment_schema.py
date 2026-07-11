from datetime import datetime

from pydantic import BaseModel


class SolicitarMatriculaBody(BaseModel):
    id_periodo: int
    cursos: list[int]


class MatriculaDetalleResponse(BaseModel):
    id_matricula_detalle: int
    id_curso: int
    curso: str
    codigo_curso: str
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
