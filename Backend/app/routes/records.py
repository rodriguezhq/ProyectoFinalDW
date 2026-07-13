from pydantic import BaseModel, Field
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag
from flask_jwt_extended import get_jwt_identity, get_jwt

from app.schemas.record_schema import (
    RecordQuery,
    StudentRecordResponse,
    ConsolidatedReportResponse,
    CohortPerformanceResponse,
    ExportQuery,
)
from app.schemas.common_schema import MessageResponse
from app.utils.decorators import role_required
from app.services import record_service, export_service
from app.models.usuario import Usuario
from app.models.especialidad import Especialidad


records_tag = Tag(
    name="Récord Académico",
    description="Historial académico de estudiantes y reportes analíticos",
)
records_bp = APIBlueprint("records", __name__, abp_tags=[records_tag])


class EstudiantePath(BaseModel):
    id_estudiante: int = Field(..., description="ID del estudiante")


@records_bp.get(
    "/<int:id_estudiante>",
    summary="Consultar récord académico de un estudiante",
    description="Devuelve el historial académico completo con todas las notas agrupadas por periodo, y promedios ponderados.",
    responses={200: StudentRecordResponse, 403: MessageResponse, 404: MessageResponse},
)
@role_required("Estudiante", "Docente", "Administrador", "Direccion")
def consultar_record_estudiante(path: EstudiantePath):
    """Consulta el récord académico de un estudiante."""
    # Validación de seguridad: Estudiante solo puede ver su propio récord
    claims = get_jwt()
    role = claims.get("rol")

    if role == "Estudiante":
        current_user_id = get_jwt_identity()
        user = Usuario.query.get(current_user_id)
        if not user or user.id_estudiante != path.id_estudiante:
            return {
                "msg": "No tienes permiso para acceder a este récord académico"
            }, 403

    record, error = record_service.obtener_record_estudiante(path.id_estudiante)
    if error:
        return {"msg": error}, 404

    return record, 200


@records_bp.get(
    "/consolidado",
    summary="Reporte consolidado de estudiantes",
    description="Devuelve el promedio acumulado y créditos aprobados de todos los estudiantes. Permite filtrado por especialidad.",
    responses={200: ConsolidatedReportResponse},
)
@role_required("Administrador", "Direccion")
def consultar_reporte_consolidado(query: RecordQuery):
    """Consulta el reporte consolidado de estudiantes."""
    reporte, total, resumen_global = record_service.obtener_reporte_consolidado(query.id_especialidad, query.page, query.per_page)
    return {
        "msg": "Reporte consolidado obtenido exitosamente",
        "reporte": reporte,
        "resumen_global": resumen_global,
        "total": total,
        "page": query.page,
        "per_page": query.per_page,
        "hay_mas": (query.page * query.per_page) < total,
    }, 200


@records_bp.get(
    "/desempeno",
    summary="Rendimiento por cohorte y especialidad",
    description="Analiza la tasa de aprobación y promedio de notas de los estudiantes agrupados por su año de ingreso (cohorte) y especialidad.",
    responses={200: CohortPerformanceResponse},
)
@role_required("Direccion")
def consultar_desempeno_cohortes(query: RecordQuery):
    """Consulta el desempeño académico por cohorte."""
    desempeno, total, resumen_global = record_service.obtener_desempeno_cohortes(query.id_especialidad, query.page, query.per_page)
    return {
        "msg": "Reporte de desempeño por cohorte obtenido exitosamente",
        "desempeno": desempeno,
        "resumen_global": resumen_global,
        "total": total,
        "page": query.page,
        "per_page": query.per_page,
        "hay_mas": (query.page * query.per_page) < total,
    }, 200


@records_bp.get(
    "/consolidado/export",
    summary="Exportar reporte consolidado (CSV o PDF)",
    description="Genera y descarga el archivo de exportación de todo el consolidado de estudiantes según el formato especificado.",
    responses={400: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador", "Direccion")
def exportar_consolidado(query: ExportQuery):
    """Exporta el reporte consolidado."""
    if query.formato not in ("csv", "pdf"):
        return {"msg": "Formato no válido. Debe ser 'csv' o 'pdf'"}, 400
        
    especialidad_nombre = "General"
    if query.id_especialidad:
        especialidad = Especialidad.query.get(query.id_especialidad)
        if especialidad:
            especialidad_nombre = especialidad.nombre
            
    reporte, total, resumen_global = record_service.obtener_reporte_consolidado(query.id_especialidad, page=None, per_page=None)
    
    if query.formato == "csv":
        data_bytes = export_service.generar_consolidado_csv(reporte)
        mimetype = "text/csv"
        filename = f"Consolidado_{especialidad_nombre.replace(' ', '_')}.csv"
    else:
        data_bytes = export_service.generar_consolidado_pdf(reporte, especialidad_nombre, resumen_global)
        mimetype = "application/pdf"
        filename = f"Consolidado_{especialidad_nombre.replace(' ', '_')}.pdf"
        
    from flask import Response
    return Response(
        data_bytes,
        mimetype=mimetype,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@records_bp.get(
    "/desempeno/export",
    summary="Exportar desempeño de cohortes (CSV o PDF)",
    description="Genera y descarga el archivo de exportación de todo el desempeño por cohortes según el formato especificado.",
    responses={400: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Direccion")
def exportar_desempeno(query: ExportQuery):
    """Exporta el reporte de desempeño por cohorte."""
    if query.formato not in ("csv", "pdf"):
        return {"msg": "Formato no válido. Debe ser 'csv' o 'pdf'"}, 400
        
    especialidad_nombre = "General"
    if query.id_especialidad:
        especialidad = Especialidad.query.get(query.id_especialidad)
        if especialidad:
            especialidad_nombre = especialidad.nombre
            
    desempeno, total, resumen_global = record_service.obtener_desempeno_cohortes(query.id_especialidad, page=None, per_page=None)
    
    if query.formato == "csv":
        data_bytes = export_service.generar_cohortes_csv(desempeno)
        mimetype = "text/csv"
        filename = f"Desempeno_Cohortes_{especialidad_nombre.replace(' ', '_')}.csv"
    else:
        data_bytes = export_service.generar_cohortes_pdf(desempeno, especialidad_nombre, resumen_global)
        mimetype = "application/pdf"
        filename = f"Desempeno_Cohortes_{especialidad_nombre.replace(' ', '_')}.pdf"
        
    from flask import Response
    return Response(
        data_bytes,
        mimetype=mimetype,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

