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
from app.models.seccion import Seccion

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads", "silabos")


class FacultadNoEncontradaError(Exception):
    pass


class SeccionNoEncontradaError(Exception):
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


def se_cruzan(dia1, inicio1, fin1, dia2, inicio2, fin2):
    if dia1 != dia2:
        return False
    def a_minutos(h_str):
        h, m = map(int, h_str.split(':'))
        return h * 60 + m
    try:
        in1, f1 = a_minutos(inicio1), a_minutos(fin1)
        in2, f2 = a_minutos(inicio2), a_minutos(fin2)
        return in1 < f2 and f1 > in2
    except Exception:
        return False


def guardar_horario_ciclo(id_periodo, id_facultad, id_especialidad, ciclo, detalles):
    # 1. Validar colisiones internas del docente en el payload enviado
    for i, b1 in enumerate(detalles):
        doc1 = b1.get("id_docente")
        if not doc1:
            continue
        dia1 = b1.get("dia")
        ini1 = b1.get("horaInicio")
        fin1 = b1.get("horaFin")
        for j, b2 in enumerate(detalles):
            if i == j:
                continue
            doc2 = b2.get("id_docente")
            if str(doc1) == str(doc2):
                if se_cruzan(dia1, ini1, fin1, b2.get("dia"), b2.get("horaInicio"), b2.get("horaFin")):
                    raise ValueError(f"El docente ya tiene asignado un bloque el {dia1} de {ini1} a {fin1} en otra sección o curso.")

    # 2. Validar contra los horarios de otros ciclos/especialidades ya guardados en el periodo
    horarios_periodo = Horario.query.filter_by(id_periodo=id_periodo).all()
    for h in horarios_periodo:
        if h.id_facultad == id_facultad and h.id_especialidad == id_especialidad and h.ciclo == ciclo:
            continue
        for bloque_existente in h.detalles:
            doc_existente = bloque_existente.get("id_docente")
            if not doc_existente:
                continue
            for b_nuevo in detalles:
                doc_nuevo = b_nuevo.get("id_docente")
                if not doc_nuevo:
                    continue
                if str(doc_existente) == str(doc_nuevo):
                    if se_cruzan(bloque_existente.get("dia"), bloque_existente.get("horaInicio"), bloque_existente.get("horaFin"),
                                 b_nuevo.get("dia"), b_nuevo.get("horaInicio"), b_nuevo.get("horaFin")):
                        from app.models.docente import Docente
                        doc = Docente.query.get(doc_nuevo)
                        nombre_docente = f"{doc.nombres} {doc.apellidos}" if doc else "Docente seleccionado"
                        raise ValueError(
                            f"El docente {nombre_docente} ya tiene clases programadas en otro ciclo/carrera el "
                            f"{b_nuevo.get('dia')} de {b_nuevo.get('horaInicio')} a {b_nuevo.get('horaFin')}."
                        )

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

def subir_silabo(curso, archivo_storage, id_periodo):
    # Carga de sílabos por curso y periodo académico
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    nombre_archivo = f"curso_{curso.id_curso}_periodo_{id_periodo}_{secure_filename(archivo_storage.filename)}"
    ruta_absoluta = os.path.join(UPLOAD_DIR, nombre_archivo)
    archivo_storage.save(ruta_absoluta)
    ruta_relativa = os.path.join("static", "uploads", "silabos", nombre_archivo)

    from app.models.silabo import Silabo
    silabo_existente = Silabo.query.filter_by(id_curso=curso.id_curso, id_periodo=id_periodo).first()

    if silabo_existente:
        silabo_existente.archivo = ruta_relativa
        silabo_existente.estado = "pendiente"
        silabo = silabo_existente
    else:
        silabo = Silabo(archivo=ruta_relativa, estado="pendiente", id_curso=curso.id_curso, id_periodo=id_periodo)
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
                        "id_facultad": docente.id_facultad,
                        "clases": []
                    }
                por_docente[id_docente]["total_secciones"] += 1
                por_docente[id_docente]["total_horas"] += horas
                
                # Agregar información detallada de la clase para pintar el horario
                clase_info = {
                    "curso_codigo": curso.codigo,
                    "curso_nombre": curso.nombre,
                    "seccion": bloque.get("seccion") or bloque.get("codigo_seccion") or "A",
                    "dia": bloque.get("dia", ""),
                    "horaInicio": bloque.get("horaInicio", ""),
                    "horaFin": bloque.get("horaFin", ""),
                    "ambiente": bloque.get("ambiente") or bloque.get("aula") or "N/A"
                }
                # Evitar duplicados exactos si hay solapamiento de datos en la semilla
                if clase_info not in por_docente[id_docente]["clases"]:
                    por_docente[id_docente]["clases"].append(clase_info)

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


