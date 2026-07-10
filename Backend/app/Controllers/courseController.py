from app.schemas.course_schema import (
    CargaDocenteItem,
    CursoResponse,
    EspecialidadResponse,
    FacultadResponse,
    PlanCursoResponse,
    PlanEstudiosResponse,
    SeccionResponse,
)
from app.services.course_service import (
    CodigoDuplicadoError,
    CursoNoEncontradoError,
    DocenteNoEncontradoError,
    EspecialidadNoEncontradaError,
    FacultadNoEncontradaError,
    PeriodoNoEncontradoError,
    PlanCursoNoEncontradoError,
    PlanNoEncontradoError,
    SeccionNoEncontradaError,
    actualizar_curso,
    actualizar_especialidad,
    actualizar_facultad,
    actualizar_plan_estudios,
    actualizar_seccion,
    carga_docente,
    crear_curso,
    crear_especialidad,
    crear_facultad,
    crear_plan_curso,
    crear_plan_estudios,
    crear_seccion,
    cumplimiento_plan,
    listar_cursos,
    listar_especialidades,
    listar_facultades,
    listar_planes_curso,
    listar_planes_estudio,
    listar_secciones,
)


def _serializar_facultad(f):
    return FacultadResponse(id_facultad=f.id_facultad, nombre=f.nombre, codigo=f.codigo, id_decano=f.id_decano).model_dump()


def _serializar_especialidad(e):
    return EspecialidadResponse(
        id_especialidad=e.id_especialidad, nombre=e.nombre, codigo=e.codigo, id_facultad=e.id_facultad
    ).model_dump()


def _serializar_plan_estudios(p):
    return PlanEstudiosResponse(
        id_plan=p.id_plan,
        nombre=p.nombre,
        version=p.version,
        fecha_aprobacion=p.fecha_aprobacion,
        estado=p.estado,
        id_especialidad=p.id_especialidad,
    ).model_dump(mode="json")


def _serializar_curso(c):
    return CursoResponse(
        id_curso=c.id_curso,
        codigo=c.codigo,
        nombre=c.nombre,
        creditos=c.creditos,
        horas_teoria=c.horas_teoria,
        horas_practica=c.horas_practica,
    ).model_dump()


def _serializar_seccion(seccion):
    return SeccionResponse(
        id_seccion=seccion.id_seccion,
        codigo=seccion.codigo,
        horario=seccion.horario,
        aula=seccion.aula,
        capacidad=seccion.capacidad,
        estado=seccion.estado,
        curso_nombre=seccion.plan_curso.curso.nombre,
        id_periodo=seccion.id_periodo,
        periodo_nombre=seccion.periodo.nombre if seccion.periodo else None,
        id_docente=seccion.id_docente,
        docente_nombre=f"{seccion.docente.nombres} {seccion.docente.apellidos}" if seccion.docente else None,
    ).model_dump()


def _serializar_plan_curso(pc):
    return PlanCursoResponse(
        id_plan_curso=pc.id_plan_curso,
        id_plan=pc.id_plan,
        id_curso=pc.id_curso,
        curso_nombre=pc.curso.nombre,
        ciclo=pc.ciclo,
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


# ---------------- PlanEstudios ----------------

def crear_plan_estudios_ctrl(body):
    try:
        plan = crear_plan_estudios(body.nombre, body.version, body.fecha_aprobacion, body.estado, body.id_especialidad)
    except EspecialidadNoEncontradaError:
        return {"msg": "La especialidad indicada no existe"}, 404
    return _serializar_plan_estudios(plan), 201


def listar_planes_estudio_ctrl():
    planes = listar_planes_estudio()
    return {"planes": [_serializar_plan_estudios(p) for p in planes]}, 200


def actualizar_plan_estudios_ctrl(id_plan, body):
    try:
        plan = actualizar_plan_estudios(id_plan, body.nombre, body.version, body.estado)
    except PlanNoEncontradoError:
        return {"msg": "Plan de estudios no encontrado"}, 404
    return _serializar_plan_estudios(plan), 200


# ---------------- Curso ----------------

def crear_curso_ctrl(body):
    try:
        curso = crear_curso(body.codigo, body.nombre, body.creditos, body.horas_teoria, body.horas_practica)
    except CodigoDuplicadoError:
        return {"msg": "Ya existe un curso con ese código"}, 409
    return _serializar_curso(curso), 201


def listar_cursos_ctrl():
    cursos = listar_cursos()
    return {"cursos": [_serializar_curso(c) for c in cursos]}, 200


def actualizar_curso_ctrl(id_curso, body):
    try:
        curso = actualizar_curso(id_curso, body.nombre, body.creditos, body.horas_teoria, body.horas_practica)
    except CursoNoEncontradoError:
        return {"msg": "Curso no encontrado"}, 404
    return _serializar_curso(curso), 200


# ---------------- PlanCurso ----------------

def crear_plan_curso_ctrl(body):
    try:
        pc = crear_plan_curso(body.id_plan, body.id_curso, body.ciclo)
    except PlanNoEncontradoError:
        return {"msg": "El plan de estudios indicado no existe"}, 404
    except CursoNoEncontradoError:
        return {"msg": "El curso indicado no existe"}, 404
    except CodigoDuplicadoError:
        return {"msg": "Ese curso ya está en ese plan de estudios"}, 409
    return _serializar_plan_curso(pc), 201


def listar_planes_curso_ctrl(id_plan=None):
    planes_curso = listar_planes_curso(id_plan)
    return {"planes_curso": [_serializar_plan_curso(pc) for pc in planes_curso]}, 200


# ---------------- Seccion ----------------

def crear_seccion_ctrl(body):
    try:
        seccion = crear_seccion(
            body.codigo, body.horario, body.aula, body.capacidad, body.id_plan_curso, body.id_docente, body.id_periodo
        )
    except PlanCursoNoEncontradoError:
        return {"msg": "El curso del plan indicado no existe"}, 404
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
    return _serializar_seccion(seccion), 200


# ---------------- Direccion ----------------

def carga_docente_ctrl(id_periodo):
    carga = carga_docente(id_periodo)
    return {"carga": [CargaDocenteItem(**c).model_dump() for c in carga]}, 200


def cumplimiento_plan_ctrl(id_plan, id_periodo):
    try:
        resultado = cumplimiento_plan(id_plan, id_periodo)
    except PlanNoEncontradoError:
        return {"msg": "Plan de estudios no encontrado"}, 404
    return resultado, 200
