from flask import request
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria
from app.schemas.course_schema import (
    CargaDocenteItem,
    CursoResponse,
    EspecialidadResponse,
    FacultadResponse,
    SeccionResponse,
)
from app.services.course_service import (
    CodigoDuplicadoError,
    CursoNoEncontradoError,
    DocenteNoEncontradoError,
    EspecialidadNoEncontradaError,
    FacultadNoEncontradaError,
    PeriodoNoEncontradoError,
    SeccionNoEncontradaError,
    EntidadConDependenciasError,
    actualizar_curso,
    actualizar_especialidad,
    actualizar_facultad,
    actualizar_seccion,
    carga_docente,
    crear_curso,
    crear_especialidad,
    crear_facultad,
    crear_seccion,
    listar_cursos,
    listar_especialidades,
    listar_facultades,
    listar_secciones,
    eliminar_facultad,
    eliminar_especialidad,
    eliminar_curso,
    eliminar_seccion,
    guardar_secciones_lote,
    PrerrequisitoDiferenteFacultadError,
    CarreraDiferenteFacultadError,
)


def _serializar_facultad(f):
    return FacultadResponse(id_facultad=f.id_facultad, nombre=f.nombre, codigo=f.codigo, id_decano=f.id_decano).model_dump()


def _serializar_especialidad(e):
    return EspecialidadResponse(
        id_especialidad=e.id_especialidad, nombre=e.nombre, codigo=e.codigo, id_facultad=e.id_facultad
    ).model_dump()


def _serializar_curso(c):
    return CursoResponse(
        id_curso=c.id_curso,
        codigo=c.codigo,
        nombre=c.nombre,
        creditos=c.creditos,
        horas_teoria=c.horas_teoria,
        horas_practica=c.horas_practica,
        ciclo=c.ciclo,
        id_facultad=c.id_facultad,
        facultad_nombre=c.facultad.nombre if c.facultad else None,
        id_prerrequisitos=[p.id_curso for p in c.prerrequisitos],
        id_especialidades=[e.id_especialidad for e in c.especialidades],
        especialidades_nombres=[e.nombre for e in c.especialidades],
    ).model_dump()


def _serializar_seccion(seccion):
    return SeccionResponse(
        id_seccion=seccion.id_seccion,
        codigo=seccion.codigo,
        horario=seccion.horario,
        aula=seccion.aula,
        capacidad=seccion.capacidad,
        estado=seccion.estado,
        id_curso=seccion.id_curso,
        curso_nombre=seccion.curso.nombre,
        id_periodo=seccion.id_periodo,
        id_docente=seccion.id_docente,
        docente_nombre=f"{seccion.docente.nombres} {seccion.docente.apellidos}" if seccion.docente else None,
    ).model_dump()


# ---------------- Facultad ----------------

def crear_facultad_ctrl(body):
    try:
        facultad = crear_facultad(body.nombre, body.codigo, body.id_decano)
    except CodigoDuplicadoError:
        return {"msg": "Ya existe una facultad con ese código"}, 409
    return _serializar_facultad(facultad), 201


def listar_facultades_ctrl():
    facultades = listar_facultades()
    return {"facultades": [_serializar_facultad(f) for f in facultades]}, 200


def actualizar_facultad_ctrl(id_facultad, body):
    try:
        facultad = actualizar_facultad(id_facultad, body.nombre, body.codigo, body.id_decano)
    except FacultadNoEncontradaError:
        return {"msg": "Facultad no encontrada"}, 404
    return _serializar_facultad(facultad), 200


# ---------------- Especialidad ----------------

def crear_especialidad_ctrl(body):
    try:
        especialidad = crear_especialidad(body.nombre, body.codigo, body.id_facultad)
    except FacultadNoEncontradaError:
        return {"msg": "La facultad indicada no existe"}, 404
    except CodigoDuplicadoError:
        return {"msg": "Ya existe una especialidad con ese código"}, 409
    return _serializar_especialidad(especialidad), 201


def listar_especialidades_ctrl():
    especialidades = listar_especialidades()
    return {"especialidades": [_serializar_especialidad(e) for e in especialidades]}, 200


def actualizar_especialidad_ctrl(id_especialidad, body):
    try:
        especialidad = actualizar_especialidad(id_especialidad, body.nombre, body.codigo, body.id_facultad)
    except EspecialidadNoEncontradaError:
        return {"msg": "Especialidad no encontrada"}, 404
    except FacultadNoEncontradaError:
        return {"msg": "La facultad indicada no existe"}, 404
    return _serializar_especialidad(especialidad), 200


# ---------------- Curso ----------------

def crear_curso_ctrl(body):
    try:
        curso = crear_curso(
            body.codigo,
            body.nombre,
            body.creditos,
            body.horas_teoria,
            body.horas_practica,
            body.id_facultad,
            body.ciclo,
            body.id_prerrequisitos,
            body.id_especialidades,
        )
    except FacultadNoEncontradaError:
        return {"msg": "La facultad indicada no existe"}, 404
    except CodigoDuplicadoError:
        return {"msg": "Ya existe un curso con ese código"}, 409
    except PrerrequisitoDiferenteFacultadError:
        return {"msg": "Todos los prerrequisitos deben pertenecer a la misma facultad del curso"}, 400
    except CarreraDiferenteFacultadError:
        return {"msg": "Todas las carreras/especialidades asignadas deben pertenecer a la misma facultad del curso"}, 400
    return _serializar_curso(curso), 201


def listar_cursos_ctrl():
    cursos = listar_cursos()
    return {"cursos": [_serializar_curso(c) for c in cursos]}, 200


