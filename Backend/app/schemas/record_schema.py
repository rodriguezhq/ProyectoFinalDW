from pydantic import BaseModel, Field
from typing import Optional, List


class RecordQuery(BaseModel):
    id_especialidad: Optional[int] = Field(None, description="ID de la especialidad para filtrar")
    page: int = 1
    per_page: int = 10


class StudentSummary(BaseModel):
    id_estudiante: int
    codigo: str
    nombres: str
    apellidos: str
    dni: str
    correo: Optional[str] = None
    especialidad_nombre: str
    especialidad_codigo: str
    facultad_nombre: str
    facultad_codigo: str


class AcademicSummary(BaseModel):
    total_creditos_matriculados: int
    total_creditos_aprobados: int
    promedio_ponderado_acumulado: Optional[float] = None


class CourseRecordItem(BaseModel):
    curso_codigo: str
    curso_nombre: str
    creditos: int
    ciclo: int
    parcial1: Optional[float] = None
    parcial2: Optional[float] = None
    final: Optional[float] = None
    sustitutorio: Optional[float] = None
    promedio: Optional[float] = None
    estado_nota: str  # consolidada, registrada, pendiente, etc.
    estado_detalle: str  # matriculado, retirado, etc.


class PeriodRecordItem(BaseModel):
    periodo_nombre: str
    promedio_ponderado_periodo: Optional[float] = None
    creditos_matriculados_periodo: int
    creditos_aprobados_periodo: int
    cursos: List[CourseRecordItem]


class StudentRecordResponse(BaseModel):
    estudiante: StudentSummary
    resumen: AcademicSummary
    periodos: List[PeriodRecordItem]


class ConsolidatedReportItem(BaseModel):
    id_estudiante: int
    codigo: str
    nombres: str
    apellidos: str
    especialidad_nombre: str
    total_creditos_matriculados: int
    total_creditos_aprobados: int
    promedio_ponderado_acumulado: Optional[float] = None
    periodos_matriculados: int


class ConsolidatedResumenGlobal(BaseModel):
    total_alumnos: int
    promedio_ppa_global: Optional[float] = None
    promedio_creditos_aprobados: Optional[float] = None


class ConsolidatedReportResponse(BaseModel):
    msg: str
    reporte: List[ConsolidatedReportItem]
    resumen_global: ConsolidatedResumenGlobal
    total: int
    page: int
    per_page: int
    hay_mas: bool


class CohortPerformanceItem(BaseModel):
    cohorte: str
    especialidad_nombre: str
    total_estudiantes: int
    promedio_ponderado_promedio: Optional[float] = None
    total_creditos_aprobados_promedio: Optional[float] = None
    tasa_aprobacion: Optional[float] = None


class CohortResumenGlobal(BaseModel):
    total_alumnos: int
    promedio_ppa_global: Optional[float] = None
    tasa_aprobacion_global: Optional[float] = None


class CohortPerformanceResponse(BaseModel):
    msg: str
    desempeno: List[CohortPerformanceItem]
    resumen_global: CohortResumenGlobal
    total: int
    page: int
    per_page: int
    hay_mas: bool


class ExportQuery(BaseModel):
    id_especialidad: Optional[int] = Field(None, description="ID de la especialidad para filtrar")
    formato: str = Field("csv", description="Formato del archivo: 'csv' o 'pdf'")

