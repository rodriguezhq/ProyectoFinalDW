import csv
import io
from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generar_consolidado_csv(reporte):
    output = io.StringIO()
    # Unicode BOM for Excel UTF-8 compatibility
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    # Headers
    writer.writerow([
        'Codigo', 'Apellidos y Nombres', 'Especialidad', 
        'Creditos Matriculados', 'Creditos Aprobados', 
        'Promedio PPA', 'Semestres Cursados'
    ])
    
    for row in reporte:
        ppa = row.get("promedio_ponderado_acumulado")
        ppa_str = f"{ppa:.2f}" if ppa is not None else "-"
        writer.writerow([
            row.get("codigo", ""),
            f"{row.get('apellidos', '')}, {row.get('nombres', '')}",
            row.get("especialidad_nombre", ""),
            row.get("total_creditos_matriculados", 0),
            row.get("total_creditos_aprobados", 0),
            ppa_str,
            row.get("periodos_matriculados", 0)
        ])
        
    return output.getvalue().encode('utf-8')

def generar_consolidado_pdf(reporte, especialidad_nombre, resumen_global):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )
    
    meta_style = ParagraphStyle(
        'CustomMeta',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )
    
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a')
    )
    
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#334155')
    )
    
    td_ppa_style = ParagraphStyle(
        'TableCellPpa',
        parent=td_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#2563eb')
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("Reporte Consolidado Académico - UNCP", title_style))
    
    # Metadata string
    fecha_str = datetime.now().strftime("%d/%m/%Y")
    total_alumnos = resumen_global.get("total_alumnos", 0)
    promedio_ppa = resumen_global.get("promedio_ppa_global")
    promedio_ppa_str = f"{promedio_ppa:.2f}" if promedio_ppa is not None else "-"
    prom_creditos = resumen_global.get("promedio_creditos_aprobados")
    prom_creditos_str = f"{prom_creditos:.1f}" if prom_creditos is not None else "-"
    
    meta_html = (
        f"Carrera: <b>{especialidad_nombre}</b>  |  "
        f"Alumnos Listados: <b>{total_alumnos}</b>  |  "
        f"PPA Promedio: <b>{promedio_ppa_str}</b>  |  "
        f"Créditos Aprobados Prom.: <b>{prom_creditos_str}</b>  |  "
        f"Fecha: <b>{fecha_str}</b>"
    )
    elements.append(Paragraph(meta_html, meta_style))
    elements.append(Spacer(1, 15))
    
    # Table Data
    data = [
        [
            Paragraph("Código", th_style),
            Paragraph("Estudiante (Apellidos, Nombres)", th_style),
            Paragraph("Créditos Mat.", th_style),
            Paragraph("Créditos Aprob.", th_style),
            Paragraph("Promedio PPA", th_style),
            Paragraph("Semestres", th_style)
        ]
    ]
    
    for row in reporte:
        ppa = row.get("promedio_ponderado_acumulado")
        ppa_str = f"{ppa:.2f}" if ppa is not None else "-"
        
        data.append([
            Paragraph(row.get("codigo", ""), td_style),
            Paragraph(f"{row.get('apellidos', '')}, {row.get('nombres', '')}", td_style),
            Paragraph(str(row.get("total_creditos_matriculados", 0)), td_style),
            Paragraph(str(row.get("total_creditos_aprobados", 0)), td_style),
            Paragraph(ppa_str, td_ppa_style),
            Paragraph(str(row.get("periodos_matriculados", 0)), td_style)
        ])
        
    # Printable area: width = 552pt
    col_widths = [70, 242, 60, 60, 60, 60]
    
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8fafc')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        alignment=1, # Center
        textColor=colors.HexColor('#94a3b8')
    )
    elements.append(Paragraph("Sistema de Gestión Académica - Universidad Nacional del Centro del Perú (UNCP)", footer_style))
    
    doc.build(elements)
    return buffer.getvalue()

