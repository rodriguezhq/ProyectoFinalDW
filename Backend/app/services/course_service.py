import os

from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.curso import Curso
from app.models.docente import Docente
from app.models.especialidad import Especialidad
from app.models.facultad import Facultad
from app.models.periodo_academico import PeriodoAcademico
from app.models.plan_curso import PlanCurso
from app.models.plan_estudios import PlanEstudios
from app.models.seccion import Seccion
from app.models.silabo import Silabo

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "silabos")


class FacultadNoEncontradaError(Exception):
    pass


class EspecialidadNoEncontradaError(Exception):
    pass


class PlanNoEncontradoError(Exception):
    pass


class CursoNoEncontradoError(Exception):
    pass


class PlanCursoNoEncontradoError(Exception):
    pass


class SeccionNoEncontradaError(Exception):
    pass


class DocenteNoEncontradoError(Exception):
    pass


class PeriodoNoEncontradoError(Exception):
    pass


class CodigoDuplicadoError(Exception):
    pass


# ---------------- Facultad ----------------

def crear_facultad(nombre, codigo, id_decano=None):
    if Facultad.query.filter_by(codigo=codigo).first():
        raise CodigoDuplicadoError()
    facultad = Facultad(nombre=nombre, codigo=codigo, id_decano=id_decano)
    db.session.add(facultad)
    db.session.commit()
    return facultad


def listar_facultades():
    return Facultad.query.all()


def actualizar_facultad(id_facultad, nombre=None, codigo=None, id_decano=None):
    facultad = db.session.get(Facultad, id_facultad)
    if not facultad:
        raise FacultadNoEncontradaError()
    if nombre is not None:
        facultad.nombre = nombre
    if codigo is not None:
        facultad.codigo = codigo
    if id_decano is not None:
        facultad.id_decano = id_decano
    db.session.commit()
    return facultad


# ---------------- Especialidad ----------------

def crear_especialidad(nombre, codigo, id_facultad):
    if not db.session.get(Facultad, id_facultad):
        raise FacultadNoEncontradaError()
    if Especialidad.query.filter_by(codigo=codigo).first():
        raise CodigoDuplicadoError()
    especialidad = Especialidad(nombre=nombre, codigo=codigo, id_facultad=id_facultad)
    db.session.add(especialidad)
    db.session.commit()
    return especialidad


def listar_especialidades():
    return Especialidad.query.all()


def actualizar_especialidad(id_especialidad, nombre=None, codigo=None, id_facultad=None):
    especialidad = db.session.get(Especialidad, id_especialidad)
    if not especialidad:
        raise EspecialidadNoEncontradaError()
    if id_facultad is not None:
        if not db.session.get(Facultad, id_facultad):
            raise FacultadNoEncontradaError()
        especialidad.id_facultad = id_facultad
    if nombre is not None:
        especialidad.nombre = nombre
    if codigo is not None:
        especialidad.codigo = codigo
    db.session.commit()
    return especialidad


# ---------------- PlanEstudios ----------------

def crear_plan_estudios(nombre, version, fecha_aprobacion, estado, id_especialidad):
    if not db.session.get(Especialidad, id_especialidad):
        raise EspecialidadNoEncontradaError()
    plan = PlanEstudios(
        nombre=nombre,
        version=version,
        fecha_aprobacion=fecha_aprobacion,
        estado=estado,
        id_especialidad=id_especialidad,
    )
    db.session.add(plan)
    db.session.commit()
    return plan


def listar_planes_estudio():
    return PlanEstudios.query.all()


def actualizar_plan_estudios(id_plan, nombre=None, version=None, estado=None):
    plan = db.session.get(PlanEstudios, id_plan)
    if not plan:
        raise PlanNoEncontradoError()
    if nombre is not None:
        plan.nombre = nombre
    if version is not None:
        plan.version = version
    if estado is not None:
        plan.estado = estado
    db.session.commit()
    return plan


# ---------------- Curso ----------------

def crear_curso(codigo, nombre, creditos, horas_teoria, horas_practica):
    if Curso.query.filter_by(codigo=codigo).first():
        raise CodigoDuplicadoError()
    curso = Curso(
        codigo=codigo, nombre=nombre, creditos=creditos, horas_teoria=horas_teoria, horas_practica=horas_practica
    )
    db.session.add(curso)
    db.session.commit()
    return curso


def listar_cursos():
    return Curso.query.all()


def actualizar_curso(id_curso, nombre=None, creditos=None, horas_teoria=None, horas_practica=None):
    curso = db.session.get(Curso, id_curso)
    if not curso:
        raise CursoNoEncontradoError()
    if nombre is not None:
        curso.nombre = nombre
    if creditos is not None:
        curso.creditos = creditos
    if horas_teoria is not None:
        curso.horas_teoria = horas_teoria
    if horas_practica is not None:
        curso.horas_practica = horas_practica
    db.session.commit()
    return curso


# ---------------- PlanCurso ----------------

