

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
    notas = grade_service.obtener_notas_estudiante(id_estudiante)
    return {"msg": "Notas del estudiante", "notas": notas}, 200


def consultar_notas_seccion(id_seccion):
    """
    Devuelve todas las notas de una sección (para el docente).
    Retorna: (dict_respuesta, status_code)
    """
    notas = grade_service.obtener_notas_seccion(id_seccion)
    return {"msg": "Notas de la sección", "notas": notas}, 200
