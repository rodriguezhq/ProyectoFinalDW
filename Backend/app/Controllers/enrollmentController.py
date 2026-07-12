import os
from datetime import datetime
from io import BytesIO
from flask import request, send_file
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
from app.services.auth_service import usuario_actual
from app.services.audit_service import registrar_auditoria
from app.schemas.enrollment_schema import BloqueHorarioSchema

# ReportLab para la generacion del PDF
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def _obtener_ciclo_estudiante(estudiante, periodo_actual_id):
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
            "estado": matricula_existente.estado,
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

            lista_secciones_oferta.append({
                "id_seccion": sec.id_seccion,
                "codigo": sec.codigo,
                "ciclo": sec.ciclo,
                "horarios": bloques_sec
            })

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
        estado="pagada"
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
    historia.append(Paragraph("FICHA OFICIAL DE MATRÍCULA", titulo_estilo))
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

    # Información del Pago
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


def _serializar_matricula_admin(matricula):
    estudiante = matricula.estudiante
    ciclo_est = 1
    if matricula.detalles:
        for det in matricula.detalles:
            if det.seccion and det.seccion.ciclo:
                ciclo_est = det.seccion.ciclo
                break
                
    cursos_serialized = []
    for d in matricula.detalles:
        h_obj = Horario.query.filter_by(
            id_periodo=matricula.id_periodo,
            id_especialidad=estudiante.id_especialidad,
            ciclo=d.seccion.ciclo if d.seccion else d.curso.ciclo
        ).first()
        
        horarios_lista = []
        if h_obj:
            bloques = [
                b for b in h_obj.detalles 
                if b.get("id_curso") == d.id_curso and (b.get("seccion") or 'A') == d.seccion.codigo
            ]
            for b in bloques:
                horarios_lista.append({
                    "dia": b.get("dia", ""),
                    "horaInicio": b.get("horaInicio", ""),
                    "horaFin": b.get("horaFin", ""),
                    "docente_nombre": b.get("docente", "")
                })

        cursos_serialized.append({
            "id_curso": d.id_curso,
            "codigo": d.curso.codigo,
            "nombre": d.curso.nombre,
            "creditos": d.curso.creditos,
            "seccion_codigo": d.seccion.codigo if d.seccion else "A",
            "horarios": horarios_lista
        })

    from app.models.pago import Pago
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
        "estado": matricula.estado,
        "periodo_nombre": matricula.periodo.nombre,
        "estudiante_nombres": estudiante.nombres,
        "estudiante_apellidos": estudiante.apellidos,
        "estudiante_codigo": estudiante.codigo,
        "estudiante_dni": estudiante.dni,
        "estudiante_especialidad": estudiante.especialidad.nombre,
        "estudiante_ciclo": ciclo_est,
        "cursos": cursos_serialized,
        "pago": pago_det,
        "total_creditos": sum(c["creditos"] for c in cursos_serialized)
    }


def listar_todas_matriculas_ctrl():
    actor = usuario_actual()
    if not actor or actor.rol.nombre != "Administrador":
        return {"msg": "No autorizado"}, 401

    id_periodo = request.args.get("id_periodo", type=int)
    estado = request.args.get("estado", type=str)

    query = Matricula.query
    if id_periodo:
        query = query.filter_by(id_periodo=id_periodo)
    if estado:
        query = query.filter_by(estado=estado)

    matriculas = query.order_by(Matricula.fecha_matricula.desc()).all()
    return {"matriculas": [_serializar_matricula_admin(m) for m in matriculas]}, 200


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