def crear_plan_curso(id_plan, id_curso, ciclo):
    if not db.session.get(PlanEstudios, id_plan):
        raise PlanNoEncontradoError()
    if not db.session.get(Curso, id_curso):
        raise CursoNoEncontradoError()
    if PlanCurso.query.filter_by(id_plan=id_plan, id_curso=id_curso).first():
        raise CodigoDuplicadoError()
    plan_curso = PlanCurso(id_plan=id_plan, id_curso=id_curso, ciclo=ciclo)
    db.session.add(plan_curso)
    db.session.commit()
    return plan_curso


def listar_planes_curso(id_plan=None):
    query = PlanCurso.query
    if id_plan is not None:
        query = query.filter_by(id_plan=id_plan)
    return query.all()


# ---------------- Seccion ----------------

def crear_seccion(codigo, horario, aula, capacidad, id_plan_curso, id_docente, id_periodo):
    if not db.session.get(PlanCurso, id_plan_curso):
        raise PlanCursoNoEncontradoError()
    if not db.session.get(PeriodoAcademico, id_periodo):
        raise PeriodoNoEncontradoError()
    if id_docente is not None and not db.session.get(Docente, id_docente):
        raise DocenteNoEncontradoError()

    seccion = Seccion(
        codigo=codigo,
        horario=horario,
        aula=aula,
        capacidad=capacidad,
        estado="abierta",
        id_plan_curso=id_plan_curso,
        id_docente=id_docente,
        id_periodo=id_periodo,
    )
    db.session.add(seccion)
    db.session.commit()
    return seccion


def listar_secciones(id_periodo=None):
    query = Seccion.query
    if id_periodo is not None:
        query = query.filter_by(id_periodo=id_periodo)
    return query.all()


def obtener_seccion(id_seccion):
    seccion = db.session.get(Seccion, id_seccion)
    if not seccion:
        raise SeccionNoEncontradaError()
    return seccion


def actualizar_seccion(id_seccion, horario=None, aula=None, capacidad=None, id_docente=None, estado=None):
    seccion = obtener_seccion(id_seccion)
    if id_docente is not None:
        if not db.session.get(Docente, id_docente):
            raise DocenteNoEncontradoError()
        seccion.id_docente = id_docente
    if horario is not None:
        seccion.horario = horario
    if aula is not None:
        seccion.aula = aula
    if capacidad is not None:
        seccion.capacidad = capacidad
    if estado is not None:
        seccion.estado = estado
    db.session.commit()
    return seccion


def secciones_de_docente(id_docente):
    return Seccion.query.filter_by(id_docente=id_docente).all()


# ---------------- Silabo ----------------

def subir_silabo(seccion, archivo_storage):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    nombre_archivo = f"seccion_{seccion.id_seccion}_{secure_filename(archivo_storage.filename)}"
    ruta_absoluta = os.path.join(UPLOAD_DIR, nombre_archivo)
    archivo_storage.save(ruta_absoluta)
    ruta_relativa = os.path.join("uploads", "silabos", nombre_archivo)

    if seccion.silabo:
        seccion.silabo.archivo = ruta_relativa
        seccion.silabo.estado = "pendiente"
        silabo = seccion.silabo
    else:
        silabo = Silabo(archivo=ruta_relativa, estado="pendiente", id_seccion=seccion.id_seccion)
        db.session.add(silabo)

    db.session.commit()
    return silabo


# ---------------- Direccion ----------------

def carga_docente(id_periodo):
    secciones = Seccion.query.filter_by(id_periodo=id_periodo).filter(Seccion.id_docente.isnot(None)).all()

    por_docente = {}
    for seccion in secciones:
        docente = seccion.docente
        curso = seccion.plan_curso.curso
        horas = curso.horas_teoria + curso.horas_practica
        if docente.id_docente not in por_docente:
            por_docente[docente.id_docente] = {
                "id_docente": docente.id_docente,
                "nombre": f"{docente.nombres} {docente.apellidos}",
                "total_secciones": 0,
                "total_horas": 0,
            }
        por_docente[docente.id_docente]["total_secciones"] += 1
        por_docente[docente.id_docente]["total_horas"] += horas

    return list(por_docente.values())


def cumplimiento_plan(id_plan, id_periodo):
    if not db.session.get(PlanEstudios, id_plan):
        raise PlanNoEncontradoError()

    planes_curso = PlanCurso.query.filter_by(id_plan=id_plan).all()
    detalle = []
    con_seccion = 0

    for pc in planes_curso:
        tiene_seccion = (
            Seccion.query.filter_by(id_plan_curso=pc.id_plan_curso, id_periodo=id_periodo).first() is not None
        )
        if tiene_seccion:
            con_seccion += 1
        detalle.append(
            {
                "id_curso": pc.curso.id_curso,
                "curso": pc.curso.nombre,
                "ciclo": pc.ciclo,
                "tiene_seccion_abierta": tiene_seccion,
            }
        )

    total = len(planes_curso)
    porcentaje = round((con_seccion / total) * 100, 1) if total else 0.0

    return {
        "id_plan": id_plan,
        "total_cursos": total,
        "cursos_con_seccion": con_seccion,
        "porcentaje_cumplimiento": porcentaje,
        "detalle": detalle,
    }