def actualizar_curso_ctrl(id_curso, body):
    try:
        curso = actualizar_curso(
            id_curso,
            body.nombre,
            body.creditos,
            body.horas_teoria,
            body.horas_practica,
            body.id_facultad,
            body.ciclo,
            body.id_prerrequisitos,
            body.id_especialidades,
        )
    except CursoNoEncontradoError:
        return {"msg": "Curso no encontrado"}, 404
    except FacultadNoEncontradaError:
        return {"msg": "La facultad indicada no existe"}, 404
    except PrerrequisitoDiferenteFacultadError:
        return {"msg": "Todos los prerrequisitos deben pertenecer a la misma facultad del curso"}, 400
    except CarreraDiferenteFacultadError:
        return {"msg": "Todas las carreras/especialidades asignadas deben pertenecer a la misma facultad del curso"}, 400
    return _serializar_curso(curso), 200


# ---------------- Seccion ----------------

def crear_seccion_ctrl(body):
    try:
        seccion = crear_seccion(
            body.codigo, body.horario, body.aula, body.capacidad, body.id_curso, body.id_docente, body.id_periodo
        )
    except CursoNoEncontradoError:
        return {"msg": "El curso indicado no existe"}, 404
    except PeriodoNoEncontradoError:
        return {"msg": "El periodo académico indicado no existe"}, 404
    except DocenteNoEncontradoError:
        return {"msg": "El docente indicado no existe"}, 404
    return _serializar_seccion(seccion), 201


def listar_secciones_ctrl(id_periodo=None):
    secciones = listar_secciones(id_periodo)
    return {"secciones": [_serializar_seccion(s) for s in secciones]}, 200


def actualizar_seccion_ctrl(id_seccion, body):
    try:
        seccion = actualizar_seccion(
            id_seccion, body.horario, body.aula, body.capacidad, body.id_docente, body.estado
        )
    except SeccionNoEncontradaError:
        return {"msg": "Sección no encontrada"}, 404
    except DocenteNoEncontradoError:
        return {"msg": "El docente indicado no existe"}, 404

    actor = usuario_actual()
    if body.estado == "cerrada":
        registrar_auditoria(
            "validar_acta",
            "seccion",
            registro=seccion.id_seccion,
            id_usuario=actor.id_usuario if actor else None,
            ip=request.remote_addr,
        )
    else:
        registrar_auditoria(
            "actualizar_seccion",
            "seccion",
            registro=seccion.id_seccion,
            id_usuario=actor.id_usuario if actor else None,
            ip=request.remote_addr,
        )

    return _serializar_seccion(seccion), 200


# ---------------- Direccion ----------------

def carga_docente_ctrl(id_periodo):
    carga = carga_docente(id_periodo)
    return {"carga": [CargaDocenteItem(**c).model_dump() for c in carga]}, 200





def eliminar_facultad_ctrl(id_facultad):
    try:
        eliminar_facultad(id_facultad)
    except FacultadNoEncontradaError:
        return {"msg": "Facultad no encontrada"}, 404
    except EntidadConDependenciasError:
        return {"msg": "No se puede eliminar la facultad porque tiene especialidades o docentes asociados"}, 400
    return {"msg": "Facultad eliminada con éxito"}, 200


def eliminar_especialidad_ctrl(id_especialidad):
    try:
        eliminar_especialidad(id_especialidad)
    except EspecialidadNoEncontradaError:
        return {"msg": "Especialidad no encontrada"}, 404
    except EntidadConDependenciasError:
        return {"msg": "No se puede eliminar la especialidad porque tiene estudiantes asociados"}, 400
    return {"msg": "Especialidad eliminada con éxito"}, 200


def eliminar_curso_ctrl(id_curso):
    try:
        eliminar_curso(id_curso)
    except CursoNoEncontradoError:
        return {"msg": "Curso no encontrado"}, 404
    except EntidadConDependenciasError:
        return {"msg": "No se puede eliminar el curso porque tiene secciones asociadas"}, 400
    return {"msg": "Curso eliminado con éxito"}, 200


def eliminar_seccion_ctrl(id_seccion):
    try:
        eliminar_seccion(id_seccion)
    except SeccionNoEncontradaError:
        return {"msg": "Sección no encontrada"}, 404
    except EntidadConDependenciasError:
        return {"msg": "No se puede eliminar la sección porque tiene estudiantes matriculados"}, 400

    actor = usuario_actual()
    registrar_auditoria(
        "eliminar_seccion",
        "seccion",
        registro=str(id_seccion),
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )
    return {"msg": "Sección eliminada con éxito"}, 200


def guardar_secciones_lote_ctrl(body):
    try:
        guardar_secciones_lote([item.model_dump() for item in body.secciones])
    except CursoNoEncontradoError:
        return {"msg": "Curso no encontrado"}, 404
    except PeriodoNoEncontradoError:
        return {"msg": "Periodo académico no encontrado"}, 404
    except DocenteNoEncontradoError:
        return {"msg": "El docente indicado no existe"}, 404
    except SeccionNoEncontradaError:
        return {"msg": "Sección no encontrada"}, 404
    except EntidadConDependenciasError:
        return {"msg": "No se puede eliminar una sección que tiene alumnos matriculados"}, 400
    except ValueError as e:
        return {"msg": str(e)}, 400

    actor = usuario_actual()
    registrar_auditoria(
        "guardar_horario_lote",
        "seccion",
        registro=None,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )
    return {"msg": "Horario guardado con éxito"}, 200