def crear_seccion(codigo, id_especialidad, ciclo, id_periodo):
    # Validar que la especialidad exista en el sistema
    especialidad = db.session.get(Especialidad, id_especialidad)
    if not especialidad:
        raise EspecialidadNoEncontradaError()

    # Validar que el periodo académico exista
    periodo = db.session.get(PeriodoAcademico, id_periodo)
    if not periodo:
        raise PeriodoNoEncontradoError()

    # Validar duplicados
    existe = Seccion.query.filter_by(
        id_periodo=id_periodo,
        id_especialidad=id_especialidad,
        ciclo=ciclo,
        codigo=codigo
    ).first()
    if existe:
        raise CodigoDuplicadoError()

    nueva_seccion = Seccion(
        codigo=codigo,
        id_especialidad=id_especialidad,
        ciclo=ciclo,
        id_periodo=id_periodo
    )
    db.session.add(nueva_seccion)
    db.session.commit()
    return nueva_seccion


def listar_secciones(id_periodo=None, id_especialidad=None, ciclo=None):
    consulta = Seccion.query
    if id_periodo is not None:
        consulta = consulta.filter_by(id_periodo=id_periodo)
    if id_especialidad is not None:
        consulta = consulta.filter_by(id_especialidad=id_especialidad)
    if ciclo is not None:
        consulta = consulta.filter_by(ciclo=ciclo)
    return consulta.all()


def actualizar_seccion(id_seccion, codigo=None, id_especialidad=None, ciclo=None):
    seccion = db.session.get(Seccion, id_seccion)
    if not seccion:
        raise SeccionNoEncontradaError()

    if id_especialidad is not None:
        especialidad = db.session.get(Especialidad, id_especialidad)
        if not especialidad:
            raise EspecialidadNoEncontradaError()
        seccion.id_especialidad = id_especialidad

    if ciclo is not None:
        seccion.ciclo = ciclo

    if codigo is not None:
        # Validar duplicado
        cod = codigo.strip()
        per_id = seccion.id_periodo
        esp_id = seccion.id_especialidad
        ciclo_val = seccion.ciclo
        existe = Seccion.query.filter(
            Seccion.id_seccion != id_seccion,
            Seccion.id_periodo == per_id,
            Seccion.id_especialidad == esp_id,
            Seccion.ciclo == ciclo_val,
            Seccion.codigo == cod
        ).first()
        if existe:
            raise CodigoDuplicadoError()
        seccion.codigo = cod

    db.session.commit()
    return seccion


def eliminar_seccion(id_seccion):
    seccion = db.session.get(Seccion, id_seccion)
    if not seccion:
        raise SeccionNoEncontradaError()
    
    # Verificar si existen detalles de matricula asignados a esta seccion
    from app.models.matricula_detalle import MatriculaDetalle
    tiene_matriculas = MatriculaDetalle.query.filter_by(id_seccion=id_seccion).first()
    if tiene_matriculas:
        raise EntidadConDependenciasError()

    db.session.delete(seccion)
    db.session.commit()

