from datetime import datetime
from app.extensions import db
from app.models.documento import Documento
from app.models.estudiante import Estudiante


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


def obtener_documentos_estudiante(id_estudiante):
    """Todos los documentos de un estudiante."""
    return (
        Documento.query.filter_by(id_estudiante=id_estudiante)
        .order_by(Documento.fecha_solicitud.desc())
        .all()
    )


def obtener_documento(id_documento):
    """Un documento por su ID."""
    documento = db.session.get(Documento, id_documento)
    if not documento:
        raise DocumentoNoEncontradoError()
    return documento


def obtener_todos_documentos():
    """Todos los documentos."""
    return Documento.query.order_by(Documento.fecha_solicitud.desc()).all()
