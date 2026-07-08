from app.schemas.certificate_schema import DocumentoResponse
from app.services.auth_service import usuario_actual
from app.services.certificate_service import (
    DocumentoNoEncontradoError,
    EstadoInvalidoError,
    EstudianteInactivoError,
    EstudianteNoEncontradoError,
    autorizar_documento,
    emitir_documento,
    obtener_documento,
    obtener_documentos_estudiante,
    obtener_todos_documentos,
    solicitar_documento,
)


def _serializar_documento(doc):
    return DocumentoResponse(
        id_documento=doc.id_documento,
        tipo_documento=doc.tipo_documento,
        fecha_solicitado=doc.fecha_solicitud,
        fecha_emision=doc.fecha_emision,
        estado=doc.estado,
        archivo=doc.archivo,
        codigo_qr=doc.codigo_qr,
        id_estudiante=doc.id_estudiante,
        id_usuario_emite=doc.id_usuario_emite,
        id_usuario_autoriza=doc.id_usuario_autoriza,
    ).model_dump(mode="json")


def solicitar(body):
    """Estudiante solicita un documento."""
    usuario = usuario_actual()
    if not usuario.estudiante:
        return {"msg": "Solo un estudiante puede solicitar documentos"}, 403
    try:
        doc = solicitar_documento(usuario.estudiante.id_estudiante, body.tipo_documento)
    except EstudianteNoEncontradoError:
        return {"msg": "Estudiante no encontrado"}, 404
    except EstudianteInactivoError:
        return {"msg": "El estudiante no está activo"}, 403
    return _serializar_documento(doc), 201


def autorizar(id_documento):
    """Dirección autoriza la emisión de un documento."""
    usuario = usuario_actual()
    try:
        doc = autorizar_documento(id_documento, usuario.id_usuario)
    except DocumentoNoEncontradoError:
        return {"msg": "Documento no encontrado"}, 404
    except EstadoInvalidoError:
        return {
            "msg": "El documento debe estar en estado 'solicitado' para autorizarlo"
        }, 409
    return _serializar_documento(doc), 200


def emitir(id_documento):
    """Admin emite el documento con generación de QR."""
    usuario = usuario_actual()
    try:
        doc = emitir_documento(id_documento, usuario.id_usuario)
    except DocumentoNoEncontradoError:
        return {"msg": "Documento no encontrado"}, 404
    except EstadoInvalidoError:
        return {
            "msg": "El documento debe estar en estado 'autorizado' para emitirlo"
        }, 409
    return _serializar_documento(doc), 200


def mis_documentos():
    """Lista los documentos del estudiante autenticado."""
    usuario = usuario_actual()
    if not usuario.estudiante:
        return {"msg": "Solo un estudiante tiene documentos propios"}, 403
    docs = obtener_documentos_estudiante(usuario.estudiante.id_estudiante)
    return {"documentos": [_serializar_documento(d) for d in docs]}, 200


def detalle(id_documento):
    """Ver detalle de un documento (solo dueño/admin/dirección)."""
    try:
        doc = obtener_documento(id_documento)
    except DocumentoNoEncontradoError:
        return {"msg": "Documento no encontrado"}, 404
    usuario = usuario_actual()
    es_dueno = (
        usuario.estudiante and usuario.estudiante.id_estudiante == doc.id_estudiante
    )
    es_admin = usuario.rol and usuario.rol.nombre in ("Administrador", "Direccion")
    if not (es_dueno or es_admin):
        return {"msg": "No tienes permiso para ver este documento"}, 403
    return _serializar_documento(doc), 200


def listar_todos():
    """Admin/Dirección: lista todos los documentos."""
    docs = obtener_todos_documentos()
    return {"documentos": [_serializar_documento(d) for d in docs]}, 200
