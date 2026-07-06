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
from app.models.seccion import Seccion


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


class SeccionNoEncontradaError(Exception):
    pass


class SeccionLlenaError(Exception):
    def __init__(self, secciones_llenas):
        self.secciones_llenas = secciones_llenas
        super().__init__(f"Secciones sin cupo: {secciones_llenas}")


class EstadoInvalidoError(Exception):
    pass


def solicitar_matricula(id_estudiante, id_periodo, secciones_ids):
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

    secciones = Seccion.query.filter(Seccion.id_seccion.in_(secciones_ids)).all()
    if len(secciones) != len(set(secciones_ids)):
        raise SeccionNoEncontradaError()

    llenas = [s.codigo for s in secciones if _cupos_ocupados(s.id_seccion) >= s.capacidad]
    if llenas:
        raise SeccionLlenaError(llenas)

    matricula = Matricula(id_estudiante=id_estudiante, id_periodo=id_periodo, estado="pendiente")
    db.session.add(matricula)
    db.session.flush()

    for seccion in secciones:
        detalle = MatriculaDetalle(
            id_matricula=matricula.id_matricula, id_seccion=seccion.id_seccion, estado="matriculado"
        )
        db.session.add(detalle)
        db.session.flush()
        db.session.add(Nota(id_matricula_detalle=detalle.id_matricula_detalle, estado="pendiente"))

    db.session.commit()
    return matricula


def _cupos_ocupados(id_seccion):
    return MatriculaDetalle.query.filter_by(id_seccion=id_seccion, estado="matriculado").count()


def obtener_matriculas_estudiante(id_estudiante):
    return Matricula.query.filter_by(id_estudiante=id_estudiante).all()


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
        estado="confirmado",
    )
    db.session.add(pago)
    matricula.estado = "pagada"
    db.session.commit()
    return pago


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

    data = [["Curso", "Sección", "Estado"]]
    for detalle in matricula.detalles:
        curso = detalle.seccion.plan_curso.curso.nombre
        data.append([curso, detalle.seccion.codigo, detalle.estado])

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
