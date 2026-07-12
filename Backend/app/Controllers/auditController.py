from app.schemas.user_schema import AuditoriaItem
from app.services.audit_service import listar_auditoria


def listar_auditoria_ctrl(id_usuario=None, accion=None, page=1, per_page=50):
    registros, total = listar_auditoria(id_usuario, accion, page, per_page)
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
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "hay_mas": (page * per_page) < total,
    }, 200
