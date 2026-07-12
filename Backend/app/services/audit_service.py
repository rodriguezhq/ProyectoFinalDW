from datetime import datetime

from app.extensions import db
from app.models.auditoria import Auditoria
from app.utils.pagination import paginar_query


def registrar_auditoria(accion, tabla, registro=None, id_usuario=None, ip=None):
    entrada = Auditoria(
        accion=accion,
        tabla=tabla,
        registro=str(registro) if registro is not None else None,
        fecha=datetime.utcnow(),
        ip=ip,
        id_usuario=id_usuario,
    )
    db.session.add(entrada)
    db.session.commit()
    return entrada


def listar_auditoria(id_usuario=None, accion=None, page=1, per_page=50):
    query = Auditoria.query
    if id_usuario is not None:
        query = query.filter_by(id_usuario=id_usuario)
    if accion is not None:
        query = query.filter_by(accion=accion)

    query = query.order_by(Auditoria.fecha.desc())
    return paginar_query(query, page, per_page)