def generar_cohortes_csv(desempeno):
    output = io.StringIO()
    # Unicode BOM for Excel UTF-8 compatibility
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    # Headers
    writer.writerow([
        'Cohorte', 'Especialidad', 'Total Estudiantes', 
        'Promedio PPA', 'Creditos Aprobados Promedio', 
        'Tasa Aprobacion (%)', 'Tasa Desaprobacion (%)'
    ])
    
    for row in desempeno:
        prom = row.get("promedio_ponderado_promedio")
        prom_str = f"{prom:.2f}" if prom is not None else "-"
        cred = row.get("total_creditos_aprobados_promedio")
        cred_str = f"{cred:.1f}" if cred is not None else "-"
        tasa = row.get("tasa_aprobacion")
        tasa_str = f"{tasa:.1f}" if tasa is not None else "-"
        tasa_des = (100 - tasa) if tasa is not None else None
        tasa_des_str = f"{tasa_des:.1f}" if tasa_des is not None else "-"
        
        writer.writerow([
            row.get("cohorte", ""),
            row.get("especialidad_nombre", ""),
            row.get("total_estudiantes", 0),
            prom_str,
            cred_str,
            tasa_str,
            tasa_des_str
        ])
        
    return output.getvalue().encode('utf-8')

def generar_cohortes_pdf(desempeno, especialidad_nombre, resumen_global):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )
    
    meta_style = ParagraphStyle(
        'CustomMeta',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#64748b')
    )
    
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0f172a')
    )
    
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#334155')
    )
    
    td_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=td_style,
        fontName='Helvetica-Bold'
    )
    
    td_aprob_style = ParagraphStyle(
        'TableCellAprob',
        parent=td_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#059669') # Green
    )
    
    td_desaprob_style = ParagraphStyle(
        'TableCellDesaprob',
        parent=td_style,
        textColor=colors.HexColor('#dc2626') # Red
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("Reporte Desempeño por Cohorte y Programa - UNCP", title_style))
    
    # Metadata string
    fecha_str = datetime.now().strftime("%d/%m/%Y")
    total_alumnos = resumen_global.get("total_alumnos", 0)
    promedio_ppa = resumen_global.get("promedio_ppa_global")
    promedio_ppa_str = f"{promedio_ppa:.2f}" if promedio_ppa is not None else "-"
    tasa_aprobacion = resumen_global.get("tasa_aprobacion_global")
    tasa_aprobacion_str = f"{tasa_aprobacion:.1f}" if tasa_aprobacion is not None else "-"
    
    meta_html = (
        f"Especialidad: <b>{especialidad_nombre}</b>  |  "
        f"Total Estudiantes: <b>{total_alumnos}</b>  |  "
        f"Promedio PPA Carrera: <b>{promedio_ppa_str}</b>  |  "
        f"Tasa Aprobación Global: <b>{tasa_aprobacion_str}%</b>  |  "
        f"Fecha: <b>{fecha_str}</b>"
    )
    elements.append(Paragraph(meta_html, meta_style))
    elements.append(Spacer(1, 15))
    
    # Table Data
    data = [
        [
            Paragraph("Cohorte", th_style),
            Paragraph("Programa Académico", th_style),
            Paragraph("Total Alumnos", th_style),
            Paragraph("Promedio (PPA)", th_style),
            Paragraph("Créditos Prom.", th_style),
            Paragraph("Tasa Aprob.", th_style),
            Paragraph("Tasa Desaprob.", th_style)
        ]
    ]
    
    for row in desempeno:
        prom = row.get("promedio_ponderado_promedio")
        prom_str = f"{prom:.2f}" if prom is not None else "-"
        cred = row.get("total_creditos_aprobados_promedio")
        cred_str = f"{cred:.1f}" if cred is not None else "-"
        tasa = row.get("tasa_aprobacion")
        tasa_str = f"{tasa:.1f}%" if tasa is not None else "0.0%"
        tasa_des = (100 - tasa) if tasa is not None else 0.0
        tasa_des_str = f"{tasa_des:.1f}%"
        
        data.append([
            Paragraph(row.get("cohorte", ""), td_bold_style),
            Paragraph(row.get("especialidad_nombre", ""), td_style),
            Paragraph(str(row.get("total_estudiantes", 0)), td_style),
            Paragraph(prom_str, td_bold_style),
            Paragraph(cred_str, td_style),
            Paragraph(tasa_str, td_aprob_style),
            Paragraph(tasa_des_str, td_desaprob_style)
        ])
        
    # Printable area is 552pt width.
    col_widths = [50, 182, 60, 60, 60, 70, 70]
    
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8fafc')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        alignment=1, # Center
        textColor=colors.HexColor('#94a3b8')
    )
    elements.append(Paragraph("Sistema de Gestión Académica - Universidad Nacional del Centro del Perú (UNCP)", footer_style))
    
    doc.build(elements)
    return buffer.getvalue()
