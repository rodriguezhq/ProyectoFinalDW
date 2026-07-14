import os
from datetime import datetime
from io import BytesIO
from flask import request, send_file
from sqlalchemy.orm import joinedload, selectinload
from app.extensions import db
from app.models.usuario import Usuario
from app.models.estudiante import Estudiante
from app.models.periodo_academico import PeriodoAcademico
from app.models.matricula import Matricula
from app.models.matricula_detalle import MatriculaDetalle
from app.models.nota import Nota
from app.models.seccion import Seccion
from app.models.curso import Curso
from app.models.horario import Horario
from app.models.docente import Docente
from app.models.especialidad import Especialidad
from app.models.pago import Pago
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria
from app.schemas.enrollment_schema import BloqueHorarioSchema

# ReportLab para la generacion del PDF
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def _obtener_ciclo_estudiante(estudiante, periodo_actual_id):
    # Si el ciclo está registrado directamente en el estudiante, usarlo
    if estudiante.ciclo is not None:
        return estudiante.ciclo

    # 1. Si ya tiene matricula en el periodo actual
    matricula_actual = Matricula.query.filter_by(
        id_estudiante=estudiante.id_estudiante, id_periodo=periodo_actual_id
    ).first()
    if matricula_actual and matricula_actual.detalles:
        for det in matricula_actual.detalles:
            if det.seccion and det.seccion.ciclo:
                return det.seccion.ciclo

    # 2. Si no, buscar la ultima matricula en periodos pasados
    matricula_pasada = Matricula.query.filter(
        Matricula.id_estudiante == estudiante.id_estudiante,
        Matricula.id_periodo != periodo_actual_id
    ).order_by(Matricula.id_periodo.desc()).first()

    if matricula_pasada and matricula_pasada.detalles:
        ciclo_max = 0
        for det in matricula_pasada.detalles:
            if det.seccion and det.seccion.ciclo:
                ciclo_max = max(ciclo_max, det.seccion.ciclo)
        if ciclo_max > 0:
            return min(ciclo_max + 1, 10)

    # 3. Por defecto (estudiante nuevo)
    return 1


def obtener_oferta_academica_ctrl():
    actor = usuario_actual()
    if not actor or not actor.estudiante:
        return {"msg": "Solo un estudiante puede realizar esta consulta"}, 403

    estudiante = actor.estudiante

    # Obtener el periodo de matricula activo
    periodo_activo = PeriodoAcademico.query.filter_by(es_matricula_activa=True).first()
    if not periodo_activo:
        return {"msg": "No hay un periodo de matrícula activo en este momento"}, 400

    # Verificar si ya se encuentra matriculado en este periodo (excluyendo rechazadas)
    matricula_existente = Matricula.query.filter(
        Matricula.id_estudiante == estudiante.id_estudiante,
        Matricula.id_periodo == periodo_activo.id_periodo,
        Matricula.estado != "rechazada"
    ).first()

    if matricula_existente:
        # Obtener los detalles de su matricula actual
        cursos_matriculados = []
        for det in matricula_existente.detalles:
            seccion = det.seccion
            horario_objeto = Horario.query.filter_by(
                id_periodo=periodo_activo.id_periodo,
                id_especialidad=seccion.id_especialidad,
                ciclo=seccion.ciclo
            ).first()

            bloques = []
            if horario_objeto:
                for b in (horario_objeto.detalles or []):
                    if b.get("seccion") == seccion.codigo and b.get("id_curso") and int(b.get("id_curso")) == det.id_curso:
                        docente_nombre = None
                        if b.get("id_docente"):
                            docente = db.session.get(Docente, int(b.get("id_docente")))
                            if docente:
                                docente_nombre = f"{docente.nombres} {docente.apellidos}"
                        
                        bloques.append({
                            "codigo": b.get("codigo", ""),
                            "seccion": b.get("seccion", ""),
                            "dia": b.get("dia", ""),
                            "horaInicio": b.get("horaInicio", ""),
                            "horaFin": b.get("horaFin", ""),
                            "id_curso": int(b.get("id_curso")),
                            "curso_nombre": b.get("curso_nombre", ""),
                            "id_docente": int(b.get("id_docente")) if b.get("id_docente") else None,
                            "docente_nombre": docente_nombre
                        })

            cursos_matriculados.append({
                "id_curso": det.curso.id_curso,
                "codigo": det.curso.codigo,
                "nombre": det.curso.nombre,
                "creditos": det.curso.creditos,
                "seccion_codigo": seccion.codigo,
                "horarios": bloques
            })

        return {
            "ya_matriculado": True,
            "id_matricula": matricula_existente.id_matricula,
            "estado": "confirmada" if matricula_existente.estado in ["confirmada", "pagada", "validada"] else matricula_existente.estado,
            "periodo_nombre": periodo_activo.nombre,
            "cursos": cursos_matriculados
        }, 200

    # Si no esta matriculado, obtener la oferta de cursos de su ciclo y especialidad
    ciclo_estudiante = _obtener_ciclo_estudiante(estudiante, periodo_activo.id_periodo)
    cursos_plan = Curso.query.join(Curso.especialidades).filter(
        Especialidad.id_especialidad == estudiante.id_especialidad,
        Curso.ciclo == ciclo_estudiante
    ).all()

    lista_cursos_oferta = []
    for curso in cursos_plan:
        secciones = Seccion.query.filter_by(
            id_especialidad=estudiante.id_especialidad,
            ciclo=curso.ciclo,
            id_periodo=periodo_activo.id_periodo
        ).all()

        lista_secciones_oferta = []
        for sec in secciones:
            horario_objeto = Horario.query.filter_by(
                id_periodo=periodo_activo.id_periodo,
                id_especialidad=sec.id_especialidad,
                ciclo=sec.ciclo
            ).first()

            bloques_sec = []
            if horario_objeto:
                for b in (horario_objeto.detalles or []):
                    if b.get("seccion") == sec.codigo and b.get("id_curso") and int(b.get("id_curso")) == curso.id_curso:
                        docente_nombre = None
                        if b.get("id_docente"):
                            docente = db.session.get(Docente, int(b.get("id_docente")))
                            if docente:
                                docente_nombre = f"{docente.nombres} {docente.apellidos}"

                        bloques_sec.append({
                            "codigo": b.get("codigo", ""),
                            "seccion": b.get("seccion", ""),
                            "dia": b.get("dia", ""),
                            "horaInicio": b.get("horaInicio", ""),
                            "horaFin": b.get("horaFin", ""),
                            "id_curso": int(b.get("id_curso")),
                            "curso_nombre": b.get("curso_nombre", ""),
                            "id_docente": int(b.get("id_docente")) if b.get("id_docente") else None,
                            "docente_nombre": docente_nombre
                        })

            if len(bloques_sec) > 0:
                lista_secciones_oferta.append({
                    "id_seccion": sec.id_seccion,
                    "codigo": sec.codigo,
                    "ciclo": sec.ciclo,
                    "horarios": bloques_sec
                })

        if len(lista_secciones_oferta) > 0:
            lista_cursos_oferta.append({
                "id_curso": curso.id_curso,
                "codigo": curso.codigo,
                "nombre": curso.nombre,
                "creditos": curso.creditos,
                "ciclo": curso.ciclo,
                "secciones": lista_secciones_oferta
            })

    return {
        "ya_matriculado": False,
        "id_matricula": None,
        "periodo_nombre": periodo_activo.nombre,
        "cursos": lista_cursos_oferta
    }, 200


