from app.extensions import db
from app.schemas.course_schema import SilaboResponse
from app.services.auth_service import usuario_actual
from app.services.course_service import obtener_horario_docente, subir_silabo
from app.models.periodo_academico import PeriodoAcademico
from app.models.curso import Curso


def mis_secciones(id_periodo=None):
    usuario = usuario_actual()
    if not usuario or not usuario.docente:
        return {"msg": "Solo un docente tiene secciones propias"}, 403

    if id_periodo is None:
        periodo_activo = PeriodoAcademico.query.filter_by(estado="activo").first()
        if not periodo_activo:
            return {"secciones": []}, 200
        id_periodo = periodo_activo.id_periodo

    bloques = obtener_horario_docente(id_periodo, usuario.docente.id_docente)
    
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
            "id_docente": b.get("id_docente"),
            "id_periodo": id_periodo
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

    silabo = subir_silabo(curso, form.archivo, periodo_activo.id_periodo)
    return SilaboResponse(id_silabo=silabo.id_silabo, archivo=silabo.archivo, estado=silabo.estado).model_dump(), 201


def mis_periodos_ctrl():
    # Obtiene todos los periodos academicos en los que el docente tiene carga horaria asignada
    usuario_docente = usuario_actual()
    if not usuario_docente or not usuario_docente.docente:
        return {"msg": "Solo un docente puede ver sus periodos asignados"}, 403

    from app.models.horario import Horario
    
    # Consultar todos los horarios
    todos_los_horarios = Horario.query.all()
    ids_periodos_unicos = set()
    
    for item_horario in todos_los_horarios:
        for bloque in item_horario.detalles:
            # Comprobar si el bloque pertenece al docente actual
            if bloque.get("id_docente") and int(bloque.get("id_docente")) == usuario_docente.docente.id_docente:
                ids_periodos_unicos.add(item_horario.id_periodo)
                break
                
    if not ids_periodos_unicos:
        # Retornamos el periodo activo por defecto si no tiene horarios registrados, para no mostrar vacio al inicio
        periodo_activo = PeriodoAcademico.query.filter_by(estado="activo").first()
        if periodo_activo:
            return {"periodos": [{
                "id_periodo": periodo_activo.id_periodo,
                "nombre": periodo_activo.nombre,
                "estado": periodo_activo.estado
            }]}, 200
        return {"periodos": []}, 200

    # Consultar los periodos correspondientes en la BD
    periodos_objeto = PeriodoAcademico.query.filter(PeriodoAcademico.id_periodo.in_(list(ids_periodos_unicos))).all()
    
    # Formatear la respuesta
    respuesta_periodos = []
    for item_periodo in periodos_objeto:
        respuesta_periodos.append({
            "id_periodo": item_periodo.id_periodo,
            "nombre": item_periodo.nombre,
            "estado": item_periodo.estado
        })
        
    # Ordenar los periodos por ID de forma descendente (los mas recientes primero)
    respuesta_periodos.sort(key=lambda x: x["id_periodo"], reverse=True)
    return {"periodos": respuesta_periodos}, 200


def curso_detalle_docente_ctrl(id_curso, id_periodo):
    usuario = usuario_actual()
    if not usuario or not usuario.docente:
        return {"msg": "Solo un docente puede ver el detalle del curso"}, 403

    curso_objeto = db.session.get(Curso, id_curso)
    if not curso_objeto:
        return {"msg": "Curso no encontrado"}, 404

    periodo_objeto = db.session.get(PeriodoAcademico, id_periodo)
    if not periodo_objeto:
        return {"msg": "Periodo no encontrado"}, 404

    # Validar que el docente tenga asignado este curso en este periodo
    bloques_docente = obtener_horario_docente(id_periodo, usuario.docente.id_docente)
    es_su_curso = any(b.get("id_curso") and int(b.get("id_curso")) == id_curso for b in bloques_docente)
    if not es_su_curso:
        return {"msg": "No tienes permiso para ver el detalle de este curso"}, 403

    # Obtener el silabo del curso en este periodo
    from app.models.silabo import Silabo
    silabo_objeto = Silabo.query.filter_by(id_curso=id_curso, id_periodo=id_periodo).first()

    diccionario_silabo = None
    if silabo_objeto:
        diccionario_silabo = {
            "id_silabo": silabo_objeto.id_silabo,
            "archivo": silabo_objeto.archivo,
            "estado": silabo_objeto.estado
        }

    # Especialidad del curso (por simplicidad, la primera especialidad del curso, o la facultad)
    nombre_especialidad = curso_objeto.especialidades[0].nombre if curso_objeto.especialidades else curso_objeto.facultad.nombre

    return {
        "curso": {
            "id_curso": curso_objeto.id_curso,
            "codigo": curso_objeto.codigo,
            "nombre": curso_objeto.nombre,
            "creditos": curso_objeto.creditos,
            "ciclo": curso_objeto.ciclo,
            "especialidad_nombre": nombre_especialidad
        },
        "periodo": {
            "id_periodo": periodo_objeto.id_periodo,
            "nombre": periodo_objeto.nombre,
            "activo": periodo_objeto.estado == "activo"
        },
        "silabo": diccionario_silabo
    }, 200


def curso_estudiantes_ctrl(id_curso, id_periodo):
    usuario = usuario_actual()
    if not usuario or not usuario.docente:
        return {"msg": "Solo un docente puede ver los estudiantes del curso"}, 403

    curso_objeto = db.session.get(Curso, id_curso)
    if not curso_objeto:
        return {"msg": "Curso no encontrado"}, 404

    periodo_objeto = db.session.get(PeriodoAcademico, id_periodo)
    if not periodo_objeto:
        return {"msg": "Periodo no encontrado"}, 404

    # Validar que el docente tenga asignado este curso en este periodo
    bloques_docente = obtener_horario_docente(id_periodo, usuario.docente.id_docente)
    es_su_curso = any(b.get("id_curso") and int(b.get("id_curso")) == id_curso for b in bloques_docente)
    if not es_su_curso:
        return {"msg": "No tienes permiso para ver los estudiantes de este curso"}, 403

    # Obtener la nómina de estudiantes y calificaciones
    from app.services.grade_service import obtener_notas_curso_periodo
    notas_estudiantes = obtener_notas_curso_periodo(id_curso, id_periodo)

    return {
        "notas": notas_estudiantes,
        "activo": periodo_objeto.estado == "activo"
    }, 200

