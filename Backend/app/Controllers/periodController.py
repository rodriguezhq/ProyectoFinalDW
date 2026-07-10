from flask import request
from app.extensions import db
from app.models.periodo_academico import PeriodoAcademico
from app.models.seccion import Seccion
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria
from app.schemas.period_schema import PeriodoResponse


def _serializar_periodo(p):
    return PeriodoResponse(
        id_periodo=p.id_periodo,
        nombre=p.nombre,
        fecha_inicio=p.fecha_inicio,
        fecha_fin=p.fecha_fin,
        estado=p.estado,
    ).model_dump(mode="json")


def crear_periodo_ctrl(body):
    # Verificar duplicado por nombre
    existente = PeriodoAcademico.query.filter_by(nombre=body.nombre).first()
    if existente:
        return {"msg": "Ya existe un periodo académico con ese nombre"}, 409

    # REGLA: Al crear un nuevo periodo, se cierran automáticamente todos los demás periodos y sus secciones
    periodos_activos = PeriodoAcademico.query.filter_by(estado="activo").all()
    for p_ant in periodos_activos:
        p_ant.estado = "cerrado"
        for sec in p_ant.secciones:
            sec.estado = "cerrada"

    periodo = PeriodoAcademico(
        nombre=body.nombre,
        fecha_inicio=body.fecha_inicio,
        fecha_fin=body.fecha_fin,
        estado="activo",  # Se crea activo por defecto
    )
    db.session.add(periodo)
    db.session.commit()

    actor = usuario_actual()
    registrar_auditoria(
        "crear_periodo",
        "periodo_academico",
        registro=periodo.id_periodo,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )

    return _serializar_periodo(periodo), 201


def listar_periodos_ctrl():
    periodos = PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).all()
    return {"periodos": [_serializar_periodo(p) for p in periodos]}, 200


def activar_periodo_ctrl(id_periodo):
    periodo = db.session.get(PeriodoAcademico, id_periodo)
    if not periodo:
        return {"msg": "Periodo académico no encontrado"}, 404

    if periodo.estado == "activo":
        return {"msg": "El periodo ya se encuentra activo"}, 400

    # REGLA: Al abrir/activar un periodo manualmente, NO se cierran los otros.
    # Simplemente se activa el periodo seleccionado y se reabren sus secciones asociadas.
    periodo.estado = "activo"
    for sec in periodo.secciones:
        sec.estado = "abierta"
        
    db.session.commit()

    actor = usuario_actual()
    registrar_auditoria(
        "activar_periodo",
        "periodo_academico",
        registro=periodo.id_periodo,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )

    return _serializar_periodo(periodo), 200
