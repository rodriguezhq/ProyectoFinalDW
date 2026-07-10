import os

from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.curso import Curso
from app.models.docente import Docente
from app.models.especialidad import Especialidad
from app.models.facultad import Facultad
from app.models.periodo_academico import PeriodoAcademico
from app.models.seccion import Seccion
from app.models.silabo import Silabo

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "silabos")


class FacultadNoEncontradaError(Exception):
    pass


class EspecialidadNoEncontradaError(Exception):
    pass


class PlanNoEncontradoError(Exception):
    pass


class EntidadConDependenciasError(Exception):
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


class PrerrequisitoDiferenteFacultadError(Exception):
    pass


class CarreraDiferenteFacultadError(Exception):
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


def crear_curso(codigo, nombre, creditos, horas_teoria, horas_practica, id_facultad, ciclo=1, id_prerrequisitos=None, id_especialidades=None):
    if Curso.query.filter_by(codigo=codigo).first():
        raise CodigoDuplicadoError()

    if not db.session.get(Facultad, id_facultad):
        raise FacultadNoEncontradaError()

    curso = Curso(
        codigo=codigo,
        nombre=nombre,
        creditos=creditos,
        horas_teoria=horas_teoria,
        horas_practica=horas_practica,
        ciclo=ciclo,
        id_facultad=id_facultad,
    )
    
    # Asignar los prerrequisitos si se proporcionan (deben ser de la misma facultad)
    if id_prerrequisitos:
        for pre_id in id_prerrequisitos:
            prerreq = db.session.get(Curso, pre_id)
            if prerreq:
                if prerreq.id_facultad != id_facultad:
                    raise PrerrequisitoDiferenteFacultadError()
                curso.prerrequisitos.append(prerreq)

    # Asignar especialidades (carreras) si se proporcionan (deben ser de la misma facultad)
    if id_especialidades:
        for esp_id in id_especialidades:
            esp = db.session.get(Especialidad, esp_id)
            if not esp:
                raise EspecialidadNoEncontradaError()
            if esp.id_facultad != id_facultad:
                raise CarreraDiferenteFacultadError()
            curso.especialidades.append(esp)

    db.session.add(curso)
    db.session.commit()
    return curso


def listar_cursos():
    return Curso.query.all()


def actualizar_curso(id_curso, nombre=None, creditos=None, horas_teoria=None, horas_practica=None, id_facultad=None, ciclo=None, id_prerrequisitos=None, id_especialidades=None):
    curso = db.session.get(Curso, id_curso)
    if not curso:
        raise CursoNoEncontradoError()
    
    if id_facultad is not None:
        if not db.session.get(Facultad, id_facultad):
            raise FacultadNoEncontradaError()
        curso.id_facultad = id_facultad
        
    fac_id_valida = id_facultad if id_facultad is not None else curso.id_facultad
    
    if nombre is not None:
        curso.nombre = nombre
    if creditos is not None:
        curso.creditos = creditos
    if horas_teoria is not None:
        curso.horas_teoria = horas_teoria
    if horas_practica is not None:
        curso.horas_practica = horas_practica
    if ciclo is not None:
        curso.ciclo = ciclo
        
    # Actualizar la lista de prerrequisitos si se especifica
    if id_prerrequisitos is not None:
        nuevos_prerreqs = []
        for pre_id in id_prerrequisitos:
            prerreq = db.session.get(Curso, pre_id)
            if prerreq:
                if prerreq.id_facultad != fac_id_valida:
                    raise PrerrequisitoDiferenteFacultadError()
                nuevos_prerreqs.append(prerreq)
        curso.prerrequisitos = nuevos_prerreqs
    else:
        # Validar los prerrequisitos anteriores contra la nueva facultad
        for prerreq in curso.prerrequisitos:
            if prerreq.id_facultad != fac_id_valida:
                raise PrerrequisitoDiferenteFacultadError()

    # Actualizar especialidades si se especifica
    if id_especialidades is not None:
        nuevas_esps = []
        for esp_id in id_especialidades:
            esp = db.session.get(Especialidad, esp_id)
            if not esp:
                raise EspecialidadNoEncontradaError()
            if esp.id_facultad != fac_id_valida:
                raise CarreraDiferenteFacultadError()
            nuevas_esps.append(esp)
        curso.especialidades = nuevas_esps
    else:
        # Validar especialidades anteriores contra la nueva facultad
        for esp in curso.especialidades:
            if esp.id_facultad != fac_id_valida:
                raise CarreraDiferenteFacultadError()


