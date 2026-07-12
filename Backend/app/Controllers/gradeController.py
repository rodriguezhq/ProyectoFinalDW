

from flask import request
from app.services import grade_service
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria


def registrar_notas(id_matricula_detalle, body):
    data = body.model_dump(exclude_none=True)

    nota_dict, error = grade_service.registrar_notas(id_matricula_detalle, data)

    if error:
        return {"msg": error}, 404

    actor = usuario_actual()
    registrar_auditoria(
        "actualizar_nota",
        "nota",
        registro=str(id_matricula_detalle),
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )

    return {"msg": "Notas registradas exitosamente", "nota": nota_dict}, 200


def consultar_notas_estudiante(id_estudiante):
    """
    Devuelve todas las notas de un estudiante (todos los periodos).
    Retorna: (dict_respuesta, status_code)
    """
    estudiante, notas = grade_service.obtener_notas_estudiante(id_estudiante)
    if not estudiante:
        return {"msg": "Estudiante no encontrado"}, 404
    return {"msg": "Notas del estudiante", "estudiante": estudiante, "notas": notas}, 200


def consultar_notas_curso(id_curso):
    """
    Devuelve todas las notas de un curso (para el docente).
    Retorna: (dict_respuesta, status_code)
    """
    notas = grade_service.obtener_notas_curso(id_curso)
    return {"msg": "Notas de la sección", "notas": notas}, 200


def obtener_actas_periodo(id_periodo):
    actas = grade_service.obtener_actas_periodo(id_periodo)
    return {"actas": actas}, 200


def obtener_detalle_acta(id_seccion, id_curso):
    detalle = grade_service.obtener_detalle_acta(id_seccion, id_curso)
    return {"detalle": detalle}, 200


def validar_acta(id_seccion, id_curso):
    success, error = grade_service.validar_acta(id_seccion, id_curso)
    if not success:
        return {"msg": error}, 400

    actor = usuario_actual()
    registrar_auditoria(
        "validar_acta",
        "seccion_curso",
        registro=f"seccion:{id_seccion}-curso:{id_curso}",
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )
    return {"msg": "Acta validada y consolidada exitosamente"}, 200

