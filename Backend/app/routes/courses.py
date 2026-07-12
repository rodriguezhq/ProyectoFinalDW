from pydantic import BaseModel, Field

from flask_jwt_extended import jwt_required
from flask_openapi3.blueprint import APIBlueprint
from flask_openapi3.models.tag import Tag

from app.Controllers import courseController, teacherController
from app.schemas.common_schema import MessageResponse
from app.schemas.course_schema import (
    CargaDocenteResponse,
    CursoBody,
    CursoListResponse,
    CursoResponse,
    EspecialidadBody,
    EspecialidadListResponse,
    EspecialidadResponse,
    FacultadBody,
    FacultadListResponse,
    FacultadResponse,
    HorarioBody,
    HorarioResponse,
    HorarioQuery,
    HorarioListResponse,
    SilaboForm,
    SilaboResponse,
    SeccionBody,
    SeccionResponse,
    SeccionListResponse,
    MisPeriodosResponse,
    CursoDetalleDocenteResponse,
    CursoEstudiantesDocenteResponse,
)
from app.utils.decorators import role_required

courses_tag = Tag(name="Cursos y Docentes", description="Estructura académica, horarios, sílabos y reportes")
courses_bp = APIBlueprint("courses", __name__, abp_tags=[courses_tag])


class IdPath(BaseModel):
    id: int = Field(..., description="ID del recurso")


class IdCursoPath(BaseModel):
    id_curso: int = Field(..., description="ID del curso")


class PeriodoQuery(BaseModel):
    id_periodo: int | None = None




# ---------------- Facultad ----------------