# ---------------- Seccion ----------------

def crear_seccion(codigo, horario, aula, capacidad, id_curso, id_docente, id_periodo):
    if not db.session.get(Curso, id_curso):
        raise CursoNoEncontradoError()
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
        id_curso=id_curso,
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
        curso = seccion.curso
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



def eliminar_facultad(id_facultad):
    facultad = db.session.get(Facultad, id_facultad)
    if not facultad:
        raise FacultadNoEncontradaError()
    if Especialidad.query.filter_by(id_facultad=id_facultad).first() or Docente.query.filter_by(id_facultad=id_facultad).first():
        raise EntidadConDependenciasError()
    db.session.delete(facultad)
    db.session.commit()


def eliminar_especialidad(id_especialidad):
    especialidad = db.session.get(Especialidad, id_especialidad)
    if not especialidad:
        raise EspecialidadNoEncontradaError()
    from app.models.estudiante import Estudiante
    if Estudiante.query.filter_by(id_especialidad=id_especialidad).first():
        raise EntidadConDependenciasError()
    db.session.delete(especialidad)
    db.session.commit()


def eliminar_curso(id_curso):
    curso = db.session.get(Curso, id_curso)
    if not curso:
        raise CursoNoEncontradoError()
    from app.models.seccion import Seccion
    if Seccion.query.filter_by(id_curso=id_curso).first():
        raise EntidadConDependenciasError()
    db.session.delete(curso)
    db.session.commit()


def eliminar_seccion(id_seccion):
    seccion = db.session.get(Seccion, id_seccion)
    if not seccion:
        raise SeccionNoEncontradaError()
    if len(seccion.matricula_detalles) > 0:
        raise EntidadConDependenciasError()
    db.session.delete(seccion)
    db.session.commit()


def guardar_secciones_lote(secciones_list):
    for item in secciones_list:
        eliminar = item.get("eliminar", False)
        id_seccion = item.get("id_seccion")

        if eliminar:
            if id_seccion:
                sec = db.session.get(Seccion, id_seccion)
                if sec:
                    if len(sec.matricula_detalles) > 0:
                        raise EntidadConDependenciasError()
                    db.session.delete(sec)
        else:
            id_curso = item.get("id_curso")
            id_periodo = item.get("id_periodo")
            id_docente = item.get("id_docente")

            # Validación obligatoria del docente
            if not id_docente:
                raise ValueError("Cada sección debe tener asignado un docente obligatorio.")

            if not db.session.get(Docente, id_docente):
                raise DocenteNoEncontradoError()

            if not id_seccion:
                # Crear nueva sección
                if not db.session.get(Curso, id_curso):
                    raise CursoNoEncontradoError()
                if not db.session.get(PeriodoAcademico, id_periodo):
                    raise PeriodoNoEncontradoError()

                sec = Seccion(
                    codigo=item.get("codigo"),
                    horario=item.get("horario"),
                    aula=item.get("aula"),
                    capacidad=item.get("capacidad", 30),
                    estado="abierta",
                    id_curso=id_curso,
                    id_docente=id_docente,
                    id_periodo=id_periodo
                )
                db.session.add(sec)
            else:
                # Modificar sección existente
                sec = db.session.get(Seccion, id_seccion)
                if not sec:
                    raise SeccionNoEncontradaError()
                
                sec.codigo = item.get("codigo", sec.codigo)
                sec.horario = item.get("horario", sec.horario)
                sec.aula = item.get("aula", sec.aula)
                sec.capacidad = item.get("capacidad", sec.capacidad)
                sec.id_docente = id_docente

    db.session.commit()