def _obtener_minutos(hora_str):
    partes = hora_str.split(':')
    return int(partes[0]) * 60 + int(partes[1])


def _validar_cruces(bloques):
    for i in range(len(bloques)):
        for j in range(i + 1, len(bloques)):
            b1 = bloques[i]
            b2 = bloques[j]
            if b1['dia'].upper() == b2['dia'].upper():
                ini1 = _obtener_minutos(b1['horaInicio'])
                fin1 = _obtener_minutos(b1['horaFin'])
                ini2 = _obtener_minutos(b2['horaInicio'])
                fin2 = _obtener_minutos(b2['horaFin'])
                # Solapamiento
                if ini1 < fin2 and ini2 < fin1:
                    return True, f"Existe un cruce de horario el día {b1['dia']} entre los cursos {b1['curso_nombre']} ({b1['horaInicio']} - {b1['horaFin']}) y {b2['curso_nombre']} ({b2['horaInicio']} - {b2['horaFin']})."
    return False, ""


def registrar_matricula_estudiante_ctrl(body):
    actor = usuario_actual()
    if not actor or not actor.estudiante:
        return {"msg": "Solo un estudiante puede realizar el proceso de matrícula"}, 403

    estudiante = actor.estudiante

    # Obtener periodo activo de matricula
    periodo_activo = PeriodoAcademico.query.filter_by(es_matricula_activa=True).first()
    if not periodo_activo:
        return {"msg": "No hay un periodo de matrícula activo en este momento"}, 400

    # Validar que no se encuentre ya matriculado (excluyendo rechazadas)
    matricula_existente = Matricula.query.filter(
        Matricula.id_estudiante == estudiante.id_estudiante,
        Matricula.id_periodo == periodo_activo.id_periodo,
        Matricula.estado != "rechazada"
    ).first()
    if matricula_existente:
        return {"msg": "Ya cuentas con una matrícula en este periodo académico"}, 400

    # Cargar y validar las secciones seleccionadas
    secciones_seleccionadas = []
    bloques_horarios = []
    
    for item in body.secciones:
        sec = db.session.get(Seccion, item.id_seccion)
        if not sec:
            return {"msg": f"Sección con ID {item.id_seccion} no encontrada"}, 404
        
        curso_obj = db.session.get(Curso, item.id_curso)
        if not curso_obj:
            return {"msg": f"Curso con ID {item.id_curso} no encontrado"}, 404

        # Obtener el horario para esta sección
        horario_objeto = Horario.query.filter_by(
            id_periodo=periodo_activo.id_periodo,
            id_especialidad=sec.id_especialidad,
            ciclo=sec.ciclo
        ).first()

        # Recopilar los bloques horarios de esta seccion y este curso
        if horario_objeto:
            for b in (horario_objeto.detalles or []):
                if b.get("seccion") == sec.codigo and b.get("id_curso") and int(b.get("id_curso")) == curso_obj.id_curso:
                    bloques_horarios.append({
                        "dia": b.get("dia", ""),
                        "horaInicio": b.get("horaInicio", ""),
                        "horaFin": b.get("horaFin", ""),
                        "curso_nombre": curso_obj.nombre
                    })

        secciones_seleccionadas.append((sec, curso_obj))

    # Validar cruce de horarios en el servidor
    cruce_detectado, mensaje_cruce = _validar_cruces(bloques_horarios)
    if cruce_detectado:
        return {"msg": mensaje_cruce}, 400

    # Crear la Matricula cabecera
    nueva_matricula = Matricula(
        id_estudiante=estudiante.id_estudiante,
        id_periodo=periodo_activo.id_periodo,
        fecha_matricula=datetime.now(),
        estado="pendiente"
    )
    db.session.add(nueva_matricula)
    db.session.flush() # Para obtener id_matricula

    total_creditos = 0
    cursos_matriculados = []

    # Crear los detalles de matricula y notas
    for sec, curso in secciones_seleccionadas:
        detalle = MatriculaDetalle(
            id_matricula=nueva_matricula.id_matricula,
            id_seccion=sec.id_seccion,
            id_curso=curso.id_curso,
            estado="matriculado"
        )
        db.session.add(detalle)
        db.session.flush() # Obtener id_matricula_detalle

        # Crear nota pendiente
        nueva_nota = Nota(
            parcial1=None,
            parcial2=None,
            final=None,
            sustitutorio=None,
            promedio=None,
            estado="pendiente",
            id_matricula_detalle=detalle.id_matricula_detalle
        )
        db.session.add(nueva_nota)

        total_creditos += curso.creditos
        cursos_matriculados.append({
            "id_curso": curso.id_curso,
            "codigo": curso.codigo,
            "nombre": curso.nombre,
            "creditos": curso.creditos,
            "seccion_codigo": sec.codigo,
            "horarios": [] # Horarios se pueden recuperar del listado si es necesario
        })

    db.session.commit()

    # Auditoria
    registrar_auditoria(
        "registrar_matricula",
        "matricula",
        registro=nueva_matricula.id_matricula,
        id_usuario=actor.id_usuario if actor else None,
        ip=request.remote_addr
    )

    return {
        "id_matricula": nueva_matricula.id_matricula,
        "fecha_matricula": nueva_matricula.fecha_matricula.strftime("%Y-%m-%d %H:%M:%S"),
        "estado": nueva_matricula.estado,
        "periodo_nombre": periodo_activo.nombre,
        "estudiante_nombres": estudiante.nombres,
        "estudiante_apellidos": estudiante.apellidos,
        "estudiante_codigo": estudiante.codigo,
        "cursos": cursos_matriculados,
        "total_creditos": total_creditos
    }, 201


