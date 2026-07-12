from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.extensions import db
from app.models.estudiante import Estudiante
from app.models.matricula import Matricula
from app.models.matricula_detalle import MatriculaDetalle
from app.models.nota import Nota
from app.models.pago import Pago
from app.models.periodo_academico import PeriodoAcademico
from app.models.curso import Curso


class EstudianteInactivoError(Exception):
    pass


class PeriodoNoEncontradoError(Exception):
    pass


class PeriodoCerradoError(Exception):
    pass


class MatriculaDuplicadaError(Exception):
    pass


class MatriculaNoEncontradaError(Exception):
    pass


class CursoNoEncontradoError(Exception):
    pass


class SeccionNoEncontradaError(Exception):
    pass


class SeccionLlenaError(Exception):
    pass


class EstadoInvalidoError(Exception):
    pass


class CursoFueraDePlanError(Exception):
    pass


class PagoNoEncontradoError(Exception):
    pass


def solicitar_matricula(id_estudiante, id_periodo, secciones_data):
    estudiante = db.session.get(Estudiante, id_estudiante)
    if not estudiante or estudiante.estado != "activo":
        raise EstudianteInactivoError()

    periodo = db.session.get(PeriodoAcademico, id_periodo)
    if not periodo:
        raise PeriodoNoEncontradoError()
    if periodo.estado != "activo":
        raise PeriodoCerradoError()

    ya_existe = Matricula.query.filter_by(id_estudiante=id_estudiante, id_periodo=id_periodo).first()
    if ya_existe:
        raise MatriculaDuplicadaError()

    from app.models.seccion import Seccion
    from app.models.curso import Curso

    # Validar cursos, secciones y capacidades
    for item in secciones_data:
        c_id = item.get("id_curso")
        s_id = item.get("id_seccion")
        
        curso = db.session.get(Curso, c_id)
        if not curso:
            raise CursoNoEncontradoError()

        seccion = db.session.get(Seccion, s_id)
        if not seccion:
            raise SeccionNoEncontradaError()

        # Validar capacidad (por defecto 30 alumnos por curso-sección, o la definida en Seccion)
        limite = seccion.capacidad if (hasattr(seccion, 'capacidad') and seccion.capacidad is not None) else 30
        matriculados = MatriculaDetalle.query.filter_by(id_seccion=s_id, id_curso=c_id, estado="matriculado").count()
        if matriculados >= limite:
            raise SeccionLlenaError()

    matricula = Matricula(id_estudiante=id_estudiante, id_periodo=id_periodo, estado="pendiente")
    db.session.add(matricula)
    db.session.flush()

    for item in secciones_data:
        c_id = item.get("id_curso")
        s_id = item.get("id_seccion")
        detalle = MatriculaDetalle(
            id_matricula=matricula.id_matricula,
            id_seccion=s_id,
            id_curso=c_id,
            estado="matriculado"
        )
        db.session.add(detalle)
        db.session.flush()
        db.session.add(Nota(id_matricula_detalle=detalle.id_matricula_detalle, estado="pendiente"))

    db.session.commit()
    return matricula


def obtener_matriculas_estudiante(id_estudiante):
    return Matricula.query.filter_by(id_estudiante=id_estudiante).all()


def listar_todas_matriculas(id_periodo=None, estado=None):
    query = Matricula.query
    if id_periodo is not None:
        query = query.filter_by(id_periodo=id_periodo)
    if estado is not None:
        query = query.filter_by(estado=estado)
    return query.all()


def obtener_matricula(id_matricula):
    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        raise MatriculaNoEncontradaError()
    return matricula


def validar_matricula(id_matricula):
    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        raise MatriculaNoEncontradaError()
    if matricula.estado != "pendiente":
        raise EstadoInvalidoError()

    matricula.estado = "validada"
    db.session.commit()
    return matricula


def registrar_pago(id_matricula, monto, metodo_pago, codigo_operacion):
    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        raise MatriculaNoEncontradaError()
    if matricula.estado != "validada":
        raise EstadoInvalidoError()

    pago = Pago(
        id_matricula=id_matricula,
        monto=monto,
        metodo_pago=metodo_pago,
        codigo_operacion=codigo_operacion,
        estado="pendiente",
    )
    db.session.add(pago)
    db.session.commit()
    return pago


def validar_pago(id_pago):
    pago = db.session.get(Pago, id_pago)
    if not pago:
        raise PagoNoEncontradoError()
    if pago.estado != "pendiente":
        raise EstadoInvalidoError()

    pago.estado = "confirmado"
    pago.matricula.estado = "pagada"
    db.session.commit()
    return pago


def rechazar_matricula(id_matricula):
    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        raise MatriculaNoEncontradaError()
    if matricula.estado != "pendiente":
        raise EstadoInvalidoError()

    matricula.estado = "rechazada"
    db.session.commit()
    return matricula


def generar_ficha_pdf(matricula):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    estudiante = matricula.estudiante

    elementos = [
        Paragraph("Ficha de Matrícula", styles["Title"]),
        Spacer(1, 12),
        Paragraph(f"Estudiante: {estudiante.nombres} {estudiante.apellidos}", styles["Normal"]),
        Paragraph(f"Código: {estudiante.codigo}", styles["Normal"]),
        Paragraph(f"Periodo: {matricula.periodo.nombre}", styles["Normal"]),
        Paragraph(f"Estado de matrícula: {matricula.estado}", styles["Normal"]),
        Spacer(1, 16),
    ]

    data = [["Curso", "Código", "Estado"]]
    for detalle in matricula.detalles:
        curso = detalle.curso.nombre
        data.append([curso, detalle.curso.codigo, detalle.estado])


    tabla = Table(data, hAlign="LEFT")
    tabla.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
            ]
        )
    )
    elementos.append(tabla)

    doc.build(elementos)
    return buffer.getvalue()


def estadisticas_periodo(id_periodo):
    matriculas = Matricula.query.filter_by(id_periodo=id_periodo).all()

    por_estado = {}
    por_especialidad = {}
    for m in matriculas:
        por_estado[m.estado] = por_estado.get(m.estado, 0) + 1
        especialidad = m.estudiante.especialidad.nombre
        por_especialidad[especialidad] = por_especialidad.get(especialidad, 0) + 1

    return {
        "total_matriculados": len(matriculas),
        "por_estado": por_estado,
        "por_especialidad": por_especialidad,
    }
