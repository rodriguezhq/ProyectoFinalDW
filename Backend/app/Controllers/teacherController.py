from app.Controllers.courseController import _serializar_seccion
from app.schemas.course_schema import SilaboResponse
from app.services.auth_service import usuario_actual
from app.services.course_service import SeccionNoEncontradaError, obtener_seccion, secciones_de_docente, subir_silabo


def mis_secciones():
    usuario = usuario_actual()
    if not usuario.docente:
        return {"msg": "Solo un docente tiene secciones propias"}, 403

    secciones = secciones_de_docente(usuario.docente.id_docente)
    return {"secciones": [_serializar_seccion(s) for s in secciones]}, 200


def subir_silabo_ctrl(id_seccion, form):
    usuario = usuario_actual()
    if not usuario.docente:
        return {"msg": "Solo un docente puede subir el sílabo"}, 403

    try:
        seccion = obtener_seccion(id_seccion)
    except SeccionNoEncontradaError:
        return {"msg": "Sección no encontrada"}, 404

    if seccion.id_docente != usuario.docente.id_docente:
        return {"msg": "No tienes permiso para subir el sílabo de esta sección"}, 403

    silabo = subir_silabo(seccion, form.archivo)
    return SilaboResponse(id_silabo=silabo.id_silabo, archivo=silabo.archivo, estado=silabo.estado).model_dump(), 201
