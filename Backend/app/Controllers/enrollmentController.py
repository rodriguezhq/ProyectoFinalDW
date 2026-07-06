from flask import Response

from app.schemas.enrollment_schema import MatriculaDetalleResponse, MatriculaResponse, PagoResponse
from app.services.auth_service import usuario_actual
from app.services.enrollment_service import (
    EstadoInvalidoError,
    EstudianteInactivoError,
    MatriculaDuplicadaError,
    MatriculaNoEncontradaError,
    PeriodoCerradoError,
    PeriodoNoEncontradoError,
    SeccionLlenaError,
    SeccionNoEncontradaError,
    estadisticas_periodo,
    generar_ficha_pdf,
    obtener_matricula,
    obtener_matriculas_estudiante,
    registrar_pago,
    solicitar_matricula,
    validar_matricula,
)


def _serializar_matricula(matricula):
    return MatriculaResponse(
        id_matricula=matricula.id_matricula,
        id_periodo=matricula.id_periodo,
        fecha_matricula=matricula.fecha_matricula,
        estado=matricula.estado,
        detalles=[
            MatriculaDetalleResponse(
                id_matricula_detalle=d.id_matricula_detalle,
                id_seccion=d.id_seccion,
                curso=d.seccion.plan_curso.curso.nombre,
                codigo_seccion=d.seccion.codigo,
                estado=d.estado,
            )
            for d in matricula.detalles
        ],
    ).model_dump(mode="json")


def solicitar(body):
    usuario = usuario_actual()
    if not usuario.estudiante:
        return {"msg": "Solo un estudiante puede solicitar matrícula"}, 403

    try:
        matricula = solicitar_matricula(usuario.estudiante.id_estudiante, body.id_periodo, body.secciones)
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
    except SeccionLlenaError as e:
        return {"msg": f"Secciones sin cupo: {', '.join(e.secciones_llenas)}"}, 409

    return _serializar_matricula(matricula), 201


def mis_matriculas():
    usuario = usuario_actual()
    if not usuario.estudiante:
        return {"msg": "Solo un estudiante tiene matrículas propias"}, 403

    matriculas = obtener_matriculas_estudiante(usuario.estudiante.id_estudiante)
    return {"matriculas": [_serializar_matricula(m) for m in matriculas]}, 200


def validar(id_matricula):
    try:
        matricula = validar_matricula(id_matricula)
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula no está en estado pendiente"}, 409

    return _serializar_matricula(matricula), 200


def pago(id_matricula, body):
    try:
        pago_creado = registrar_pago(id_matricula, body.monto, body.metodo_pago, body.codigo_operacion)
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula debe estar validada antes de registrar el pago"}, 409

    data = PagoResponse(
        id_pago=pago_creado.id_pago, monto=float(pago_creado.monto), estado=pago_creado.estado
    ).model_dump()
    return data, 201


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
