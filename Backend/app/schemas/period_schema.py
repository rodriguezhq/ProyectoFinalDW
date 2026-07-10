from datetime import date
from pydantic import BaseModel


# Schema para la creación de un nuevo periodo académico
class PeriodoCreateBody(BaseModel):
    nombre: str
    fecha_inicio: date
    fecha_fin: date


# Schema para la respuesta de un periodo académico
class PeriodoResponse(BaseModel):
    id_periodo: int
    nombre: str
    fecha_inicio: date
    fecha_fin: date
    estado: str


# Schema para listar múltiples periodos académicos
class PeriodoListResponse(BaseModel):
    periodos: list[PeriodoResponse]
