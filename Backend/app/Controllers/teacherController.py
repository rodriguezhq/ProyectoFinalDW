from app.extensions import db
from app.schemas.course_schema import SilaboResponse
from app.services.auth_service import usuario_actual
from app.services.course_service import obtener_horario_docente, subir_silabo
from app.models.periodo_academico import PeriodoAcademico
from app.models.curso import Curso


def mis_secciones():
    usuario = usuario_actual()
    if not usuario or not usuario.docente:
        return {"msg": "Solo un docente tiene secciones propias"}, 403

    periodo_activo = PeriodoAcademico.query.filter_by(estado="activo").first()
    if not periodo_activo:
        return {"secciones": []}, 200

    bloques = obtener_horario_docente(periodo_activo.id_periodo, usuario.docente.id_docente)
    
    # Formatear los bloques asignados para simular secciones y asegurar compatibilidad
    secciones_formateadas = []
    for b in bloques:
        dia_corto = {
            "LUNES": "Lun",
            "MARTES": "Mar",
            "MIERCOLES": "Mie",
            "JUEVES": "Jue",
            "VIERNES": "Vie",
            "SABADO": "Sab"
        }.get(b.get("dia").upper(), "Lun")
        
        secciones_formateadas.append({
            "id_seccion": b.get("id_curso"),  # Simulamos id_seccion usando id_curso para el envío de sílabos
            "codigo": b.get("codigo", "SEC-01"),
            "horario": f"{dia_corto} {b.get('horaInicio')}-{b.get('horaFin')}",
            "curso_nombre": b.get("curso_nombre"),
            "id_curso": b.get("id_curso"),
            "id_docente": b.get("id_docente")
        })
        
    return {"secciones": secciones_formateadas}, 200


def subir_silabo_ctrl(id_curso, form):
    usuario = usuario_actual()
    if not usuario or not usuario.docente:
        return {"msg": "Solo un docente puede subir el sílabo"}, 403

    curso = db.session.get(Curso, id_curso)
    if not curso:
        return {"msg": "Curso no encontrado"}, 404

    # Validar que el docente tenga asignado este curso en el periodo activo
    periodo_activo = PeriodoAcademico.query.filter_by(estado="activo").first()
    if not periodo_activo:
        return {"msg": "No hay un periodo académico activo"}, 400
        
    bloques = obtener_horario_docente(periodo_activo.id_periodo, usuario.docente.id_docente)
    es_su_curso = any(b.get("id_curso") and int(b.get("id_curso")) == id_curso for b in bloques)
    if not es_su_curso:
        return {"msg": "No tienes permiso para subir el sílabo de este curso"}, 403

    silabo = subir_silabo(curso, form.archivo)
    return SilaboResponse(id_silabo=silabo.id_silabo, archivo=silabo.archivo, estado=silabo.estado).model_dump(), 201
