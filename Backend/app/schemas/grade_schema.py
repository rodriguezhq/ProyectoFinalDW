from pydantic import BaseModel, field_validator
from typing import Optional


class GradeBody(BaseModel):
    parcial1: Optional[float] = None
    parcial2: Optional[float] = None
    final: Optional[float] = None
    sustitutorio: Optional[float] = None

    @field_validator("parcial1", "parcial2", "final", "sustitutorio", mode="before")
    @classmethod
    def validar_rango_nota(cls, v):
        if v is not None:
            if not (0 <= v <= 20):
                raise ValueError("La nota debe estar entre 0 y 20")
        return v


class GradeItem(BaseModel):
    id_nota: int
    parcial1: Optional[float] = None
    parcial2: Optional[float] = None
    final: Optional[float] = None
    sustitutorio: Optional[float] = None
    promedio: Optional[float] = None
    estado: str
    id_matricula_detalle: int
    curso_nombre: Optional[str] = None
    curso_codigo: Optional[str] = None
    seccion_codigo: Optional[str] = None
    periodo_nombre: Optional[str] = None
    docente_nombre: Optional[str] = None


class GradeResponse(BaseModel):
    msg: str
    nota: GradeItem


class GradeListResponse(BaseModel):
    msg: str
    notas: list[GradeItem]


class MessageResponse(BaseModel):
    msg: str
