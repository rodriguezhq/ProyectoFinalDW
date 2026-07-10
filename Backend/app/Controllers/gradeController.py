from app.services.auth_service import usuario_actual
from app.services import grade_service


def registrar_notas(id_matricula_detalle, body):
    data = body.model_dump(exclude_none=True)

    nota_dict, error = grade_service.registrar_notas(id_matricula_detalle, data)

    if error:
        return {"msg": error}, 404

    return {"msg": "Notas registradas exitosamente", "nota": nota_dict}, 200


def consultar_notas_estudiante(id_estudiante):
    """
    Devuelve todas las notas de un estudiante (todos los periodos).
    Retorna: (dict_respuesta, status_code)
    """
    estudiante, notas = grade_service.obtener_notas_estudiante(id_estudiante)
    if not estudiante:
        return {"msg": "Estudiante no encontrado"}, 404
    return {
        "msg": "Notas del estudiante",
        "estudiante": estudiante,
        "notas": notas,
    }, 200


def consultar_notas_seccion(id_seccion):
    """
    Devuelve todas las notas de una sección (para el docente).
    Retorna: (dict_respuesta, status_code)
    """
    notas = grade_service.obtener_notas_seccion(id_seccion)
    return {"msg": "Notas de la sección", "notas": notas}, 200


def registrar_notas_bulk(body):
    """
    Registra o actualiza notas de varios estudiantes en lote.
    Retorna: (dict_respuesta, status_code)
    """
    notas_data = [item.model_dump(exclude_none=False) for item in body.notas]
    msg, error = grade_service.registrar_notas_bulk(notas_data)
    if error:
        return {"msg": error}, 400
    return {"msg": msg}, 200


def consultar_mis_notas():
    """
    Devuelve todas las notas del estudiante autenticado.
    Retorna: (dict_respuesta, status_code)
    """
    usuario = usuario_actual()
    if not usuario or not usuario.estudiante:
        return {"msg": "El usuario no es un estudiante o no tiene ficha asociada"}, 403
    estudiante, notas = grade_service.obtener_notas_estudiante(
        usuario.estudiante.id_estudiante
    )
    return {
        "msg": "Notas obtenidas exitosamente",
        "estudiante": estudiante,
        "notas": notas,
    }, 200