def descargar_ficha_matricula_pdf_ctrl(id_matricula):
    actor = usuario_actual()
    if not actor:
        return {"msg": "No autorizado"}, 401

    tipo = request.args.get("tipo", type=str)

    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        return {"msg": "Matrícula no encontrada"}, 404

    # Validar propiedad (solo el estudiante matriculado, administradores o direccion)
    if actor.rol == "Estudiante" and (not actor.estudiante or actor.estudiante.id_estudiante != matricula.id_estudiante):
        return {"msg": "No tienes permiso para descargar esta ficha"}, 403

    estudiante = matricula.estudiante
    periodo = matricula.periodo

    # Crear PDF en memoria
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    historia = []
    estilos = getSampleStyleSheet()

    # Estilos personalizados
    titulo_estilo = ParagraphStyle(
        'TituloFicha',
        parent=estilos['Title'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#0F172A'), # Slate 900
        spaceAfter=15
    )

    subtitulo_estilo = ParagraphStyle(
        'SubtituloFicha',
        parent=estilos['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#1E293B'), # Slate 800
        spaceAfter=5
    )

    texto_estilo = ParagraphStyle(
        'TextoFicha',
        parent=estilos['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#475569'), # Slate 600
        spaceAfter=8
    )

    # Cabecera / Universidad
    historia.append(Paragraph("UNIVERSIDAD NACIONAL DEL CENTRO DEL PERÚ", ParagraphStyle('Univ', parent=titulo_estilo, fontSize=12, textColor=colors.HexColor('#2563EB')))) # Blue 600
    historia.append(Paragraph("SISTEMA DE GESTIÓN ACADÉMICA (SGA)", ParagraphStyle('Sga', parent=titulo_estilo, fontSize=9, textColor=colors.HexColor('#64748B'))))
    historia.append(Spacer(1, 10))

    # Título Principal
    if tipo == "pre":
        titulo_doc = "FICHA DE PRE-MATRÍCULA"
    else:
        titulo_doc = "FICHA OFICIAL DE MATRÍCULA" if matricula.estado in ["confirmada", "pagada", "validada"] else "FICHA DE PRE-MATRÍCULA"
    historia.append(Paragraph(titulo_doc, titulo_estilo))
    historia.append(Spacer(1, 10))

    # Datos Generales del Estudiante
    historia.append(Paragraph("DATOS DEL ESTUDIANTE", subtitulo_estilo))
    
    ciclo_estudiante = _obtener_ciclo_estudiante(estudiante, periodo.id_periodo)
    tabla_datos = [
        [Paragraph(f"<b>Código:</b> {estudiante.codigo}", texto_estilo), Paragraph(f"<b>DNI:</b> {estudiante.dni}", texto_estilo)],
        [Paragraph(f"<b>Estudiante:</b> {estudiante.nombres} {estudiante.apellidos}", texto_estilo), Paragraph(f"<b>Periodo Académico:</b> {periodo.nombre}", texto_estilo)],
        [Paragraph(f"<b>Especialidad:</b> {estudiante.especialidad.nombre}", texto_estilo), Paragraph(f"<b>Ciclo:</b> {ciclo_estudiante}° Ciclo", texto_estilo)]
    ]
    
    t_datos = Table(tabla_datos, colWidths=[260, 260])
    t_datos.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    historia.append(t_datos)
    historia.append(Spacer(1, 15))

    # Lista de cursos
    historia.append(Paragraph("ASIGNATURAS INSCRIBIDAS", subtitulo_estilo))

    # Cabecera de la tabla
    tabla_cursos_data = [
        ["CÓDIGO", "ASIGNATURA", "SECCIÓN", "CRÉDITOS", "HORARIO"]
    ]

    total_creditos = 0
    for det in matricula.detalles:
        curso = det.curso
        seccion = det.seccion
        total_creditos += curso.creditos

        # Obtener bloques horarios
        horario_objeto = Horario.query.filter_by(
            id_periodo=periodo.id_periodo,
            id_especialidad=seccion.id_especialidad,
            ciclo=seccion.ciclo
        ).first()

        horario_texto_lista = []
        if horario_objeto:
            for b in (horario_objeto.detalles or []):
                if b.get("seccion") == seccion.codigo and b.get("id_curso") and int(b.get("id_curso")) == curso.id_curso:
                    horario_texto_lista.append(f"{b.get('dia', '')[:3]}. {b.get('horaInicio')}-{b.get('horaFin')}")

        horario_string = ", ".join(horario_texto_lista) if horario_texto_lista else "Sin horario"

        tabla_cursos_data.append([
            curso.codigo,
            curso.nombre,
            seccion.codigo,
            str(curso.creditos),
            horario_string
        ])

    # Fila de totales
    tabla_cursos_data.append(["", "TOTAL CRÉDITOS INSCRIBIDOS", "", str(total_creditos), ""])

    t_cursos = Table(tabla_cursos_data, colWidths=[70, 180, 60, 60, 150])
    t_cursos.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')), # Fondo Slate 900
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#CBD5E1')), # Slate 300
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 9),
        ('LINEABOVE', (0,-1), (-1,-1), 1.5, colors.HexColor('#0F172A')),
    ]))
    historia.append(t_cursos)
    historia.append(Spacer(1, 40))

    # Pie de pagina / Firmas
    historia.append(Spacer(1, 10))

    # Información del Pago (Solo para Ficha Oficial)
    if titulo_doc == "FICHA OFICIAL DE MATRÍCULA":
        from app.models.pago import Pago
        pago_confirmado = Pago.query.filter_by(id_matricula=matricula.id_matricula, estado="confirmado").first()

        historia.append(Paragraph("ESTADO DE PAGO DE MATRÍCULA", subtitulo_estilo))
        if pago_confirmado:
            tabla_pago_data = [
                [Paragraph(f"<b>Monto Pagado:</b> S/ {pago_confirmado.monto:.2f}", texto_estilo), Paragraph(f"<b>Método de Pago:</b> {pago_confirmado.metodo_pago.capitalize()}", texto_estilo)],
                [Paragraph(f"<b>Código Operación:</b> {pago_confirmado.codigo_operacion or 'N/A'}", texto_estilo), Paragraph(f"<b>Estado del Pago:</b> Confirmado / Pagado", texto_estilo)]
            ]
        else:
            tabla_pago_data = [
                [Paragraph("<b>Monto Pagado:</b> S/ 0.00", texto_estilo), Paragraph("<b>Método de Pago:</b> N/A", texto_estilo)],
                [Paragraph("<b>Código Operación:</b> N/A", texto_estilo), Paragraph("<b>Estado del Pago:</b> Pendiente de Confirmación", texto_estilo)]
            ]
        
        t_pago = Table(tabla_pago_data, colWidths=[260, 260])
        t_pago.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 4),
        ]))
        historia.append(t_pago)
        historia.append(Spacer(1, 20))

    tabla_firmas = [
        ["", ""],
        ["-------------------------------------------------", "-------------------------------------------------"],
        ["Firma del Estudiante", "Dirección de Registro Académico"]
    ]
    t_firmas = Table(tabla_firmas, colWidths=[260, 260])
    t_firmas.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,2), (-1,2), 'Helvetica'),
        ('FONTSIZE', (0,2), (-1,2), 9),
        ('TEXTCOLOR', (0,2), (-1,2), colors.HexColor('#64748B')),
        ('TOPPADDING', (0,1), (-1,1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    historia.append(t_firmas)

    # Construir documento
    doc.build(historia)
    buffer.seek(0)

    nombre_archivo = f"ficha_matricula_{estudiante.codigo}_{periodo.nombre}.pdf"

    return send_file(
        buffer,
        as_attachment=True,
        download_name=nombre_archivo,
        mimetype="application/pdf"
    )


def _serializar_matricula_admin(matricula, horarios_cache=None, docentes_cache=None, pagos_cache=None):
    """Serializa una matricula para el admin/direccion.

    Los 3 caches son opcionales: si no se pasan, cada uno hace su propia
    consulta individual (comportamiento original, usado por mis_matriculas
    donde solo hay una matricula). Cuando se listan MUCHAS matriculas a la
    vez (listar_todas_matriculas_ctrl), se prearman los 3 caches con
    consultas masivas para evitar un N+1 (antes: una consulta a Horario por
    cada curso matriculado, y una a Docente por cada bloque de horario).
    """
    estudiante = matricula.estudiante
    ciclo_est = 1
    if matricula.detalles:
        for det in matricula.detalles:
            if det.seccion and det.seccion.ciclo:
                ciclo_est = det.seccion.ciclo
                break

    cursos_serialized = []
    for d in matricula.detalles:
        ciclo_bloque = d.seccion.ciclo if d.seccion else d.curso.ciclo
        if horarios_cache is not None:
            h_obj = horarios_cache.get((matricula.id_periodo, estudiante.id_especialidad, ciclo_bloque))
        else:
            h_obj = Horario.query.filter_by(
                id_periodo=matricula.id_periodo,
                id_especialidad=estudiante.id_especialidad,
                ciclo=ciclo_bloque
            ).first()

        horarios_lista = []
        if h_obj:
            bloques = [
                b for b in h_obj.detalles
                if b.get("id_curso") == d.id_curso and (b.get("seccion") or 'A') == d.seccion.codigo
            ]
            for b in bloques:
                docente_nombre = ""
                if b.get("id_docente"):
                    id_docente = int(b.get("id_docente"))
                    if docentes_cache is not None:
                        docente = docentes_cache.get(id_docente)
                    else:
                        docente = db.session.get(Docente, id_docente)
                    if docente:
                        docente_nombre = f"{docente.nombres} {docente.apellidos}"
                horarios_lista.append({
                    "dia": b.get("dia", ""),
                    "horaInicio": b.get("horaInicio", ""),
                    "horaFin": b.get("horaFin", ""),
                    "docente_nombre": docente_nombre
                })

        cursos_serialized.append({
            "id_curso": d.id_curso,
            "codigo": d.curso.codigo,
            "nombre": d.curso.nombre,
            "creditos": d.curso.creditos,
            "seccion_codigo": d.seccion.codigo if d.seccion else "A",
            "horarios": horarios_lista
        })

    if pagos_cache is not None:
        pago_obj = pagos_cache.get(matricula.id_matricula)
    else:
        pago_obj = Pago.query.filter_by(id_matricula=matricula.id_matricula, estado="confirmado").first()
    pago_det = None
    if pago_obj:
        pago_det = {
            "id_pago": pago_obj.id_pago,
            "monto": float(pago_obj.monto),
            "metodo_pago": pago_obj.metodo_pago,
            "codigo_operacion": pago_obj.codigo_operacion,
            "estado": pago_obj.estado
        }

    return {
        "id_matricula": matricula.id_matricula,
        "fecha_matricula": matricula.fecha_matricula.strftime("%Y-%m-%d %H:%M:%S") if matricula.fecha_matricula else "",
        "estado": "confirmada" if matricula.estado in ["confirmada", "pagada", "validada"] else matricula.estado,
        "periodo_nombre": matricula.periodo.nombre,
        "estudiante_nombre": f"{estudiante.nombres} {estudiante.apellidos}" if estudiante else "",
        "estudiante_nombres": estudiante.nombres,
        "estudiante_apellidos": estudiante.apellidos,
        "estudiante_codigo": estudiante.codigo,
        "estudiante_dni": estudiante.dni,
        "estudiante_especialidad": estudiante.especialidad.nombre,
        "id_periodo": matricula.id_periodo, # include id_periodo
        "id_estudiante": matricula.id_estudiante, # include id_estudiante
        "estudiante_ciclo": ciclo_est,
        "cursos": cursos_serialized,
        "pago": pago_det,
        "total_creditos": sum(c["creditos"] for c in cursos_serialized)
    }


def mis_matriculas():
    """Devuelve las matrículas del estudiante autenticado."""
    actor = usuario_actual()
    if not actor or not actor.estudiante:
        return {"msg": "No autorizado"}, 403

    matriculas = (
        Matricula.query
        .filter_by(id_estudiante=actor.estudiante.id_estudiante)
        .order_by(Matricula.fecha_matricula.desc())
        .all()
    )
    return {"matriculas": [_serializar_matricula_admin(m) for m in matriculas]}, 200


def listar_todas_matriculas_ctrl():
    actor = usuario_actual()
    if not actor or actor.rol.nombre not in ["Administrador", "Direccion"]:
        return {"msg": "No autorizado"}, 401

    id_periodo = request.args.get("id_periodo", type=int)
    estado = request.args.get("estado", type=str)

    query = Matricula.query
    if id_periodo:
        query = query.filter_by(id_periodo=id_periodo)
    if estado:
        if estado == "confirmada":
            query = query.filter(Matricula.estado.in_(["confirmada", "pagada", "validada"]))
        elif estado == "rechazada":
            query = query.filter(Matricula.estado.in_(["rechazada", "desaprobada"]))
        else:
            query = query.filter_by(estado=estado)

    matriculas = (
        query
        .options(
            joinedload(Matricula.estudiante).joinedload(Estudiante.especialidad),
            joinedload(Matricula.periodo),
            selectinload(Matricula.detalles).joinedload(MatriculaDetalle.seccion),
            selectinload(Matricula.detalles).joinedload(MatriculaDetalle.curso),
        )
        .order_by(Matricula.fecha_matricula.desc())
        .all()
    )

    # Sin esto, _serializar_matricula_admin dispara una consulta a Horario
    # por cada curso matriculado y otra a Docente por cada bloque de
    # horario -> con muchas matriculas eran miles de consultas. Se prearman
    # los 3 lookups con consultas masivas (in_) en vez de una por fila.
    claves_horario = set()
    for m in matriculas:
        for d in m.detalles:
            ciclo_bloque = d.seccion.ciclo if d.seccion else d.curso.ciclo
            claves_horario.add((m.id_periodo, m.estudiante.id_especialidad, ciclo_bloque))

    horarios_cache = {}
    if claves_horario:
        periodos_ids = {c[0] for c in claves_horario}
        especialidades_ids = {c[1] for c in claves_horario}
        ciclos = {c[2] for c in claves_horario}
        for h in Horario.query.filter(
            Horario.id_periodo.in_(periodos_ids),
            Horario.id_especialidad.in_(especialidades_ids),
            Horario.ciclo.in_(ciclos),
        ).all():
            horarios_cache[(h.id_periodo, h.id_especialidad, h.ciclo)] = h

    ids_docente = set()
    for h in horarios_cache.values():
        for b in (h.detalles or []):
            if b.get("id_docente"):
                ids_docente.add(int(b["id_docente"]))
    docentes_cache = {}
    if ids_docente:
        for doc in Docente.query.filter(Docente.id_docente.in_(ids_docente)).all():
            docentes_cache[doc.id_docente] = doc

    ids_matricula = [m.id_matricula for m in matriculas]
    pagos_cache = {}
    if ids_matricula:
        for p in Pago.query.filter(
            Pago.id_matricula.in_(ids_matricula), Pago.estado == "confirmado"
        ).all():
            pagos_cache[p.id_matricula] = p

    return {
        "matriculas": [
            _serializar_matricula_admin(m, horarios_cache, docentes_cache, pagos_cache)
            for m in matriculas
        ]
    }, 200


def obtener_detalle_matricula_ctrl(id_matricula):
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Administrador":
        return {"msg": "No autorizado"}, 401

    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        return {"msg": "Matrícula no encontrada"}, 404

    return _serializar_matricula_admin(matricula), 200


def confirmar_matricula_admin_ctrl(id_matricula, body):
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Administrador":
        return {"msg": "No autorizado"}, 401

    matricula = db.session.get(Matricula, id_matricula)
    if not matricula:
        return {"msg": "Matrícula no encontrada"}, 404

    if matricula.estado != "pendiente":
        return {"msg": "La matrícula debe estar en estado pendiente para ser confirmada"}, 409

    from app.models.pago import Pago

    # 1. Establecer estado de la matricula a confirmada
    matricula.estado = "confirmada"
    db.session.flush()

    # 2. Registrar y confirmar el pago si corresponde
    if body.registrar_pago:
        # Registrar Pago
        nuevo_pago = Pago(
            id_matricula=id_matricula,
            monto=body.monto,
            metodo_pago=body.metodo_pago,
            codigo_operacion=body.codigo_operacion,
            estado="confirmado" # Lo confirmamos de forma inmediata
        )
        db.session.add(nuevo_pago)
        db.session.flush()

        registrar_auditoria(
            "confirmar_pago_admin",
            "pago",
            registro=nuevo_pago.id_pago,
            id_usuario=actor.id_usuario,
            ip=request.remote_addr
        )

    db.session.commit()

    registrar_auditoria(
        "confirmar_matricula_admin",
        "matricula",
        registro=matricula.id_matricula,
        id_usuario=actor.id_usuario,
        ip=request.remote_addr
    )

    return _serializar_matricula_admin(matricula), 200


def estadisticas(id_periodo):
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Direccion":
        return {"msg": "No autorizado"}, 401

    # Obtener todas las matrículas del periodo
    matriculas = Matricula.query.filter_by(id_periodo=id_periodo).all()

    total_matriculados = len(matriculas)

    # Agrupar por estado
    por_estado = {"pendiente": 0, "confirmada": 0, "rechazada": 0}
    for m in matriculas:
        # Mapeamos los estados antiguos a confirmada de forma transparente
        est = "confirmada" if m.estado in ["confirmada", "pagada", "validada"] else m.estado
        if est in por_estado:
            por_estado[est] += 1
        else:
            por_estado[est] = 1

    # Agrupar por especialidad
    por_especialidad = {}
    for m in matriculas:
        esp_nombre = m.estudiante.especialidad.nombre if m.estudiante.especialidad else "Sin Especialidad"
        if esp_nombre in por_especialidad:
            por_especialidad[esp_nombre] += 1
        else:
            por_especialidad[esp_nombre] = 1

    return {
        "total_matriculados": total_matriculados,
        "por_estado": por_estado,
        "por_especialidad": por_especialidad
    }, 200


def _serialize_matricula(matricula):
    estudiante = matricula.estudiante
    detalles_list = []
    for det in matricula.detalles:
        # Obtener horario_string
        horario_objeto = Horario.query.filter_by(
            id_periodo=matricula.id_periodo,
            id_especialidad=estudiante.id_especialidad if estudiante else det.seccion.id_especialidad,
            ciclo=det.seccion.ciclo if det.seccion else det.curso.ciclo
        ).first()

        horario_texto_lista = []
        if horario_objeto and det.seccion:
            for b in (horario_objeto.detalles or []):
                if b.get("seccion") == det.seccion.codigo and b.get("id_curso") and int(b.get("id_curso")) == det.id_curso:
                    horario_texto_lista.append(f"{b.get('dia', '')[:3]}. {b.get('horaInicio')}-{b.get('horaFin')}")

        horario_string = ", ".join(horario_texto_lista) if horario_texto_lista else "Sin horario"

        detalles_list.append({
            "id_matricula_detalle": det.id_matricula_detalle,
            "id_curso": det.id_curso,
            "curso": det.curso.nombre if det.curso else "",
            "codigo_curso": det.curso.codigo if det.curso else "",
            "id_seccion": det.id_seccion,
            "seccion_codigo": det.seccion.codigo if det.seccion else None,
            "estado": det.estado,
            "horario": horario_string
        })

    return {
        "id_matricula": matricula.id_matricula,
        "id_estudiante": matricula.id_estudiante,
        "estudiante_nombre": f"{estudiante.nombres} {estudiante.apellidos}" if estudiante else "",
        "id_periodo": matricula.id_periodo,
        "fecha_matricula": matricula.fecha_matricula,
        "estado": matricula.estado,
        "detalles": detalles_list
    }


def solicitar(body):
    actor = usuario_actual()
    if not actor or not actor.estudiante:
        return {"msg": "Solo un estudiante puede realizar el proceso de matrícula"}, 403

    from app.services.enrollment_service import (
        solicitar_matricula,
        EstudianteInactivoError,
        PeriodoNoEncontradoError,
        PeriodoCerradoError,
        MatriculaDuplicadaError,
        CursoNoEncontradoError,
        SeccionNoEncontradaError,
        SeccionLlenaError,
    )

    secciones_data = []
    for item in body.secciones:
        # Handle int (section ID directly) from tests
        if isinstance(item, int):
            sec = db.session.get(Seccion, item)
            if not sec:
                return {"msg": f"Sección con ID {item} no encontrada"}, 404
            
            # Find the courses for the section's specialty and cycle
            from app.models.especialidad import Especialidad
            from app.models.curso import Curso
            cursos_plan = Curso.query.join(Curso.especialidades).filter(
                Especialidad.id_especialidad == sec.id_especialidad,
                Curso.ciclo == sec.ciclo
            ).all()

            for curso in cursos_plan:
                secciones_data.append({
                    "id_curso": curso.id_curso,
                    "id_seccion": sec.id_seccion
                })
        else:
            # Handle AsignaturaMatriculaInput or dict
            c_id = getattr(item, 'id_curso', None) or item.get('id_curso')
            s_id = getattr(item, 'id_seccion', None) or item.get('id_seccion')
            secciones_data.append({
                "id_curso": c_id,
                "id_seccion": s_id
            })

    try:
        matricula = solicitar_matricula(actor.estudiante.id_estudiante, body.id_periodo, secciones_data)
        
        # Audit
        registrar_auditoria(
            "solicitar_matricula",
            "matricula",
            registro=matricula.id_matricula,
            id_usuario=actor.id_usuario,
            ip=request.remote_addr
        )

        return _serialize_matricula(matricula), 201
    except EstudianteInactivoError:
        return {"msg": "El estudiante no está activo"}, 403
    except PeriodoNoEncontradoError:
        return {"msg": "Periodo no encontrado"}, 404
    except PeriodoCerradoError:
        return {"msg": "El periodo de matrícula no está activo o está cerrado"}, 409
    except MatriculaDuplicadaError:
        return {"msg": "Ya existe una solicitud de matrícula para este periodo"}, 409
    except CursoNoEncontradoError:
        return {"msg": "Uno de los cursos no existe"}, 404
    except SeccionNoEncontradaError:
        return {"msg": "Una de las secciones no existe"}, 404
    except SeccionLlenaError:
        return {"msg": "Una de las secciones seleccionadas está llena"}, 409


def validar(id_matricula):
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Administrador":
        return {"msg": "No autorizado"}, 401

    from app.services.enrollment_service import validar_matricula, MatriculaNoEncontradaError, EstadoInvalidoError

    try:
        matricula = validar_matricula(id_matricula)
        registrar_auditoria(
            "validar_matricula",
            "matricula",
            registro=matricula.id_matricula,
            id_usuario=actor.id_usuario,
            ip=request.remote_addr
        )
        return _serialize_matricula(matricula), 200
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula no está en estado pendiente para ser validada"}, 409


def rechazar(id_matricula):
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Administrador":
        return {"msg": "No autorizado"}, 401

    from app.services.enrollment_service import rechazar_matricula, MatriculaNoEncontradaError, EstadoInvalidoError

    try:
        matricula = rechazar_matricula(id_matricula)
        registrar_auditoria(
            "rechazar_matricula",
            "matricula",
            registro=matricula.id_matricula,
            id_usuario=actor.id_usuario,
            ip=request.remote_addr
        )
        return _serialize_matricula(matricula), 200
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula no está en estado pendiente para ser rechazada"}, 409


def pago(id_matricula, body):
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Administrador":
        return {"msg": "No autorizado"}, 401

    from app.services.enrollment_service import registrar_pago, MatriculaNoEncontradaError, EstadoInvalidoError

    try:
        pago_obj = registrar_pago(id_matricula, body.monto, body.metodo_pago, body.codigo_operacion)
        # Confirm immediately because admin registered it
        pago_obj.estado = "confirmado"
        pago_obj.matricula.estado = "pagada"
        db.session.commit()

        registrar_auditoria(
            "registrar_pago_admin",
            "pago",
            registro=pago_obj.id_pago,
            id_usuario=actor.id_usuario,
            ip=request.remote_addr
        )

        return {
            "id_pago": pago_obj.id_pago,
            "monto": float(pago_obj.monto),
            "estado": pago_obj.estado
        }, 201
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
    except EstadoInvalidoError:
        return {"msg": "La matrícula debe estar en estado validada para registrar pago"}, 409


def ficha(id_matricula):
    actor = usuario_actual()
    if not actor:
        return {"msg": "No autorizado"}, 401

    from app.services.enrollment_service import obtener_matricula, generar_ficha_pdf, MatriculaNoEncontradaError

    try:
        matricula = obtener_matricula(id_matricula)
        # Check permissions: only the student themselves or an admin can access it
        if actor.rol.nombre == "Estudiante" and (not actor.estudiante or actor.estudiante.id_estudiante != matricula.id_estudiante):
            return {"msg": "No tienes permiso para ver esta ficha"}, 403

        pdf_data = generar_ficha_pdf(matricula)
        buffer = BytesIO(pdf_data)
        
        nombre_archivo = f"ficha_matricula_{matricula.estudiante.codigo if matricula.estudiante else 'doc'}.pdf"
        return send_file(
            buffer,
            as_attachment=True,
            download_name=nombre_archivo,
            mimetype="application/pdf"
        )
    except MatriculaNoEncontradaError:
        return {"msg": "Matrícula no encontrada"}, 404
