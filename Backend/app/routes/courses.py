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
    SeccionBody,
    SeccionListResponse,
    SeccionResponse,
    SeccionUpdateBody,
    SeccionBatchBody,
    SilaboForm,
    SilaboResponse,
)
from app.utils.decorators import role_required

courses_tag = Tag(name="Cursos y Docentes", description="Estructura académica, secciones, sílabos y reportes")
courses_bp = APIBlueprint("courses", __name__, abp_tags=[courses_tag])


class IdPath(BaseModel):
    id: int = Field(..., description="ID del recurso")


class SeccionPath(BaseModel):
    id_seccion: int


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


# ---------------- Seccion ----------------

@courses_bp.post(
    "/secciones", responses={201: SeccionResponse, 404: MessageResponse}, security=[{"jwt": []}]
)
@role_required("Administrador")
def crear_seccion(body: SeccionBody):
    response, status = courseController.crear_seccion_ctrl(body)
    return response, status


@courses_bp.get("/secciones", responses={200: SeccionListResponse}, security=[{"jwt": []}])
@jwt_required()
def listar_secciones(query: PeriodoQuery):
    response, status = courseController.listar_secciones_ctrl(query.id_periodo)
    return response, status


@courses_bp.post(
    "/secciones/lote",
    summary="Guardar secciones en lote / Diseñar Horario",
    responses={200: MessageResponse, 404: MessageResponse, 400: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def guardar_secciones_lote(body: SeccionBatchBody):
    response, status = courseController.guardar_secciones_lote_ctrl(body)
    return response, status


@courses_bp.put(
    "/secciones/<int:id_seccion>",
    summary="Actualizar sección / Cerrar Acta",
    responses={200: SeccionResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def actualizar_seccion(path: SeccionPath, body: SeccionUpdateBody):
    response, status = courseController.actualizar_seccion_ctrl(path.id_seccion, body)
    return response, status


@courses_bp.delete(
    "/secciones/<int:id_seccion>",
    summary="Eliminar sección",
    responses={200: MessageResponse, 404: MessageResponse, 400: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Administrador")
def eliminar_seccion(path: SeccionPath):
    response, status = courseController.eliminar_seccion_ctrl(path.id_seccion)
    return response, status


# ---------------- Docente ----------------

@courses_bp.get("/mis-secciones", responses={200: SeccionListResponse, 403: MessageResponse}, security=[{"jwt": []}])
@role_required("Docente")
def mis_secciones():
    response, status = teacherController.mis_secciones()
    return response, status


@courses_bp.post(
    "/secciones/<int:id_seccion>/silabo",
    responses={201: SilaboResponse, 403: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@role_required("Docente")
def subir_silabo(path: SeccionPath, form: SilaboForm):
    response, status = teacherController.subir_silabo_ctrl(path.id_seccion, form)
    return response, status


# ---------------- Direccion ----------------

@courses_bp.get("/carga-docente", responses={200: CargaDocenteResponse}, security=[{"jwt": []}])
@role_required("Direccion")
def carga_docente(query: PeriodoQuery):
    response, status = courseController.carga_docente_ctrl(query.id_periodo)
    return response, status


