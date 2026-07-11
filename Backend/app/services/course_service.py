import os

from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.curso import Curso
from app.models.docente import Docente
from app.models.especialidad import Especialidad
from app.models.facultad import Facultad
from app.models.periodo_academico import PeriodoAcademico
from app.models.horario import Horario
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


class HorarioNoEncontradoError(Exception):
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


# ---------------- Horario ----------------

def obtener_horario_ciclo(id_periodo, id_facultad, id_especialidad, ciclo):
    # Recupera el horario único registrado para una carrera y ciclo específicos en un periodo
    return Horario.query.filter_by(
        id_periodo=id_periodo,
        id_facultad=id_facultad,
        id_especialidad=id_especialidad,
        ciclo=ciclo
    ).first()


def guardar_horario_ciclo(id_periodo, id_facultad, id_especialidad, ciclo, detalles):
    # Guarda o actualiza el horario correspondiente a un ciclo y carrera académica
    horario = obtener_horario_ciclo(id_periodo, id_facultad, id_especialidad, ciclo)
    if not horario:
        horario = Horario(
            id_periodo=id_periodo,
            id_facultad=id_facultad,
            id_especialidad=id_especialidad,
            ciclo=ciclo,
            detalles=detalles
        )
        db.session.add(horario)
    else:
        horario.detalles = detalles
    db.session.commit()
    return horario


def obtener_horario_docente(id_periodo, id_docente):
    # Recupera todos los bloques de asignaturas programadas asignados a un docente en el periodo actual
    horarios = Horario.query.filter_by(id_periodo=id_periodo).all()
    bloques_docente = []
    
    for h in horarios:
        for bloque in h.detalles:
            # Comprobar si el bloque pertenece al docente indicado
            id_doc_bloque = bloque.get("id_docente")
            if id_doc_bloque is not None and str(id_doc_bloque) == str(id_docente):
                # Enriquecer el bloque con nombres de curso y aula para la vista del horario
                bloques_docente.append(bloque)
                
    return bloques_docente


# ---------------- Silabo ----------------

def subir_silabo(curso, archivo_storage):
    # Carga de sílabos por curso
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    nombre_archivo = f"curso_{curso.id_curso}_{secure_filename(archivo_storage.filename)}"
    ruta_absoluta = os.path.join(UPLOAD_DIR, nombre_archivo)
    archivo_storage.save(ruta_absoluta)
    ruta_relativa = os.path.join("uploads", "silabos", nombre_archivo)

    if curso.silabo:
        curso.silabo.archivo = ruta_relativa
        curso.silabo.estado = "pendiente"
        silabo = curso.silabo
    else:
        silabo = Silabo(archivo=ruta_relativa, estado="pendiente", id_curso=curso.id_curso)
        db.session.add(silabo)

    db.session.commit()
    return silabo


# ---------------- Direccion ----------------

def carga_docente(id_periodo):
    # Calcula las horas totales y asignaturas asignadas a cada docente basándose en la grilla del Horario
    horarios = Horario.query.filter_by(id_periodo=id_periodo).all()
    por_docente = {}

    for h in horarios:
        for bloque in h.detalles:
            id_docente = bloque.get("id_docente")
            id_curso = bloque.get("id_curso")
            
            if id_docente and id_curso:
                id_docente = int(id_docente)
                curso = db.session.get(Curso, int(id_curso))
                if not curso:
                    continue
                
                horas = curso.horas_teoria + curso.horas_practica
                docente = db.session.get(Docente, id_docente)
                if not docente:
                    continue
                
                if id_docente not in por_docente:
                    por_docente[id_docente] = {
                        "id_docente": id_docente,
                        "nombre": f"{docente.nombres} {docente.apellidos}",
                        "total_secciones": 0,
                        "total_horas": 0,
                    }
                por_docente[id_docente]["total_secciones"] += 1
                por_docente[id_docente]["total_horas"] += horas

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
    db.session.delete(curso)
    db.session.commit()