@courses_bp.post("/facultades", responses={201: FacultadResponse, 409: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def crear_facultad(body: FacultadBody):
    response, status = courseController.crear_facultad_ctrl(body)
    return response, status


@courses_bp.get("/facultades", responses={200: FacultadListResponse}, security=[{"jwt": []}])
@jwt_required()
def listar_facultades():
    response, status = courseController.listar_facultades_ctrl()
    return response, status


@courses_bp.put("/facultades/<int:id>", responses={200: FacultadResponse, 404: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def actualizar_facultad(path: IdPath, body: FacultadBody):
    response, status = courseController.actualizar_facultad_ctrl(path.id, body)
    return response, status


@courses_bp.delete("/facultades/<int:id>", responses={200: MessageResponse, 400: MessageResponse, 404: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def eliminar_facultad(path: IdPath):
    response, status = courseController.eliminar_facultad_ctrl(path.id)
    return response, status


# ---------------- Especialidad ----------------

@courses_bp.post(
    "/especialidades", responses={201: EspecialidadResponse, 404: MessageResponse, 409: MessageResponse}, security=[{"jwt": []}]
)
@role_required("Administrador")
def crear_especialidad(body: EspecialidadBody):
    response, status = courseController.crear_especialidad_ctrl(body)
    return response, status


@courses_bp.get("/especialidades", responses={200: EspecialidadListResponse}, security=[{"jwt": []}])
@jwt_required()
def listar_especialidades():
    response, status = courseController.listar_especialidades_ctrl()
    return response, status


@courses_bp.put(
    "/especialidades/<int:id>", responses={200: EspecialidadResponse, 404: MessageResponse}, security=[{"jwt": []}]
)
@role_required("Administrador")
def actualizar_especialidad(path: IdPath, body: EspecialidadBody):
    response, status = courseController.actualizar_especialidad_ctrl(path.id, body)
    return response, status


@courses_bp.delete(
    "/especialidades/<int:id>", responses={200: MessageResponse, 400: MessageResponse, 404: MessageResponse}, security=[{"jwt": []}]
)
@role_required("Administrador")
def eliminar_especialidad(path: IdPath):
    response, status = courseController.eliminar_especialidad_ctrl(path.id)
    return response, status


# ---------------- Curso ----------------

@courses_bp.post("/cursos", responses={201: CursoResponse, 409: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def crear_curso(body: CursoBody):
    response, status = courseController.crear_curso_ctrl(body)
    return response, status


@courses_bp.get("/cursos", responses={200: CursoListResponse}, security=[{"jwt": []}])
@jwt_required()
def listar_cursos():
    response, status = courseController.listar_cursos_ctrl()
    return response, status


@courses_bp.put("/cursos/<int:id>", responses={200: CursoResponse, 404: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def actualizar_curso(path: IdPath, body: CursoBody):
    response, status = courseController.actualizar_curso_ctrl(path.id, body)
    return response, status


@courses_bp.delete("/cursos/<int:id>", responses={200: MessageResponse, 400: MessageResponse, 404: MessageResponse}, security=[{"jwt": []}])
@role_required("Administrador")
def eliminar_curso(path: IdPath):
    response, status = courseController.eliminar_curso_ctrl(path.id)
    return response, status


# ---------------- Horario ----------------

@courses_bp.get(
    "/horarios",
    responses={200: HorarioResponse, 404: MessageResponse},
    security=[{"jwt": []}]
)
@jwt_required()
def obtener_horario(query: HorarioQuery):
    response, status = courseController.obtener_horario_ciclo_ctrl(
        query.id_periodo, query.id_facultad, query.id_especialidad, query.ciclo
    )
    return response, status


@courses_bp.post(
    "/horarios",
    responses={200: HorarioResponse, 400: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Administrador")
def guardar_horario(body: HorarioBody):
    response, status = courseController.guardar_horario_ciclo_ctrl(body)
    return response, status


# ---------------- Docente ----------------

class MisSeccionesQuery(BaseModel):
    id_periodo: int | None = Field(None, description="ID del periodo academico")


class CursoDetalleQuery(BaseModel):
    id_periodo: int = Field(..., description="ID del periodo academico")


@courses_bp.get(
    "/mis-periodos",
    responses={200: MisPeriodosResponse, 403: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Docente")
def mis_periodos():
    response, status = teacherController.mis_periodos_ctrl()
    return response, status


@courses_bp.get(
    "/mis-secciones",
    responses={200: HorarioListResponse, 403: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Docente")
def mis_secciones(query: MisSeccionesQuery):
    response, status = teacherController.mis_secciones(query.id_periodo)
    return response, status


@courses_bp.post(
    "/cursos/<int:id_curso>/silabo",
    responses={201: SilaboResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Docente")
def subir_silabo(path: IdCursoPath, form: SilaboForm):
    response, status = teacherController.subir_silabo_ctrl(path.id_curso, form)
    return response, status


@courses_bp.get(
    "/cursos/<int:id_curso>/detalle",
    responses={200: CursoDetalleDocenteResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Docente")
def curso_detalle_docente(path: IdCursoPath, query: CursoDetalleQuery):
    response, status = teacherController.curso_detalle_docente_ctrl(path.id_curso, query.id_periodo)
    return response, status


@courses_bp.get(
    "/cursos/<int:id_curso>/estudiantes",
    responses={200: CursoEstudiantesDocenteResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Docente")
def curso_estudiantes_docente(path: IdCursoPath, query: CursoDetalleQuery):
    response, status = teacherController.curso_estudiantes_ctrl(path.id_curso, query.id_periodo)
    return response, status




# ---------------- Direccion ----------------

@courses_bp.get("/carga-docente", responses={200: CargaDocenteResponse}, security=[{"jwt": []}])
@role_required("Direccion")
def carga_docente(query: PeriodoQuery):
    response, status = courseController.carga_docente_ctrl(query.id_periodo)
    return response, status


class SeccionQuery(BaseModel):
    id_periodo: int | None = Field(None, description="Filtrar por periodo académico")
    id_especialidad: int | None = Field(None, description="Filtrar por carrera/especialidad")
    ciclo: int | None = Field(None, description="Filtrar por ciclo")


class IdSeccionPath(BaseModel):
    id: int = Field(..., description="ID de la sección")


# ---------------- Seccion ----------------

@courses_bp.post(
    "/secciones",
    responses={201: SeccionResponse, 404: MessageResponse, 409: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Administrador")
def crear_seccion(body: SeccionBody):
    response, status = courseController.crear_seccion_ctrl(body)
    return response, status


@courses_bp.get(
    "/secciones",
    responses={200: SeccionListResponse},
    security=[{"jwt": []}]
)
@jwt_required()
def listar_secciones(query: SeccionQuery):
    response, status = courseController.listar_secciones_ctrl(query.id_periodo, query.id_especialidad, query.ciclo)
    return response, status


@courses_bp.put(
    "/secciones/<int:id>",
    responses={200: SeccionResponse, 404: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Administrador")
def actualizar_seccion(path: IdSeccionPath, body: SeccionBody):
    response, status = courseController.actualizar_seccion_ctrl(path.id, body)
    return response, status


@courses_bp.delete(
    "/secciones/<int:id>",
    responses={200: MessageResponse, 404: MessageResponse, 400: MessageResponse},
    security=[{"jwt": []}]
)
@role_required("Administrador")
def eliminar_seccion(path: IdSeccionPath):
    response, status = courseController.eliminar_seccion_ctrl(path.id)
    return response, status


class CursosAperturadosQuery(BaseModel):
    id_periodo: int = Field(..., description="ID del periodo academico")


@courses_bp.get(
    "/especialidades/<int:id>/cursos-aperturados",
    responses={200: MessageResponse},
    security=[{"jwt": []}]
)
@jwt_required()
def obtener_cursos_aperturados(path: IdPath, query: CursosAperturadosQuery):
    response, status = courseController.obtener_cursos_aperturados_ctrl(path.id, query.id_periodo)
    return response, status



