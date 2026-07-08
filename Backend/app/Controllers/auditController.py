from app.schemas.user_schema import AuditoriaItem
from app.services.audit_service import listar_auditoria


def listar_auditoria_ctrl(id_usuario=None, accion=None):
    registros = listar_auditoria(id_usuario, accion)
    return {
        "auditorias": [
            AuditoriaItem(
                id_auditoria=r.id_auditoria,
                accion=r.accion,
                tabla=r.tabla,
                registro=r.registro,
                fecha=r.fecha,
                ip=r.ip,
                id_usuario=r.id_usuario,
                usuario_nombre=r.usuario.nombres_efectivos if r.usuario else None,
            ).model_dump(mode="json")
            for r in registros
        ]
    }, 200
