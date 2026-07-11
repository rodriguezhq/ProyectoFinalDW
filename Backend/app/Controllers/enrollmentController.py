from flask import Response, request

from app.schemas.enrollment_schema import MatriculaDetalleResponse, MatriculaResponse, PagoResponse
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria
from app.services.enrollment_service import (
    EstadoInvalidoError,
    EstudianteInactivoError,
    MatriculaDuplicadaError,
    MatriculaNoEncontradaError,
    PeriodoCerradoError,
    PeriodoNoEncontradoError,
    CursoFueraDePlanError,
    PagoNoEncontradoError,
    SeccionNoEncontradaError,
    SeccionLlenaError,
    CursoNoEncontradoError,
    estadisticas_periodo,
    generar_ficha_pdf,
    listar_todas_matriculas,
    obtener_matricula,
    obtener_matriculas_estudiante,
    registrar_pago,
    solicitar_matricula,
    validar_matricula,
    validar_pago,
    rechazar_matricula,
)
from app.models.horario import Horario


def _serializar_matricula(matricula):
    estudiante = matricula.estudiante
    detalles_serialized = []
    
    for d in matricula.detalles:
        # Recuperar dinámicamente el horario del curso y sección del estudiante
        bloque_horario = ""
        h_obj = Horario.query.filter_by(
            id_periodo=matricula.id_periodo,
            id_especialidad=estudiante.id_especialidad,
            ciclo=d.curso.ciclo
        ).first()
        if h_obj:
            bloques = [
                b for b in h_obj.detalles 
                if b.get("id_curso") == d.id_curso and (b.get("seccion") or 'A') == d.seccion.codigo
            ]
            if bloques:
                bloque_horario = ", ".join([f"{b.get('dia')} {b.get('horaInicio')}-{b.get('horaFin')}" for b in bloques])

        detalles_serialized.append(
            MatriculaDetalleResponse(
                id_matricula_detalle=d.id_matricula_detalle,
                id_curso=d.id_curso,
                curso=d.curso.nombre,
                codigo_curso=d.curso.codigo,
                id_seccion=d.id_seccion,
                seccion_codigo=d.seccion.codigo,
                estado=d.estado,
                horario=bloque_horario or None
            )
        )

    return MatriculaResponse(
        id_matricula=matricula.id_matricula,
        id_estudiante=estudiante.id_estudiante,
        estudiante_nombre=f"{estudiante.nombres} {estudiante.apellidos}",
        id_periodo=matricula.id_periodo,
        fecha_matricula=matricula.fecha_matricula,
        estado=matricula.estado,
        detalles=detalles_serialized
    ).model_dump(mode="json")


def solicitar(body):
    usuario = usuario_actual()
    if not usuario.estudiante:
        return {"msg": "Solo un estudiante puede solicitar matrícula"}, 403

    try:
        secciones_data = [{"id_curso": s.id_curso, "id_seccion": s.id_seccion} for s in body.secciones]
        matricula = solicitar_matricula(usuario.estudiante.id_estudiante, body.id_periodo, secciones_data)
    except EstudianteInactivoError:
        return {"msg": "El estudiante no está activo"}, 403
    except PeriodoNoEncontradoError:
        return {"msg": "El periodo académico no existe"}, 404
    except PeriodoCerradoError:
        return {"msg": "El periodo académico no está activo para matrícula"}, 409
    except MatriculaDuplicadaError:
        return {"msg": "Ya existe una matrícula para este periodo"}, 409
    except SeccionNoEncontradaError:
        return {"msg": "Una o más secciones no existen"}, 404
    except SeccionLlenaError:
        return {"msg": "Una o más secciones no tienen vacantes disponibles"}, 409
    except CursoFueraDePlanError:
        return {"msg": "El estudiante solo puede matricularse en cursos de su plan de estudios (malla curricular)"}, 400
    except CursoNoEncontradoError:
        return {"msg": "Uno o más cursos indicados no existen"}, 404

    return _serializar_matricula(matricula), 201


def mis_matriculas():
    usuario = usuario_actual()
    if not usuario.estudiante:
        return {"msg": "Solo un estudiante tiene matrículas propias"}, 403

    matriculas = obtener_matriculas_estudiante(usuario.estudiante.id_estudiante)
    return {"matriculas": [_serializar_matricula(m) for m in matriculas]}, 200


def listar_todas(id_periodo=None, estado=None):
    matriculas = listar_todas_matriculas(id_periodo, estado)
    return {"matriculas": [_serializar_matricula(m) for m in matriculas]}, 200


def validar(id_matricula):
    try:
        matricula = validar_matricula(id_matricula)
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula no está en estado pendiente"}, 409

    actor = usuario_actual()
    registrar_auditoria(
        "aprobar_matricula",
        "matricula",
        registro=matricula.id_matricula,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )
    return _serializar_matricula(matricula), 200


def rechazar(id_matricula):
    try:
        matricula = rechazar_matricula(id_matricula)
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula no está en estado pendiente"}, 409

    actor = usuario_actual()
    registrar_auditoria(
        "rechazar_matricula",
        "matricula",
        registro=matricula.id_matricula,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )
    return _serializar_matricula(matricula), 200


def pago(id_matricula, body):
    try:
        pago_creado = registrar_pago(id_matricula, body.monto, body.metodo_pago, body.codigo_operacion)
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula debe estar validada antes de registrar el pago"}, 409

    actor = usuario_actual()
    registrar_auditoria(
        "registrar_pago",
        "pago",
        registro=pago_creado.id_pago,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )

    data = PagoResponse(
        id_pago=pago_creado.id_pago, monto=float(pago_creado.monto), estado=pago_creado.estado
    ).model_dump()
    return data, 201


def validar_pago_ctrl(id_pago):
    try:
        pago_confirmado = validar_pago(id_pago)
    except PagoNoEncontradoError:
        return {"msg": "Pago no encontrado"}, 404
    except EstadoInvalidoError:
        return {"msg": "El pago no está en estado pendiente"}, 409

    actor = usuario_actual()
    registrar_auditoria(
        "validar_pago",
        "pago",
        registro=pago_confirmado.id_pago,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr,
    )

    data = PagoResponse(
        id_pago=pago_confirmado.id_pago, monto=float(pago_confirmado.monto), estado=pago_confirmado.estado
    ).model_dump()
    return data, 200


def ficha(id_matricula):
    try:
        matricula = obtener_matricula(id_matricula)
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404

    usuario = usuario_actual()
    es_dueno = usuario.estudiante and usuario.estudiante.id_estudiante == matricula.id_estudiante
    es_admin = usuario.rol and usuario.rol.nombre == "Administrador"
    if not (es_dueno or es_admin):
        return {"msg": "No tienes permiso para ver esta ficha"}, 403

    pdf_bytes = generar_ficha_pdf(matricula)
    return Response(
        pdf_bytes,
        mimetype="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ficha_matricula_{id_matricula}.pdf"},
    )


def estadisticas(id_periodo):
    return estadisticas_periodo(id_periodo), 200
