from flask import request
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria
from app.schemas.course_schema import (
    CargaDocenteItem,
    CursoResponse,
    EspecialidadResponse,
    FacultadResponse,
    HorarioResponse,
    SeccionResponse,
)
from app.services.course_service import (
    CodigoDuplicadoError,
    CursoNoEncontradoError,
    DocenteNoEncontradoError,
    EspecialidadNoEncontradaError,
    FacultadNoEncontradaError,
    PeriodoNoEncontradoError,
    HorarioNoEncontradoError,
    EntidadConDependenciasError,
    SeccionNoEncontradaError,
    actualizar_curso,
    actualizar_especialidad,
    actualizar_facultad,
    carga_docente,
    crear_curso,
    crear_especialidad,
    crear_facultad,
    listar_cursos,
    listar_especialidades,
    listar_facultades,
    eliminar_facultad,
    eliminar_especialidad,
    eliminar_curso,
    obtener_horario_ciclo,
    guardar_horario_ciclo,
    PrerrequisitoDiferenteFacultadError,
    CarreraDiferenteFacultadError,
    crear_seccion,
    listar_secciones,
    actualizar_seccion,
    eliminar_seccion,
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


def _serializar_horario(h):
    # Serializa la información del objeto Horario
    return HorarioResponse(
        id_horario=h.id_horario,
        id_periodo=h.id_periodo,
        id_facultad=h.id_facultad,
        id_especialidad=h.id_especialidad,
        ciclo=h.ciclo,
        detalles=h.detalles,
        estado=h.estado,
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


# ---------------- Horario ----------------

def obtener_horario_ciclo_ctrl(id_periodo, id_facultad, id_especialidad, ciclo):
    h = obtener_horario_ciclo(id_periodo, id_facultad, id_especialidad, ciclo)
    if not h:
        return {"horario": None}, 200
    return {"horario": _serializar_horario(h)}, 200


def guardar_horario_ciclo_ctrl(body):
    try:
        h = guardar_horario_ciclo(
            body.id_periodo,
            body.id_facultad,
            body.id_especialidad,
            body.ciclo,
            body.detalles
        )
    except ValueError as e:
        return {"msg": str(e)}, 400

    actor = usuario_actual()
    registrar_auditoria(
        "guardar_horario_ciclo",
        "horario",
        registro=h.id_horario,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )
    return _serializar_horario(h), 200


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
    return {"msg": "Curso eliminado con éxito"}, 200


def _serializar_seccion(sec):
    return SeccionResponse(
        id_seccion=sec.id_seccion,
        codigo=sec.codigo,
        id_especialidad=sec.id_especialidad,
        especialidad_nombre=sec.especialidad.nombre if sec.especialidad else None,
        ciclo=sec.ciclo,
        id_periodo=sec.id_periodo
    ).model_dump()


def crear_seccion_ctrl(body):
    try:
        seccion = crear_seccion(
            body.codigo,
            body.id_especialidad,
            body.ciclo,
            body.id_periodo
        )
    except EspecialidadNoEncontradaError:
        return {"msg": "La especialidad indicada no existe"}, 404
    except PeriodoNoEncontradoError:
        return {"msg": "El periodo académico indicado no existe"}, 404
    except CodigoDuplicadoError:
        return {"msg": "Ya existe una sección con este código en el mismo ciclo, carrera y periodo"}, 409
    return _serializar_seccion(seccion), 201


def listar_secciones_ctrl(id_periodo=None, id_especialidad=None, ciclo=None):
    secciones = listar_secciones(id_periodo, id_especialidad, ciclo)
    return {"secciones": [_serializar_seccion(s) for s in secciones]}, 200


def actualizar_seccion_ctrl(id_seccion, body):
    try:
        seccion = actualizar_seccion(
            id_seccion,
            body.codigo,
            body.id_especialidad,
            body.ciclo
        )
    except SeccionNoEncontradaError:
        return {"msg": "Sección no encontrada"}, 404
    except EspecialidadNoEncontradaError:
        return {"msg": "La especialidad indicada no existe"}, 404
    except CodigoDuplicadoError:
        return {"msg": "Ya existe una sección con este código en el mismo ciclo, carrera y periodo"}, 409
    return _serializar_seccion(seccion), 200


def eliminar_seccion_ctrl(id_seccion):
    try:
        eliminar_seccion(id_seccion)
    except SeccionNoEncontradaError:
        return {"msg": "Sección no encontrada"}, 404
    except EntidadConDependenciasError:
        return {"msg": "No se puede eliminar la sección porque tiene estudiantes matriculados"}, 409
    return {"msg": "Sección eliminada con éxito"}, 200


def obtener_cursos_aperturados_ctrl(id_especialidad, id_periodo):
    from app.models.horario import Horario
    horarios = Horario.query.filter_by(id_periodo=id_periodo, id_especialidad=id_especialidad).all()
    
    ids_cursos = set()
    for h in horarios:
        for bloque in h.detalles:
            id_c = bloque.get("id_curso")
            if id_c:
                ids_cursos.add(int(id_c))
                
    return {"ids_cursos": list(ids_cursos)}, 200
