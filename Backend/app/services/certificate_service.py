from datetime import datetime
from io import BytesIO

from flask import current_app
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table

from app.extensions import db
from app.models.documento import Documento
from app.models.estudiante import Estudiante
from app.utils.pagination import paginar_query


class EstudianteNoEncontradoError(Exception):
    pass


class EstudianteInactivoError(Exception):
    pass


class DocumentoNoEncontradoError(Exception):
    pass


class EstadoInvalidoError(Exception):
    pass


def solicitar_documento(id_estudiante, tipo_documento):
    """Crea una solicitud de documento para un estudiante."""
    estudiante = db.session.get(Estudiante, id_estudiante)
    if not estudiante:
        raise EstudianteNoEncontradoError()
    if estudiante.estado != "activo":
        raise EstudianteInactivoError()
    documento = Documento(
        tipo_documento=tipo_documento,
        fecha_solicitud=datetime.now(),
        estado="solicitado",
        id_estudiante=id_estudiante,
    )
    db.session.add(documento)
    db.session.commit()
    return documento


def autorizar_documento(id_documento, id_usuario_autoriza):
    """Direccion Autorioza la emision del doc"""
    documento = db.session.get(Documento, id_documento)
    if not documento:
        raise DocumentoNoEncontradoError()
    if documento.estado != "solicitado":
        raise EstadoInvalidoError()
    documento.estado = "autorizado"
    documento.id_usuario_autoriza = id_usuario_autoriza
    db.session.commit()
    return documento


def emitir_documento(id_documento, id_usuario_emite):
    """Admin emite el documento con generación de código QR."""
    documento = db.session.get(Documento, id_documento)
    if not documento:
        raise DocumentoNoEncontradoError()
    if documento.estado != "autorizado":
        raise EstadoInvalidoError()
    codigo_qr = _generar_qr(documento)
    doc_archivo = f"/documentos/{codigo_qr.lower()}.pdf"
    documento.estado = "emitido"
    documento.fecha_emision = datetime.now()
    documento.codigo_qr = codigo_qr
    documento.id_usuario_emite = id_usuario_emite
    documento.archivo = doc_archivo
    db.session.commit()
    return documento


def _generar_qr(documento):
    fecha = documento.fecha_solicitud.strftime("%Y%m%d")
    tipo = documento.tipo_documento[:3].upper()
    return f"QR-{tipo}-{documento.id_documento}-{fecha}"


def url_verificacion(codigo_qr):
    """URL publica que el QR codifica: al escanearlo, abre esta pagina de verificacion."""
    return f"{current_app.config['FRONTEND_URL']}/verificar/{codigo_qr}"


def verificar_documento(codigo_qr):
    """Busca un documento emitido por su codigo QR, para la pagina publica de verificacion.

    Solo encuentra documentos ya emitidos (un documento 'solicitado' o
    'autorizado' todavia no tiene codigo_qr, asi que no es verificable).
    """
    documento = Documento.query.filter_by(codigo_qr=codigo_qr, estado="emitido").first()
    if not documento:
        raise DocumentoNoEncontradoError()
    return documento


def obtener_documentos_estudiante(id_estudiante, page=1, per_page=10):
    """Documentos de un estudiante, paginados."""
    query = Documento.query.filter_by(id_estudiante=id_estudiante).order_by(Documento.fecha_solicitud.desc())
    return paginar_query(query, page, per_page)


def obtener_documento(id_documento):
    """Un documento por su ID."""
    documento = db.session.get(Documento, id_documento)
    if not documento:
        raise DocumentoNoEncontradoError()
    return documento


def obtener_todos_documentos(page=1, per_page=10):
    """Todos los documentos, paginados."""
    query = Documento.query.order_by(Documento.fecha_solicitud.desc())
    return paginar_query(query, page, per_page)


def _dibujo_qr(contenido, tamano=90):
    """Genera un codigo QR real (no una imagen externa) para embeber en el PDF."""
    widget = QrCodeWidget(contenido)
    x1, y1, x2, y2 = widget.getBounds()
    ancho, alto = x2 - x1, y2 - y1
    dibujo = Drawing(tamano, tamano, transform=[tamano / ancho, 0, 0, tamano / alto, 0, 0])
    dibujo.add(widget)
    return dibujo


def generar_certificado_pdf(documento):
    """Genera el PDF del certificado/constancia al vuelo (no se guarda en disco).

    La "firma digital" institucional se representa como el nombre de quien
    emitio el documento + el codigo QR de verificacion, que es lo unico
    verificable sin una infraestructura de firma criptografica real.
    """
    buffer = BytesIO()
    doc_pdf = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    estudiante = documento.estudiante
    emisor = documento.usuario_emite

    emisor_nombre = (
        f"{emisor.nombres_efectivos} {emisor.apellidos_efectivos}" if emisor else "N/D"
    )
    emisor_rol = emisor.rol.nombre if emisor and emisor.rol else ""
    fecha_emision = documento.fecha_emision or datetime.now()

    elementos = [
        Paragraph("Universidad Nacional del Centro del Perú", styles["Title"]),
        Paragraph(documento.tipo_documento.upper(), styles["Heading2"]),
        Spacer(1, 16),
        Paragraph("Se deja constancia que:", styles["Normal"]),
        Paragraph(f"<b>{estudiante.nombres} {estudiante.apellidos}</b>", styles["Normal"]),
        Paragraph(f"Código: {estudiante.codigo}", styles["Normal"]),
        Spacer(1, 24),
        Paragraph(f"Huancayo, {fecha_emision.strftime('%d/%m/%Y')}", styles["Normal"]),
        Spacer(1, 32),
    ]

    firma_texto = Paragraph(
        f"Firmado digitalmente por:<br/><b>{emisor_nombre}</b><br/>"
        f"{emisor_rol} - UNCP<br/>"
        f"{fecha_emision.strftime('%d/%m/%Y %H:%M')}",
        styles["Normal"],
    )
    tabla_firma = Table([[firma_texto, _dibujo_qr(url_verificacion(documento.codigo_qr))]], colWidths=[340, 100])
    elementos.append(tabla_firma)
    elementos.append(Spacer(1, 10))
    elementos.append(Paragraph(f"Código de verificación: {documento.codigo_qr}", styles["Normal"]))

    doc_pdf.build(elementos)
    return buffer.getvalue()
