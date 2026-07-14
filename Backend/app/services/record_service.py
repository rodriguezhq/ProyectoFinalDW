from collections import defaultdict
from sqlalchemy.orm import joinedload, selectinload
from app.extensions import db
from app.models.estudiante import Estudiante
from app.models.matricula import Matricula
from app.models.matricula_detalle import MatriculaDetalle
from app.models.nota import Nota
from app.models.curso import Curso
from app.models.periodo_academico import PeriodoAcademico
from app.models.especialidad import Especialidad
from app.models.facultad import Facultad
from app.utils.helpers import calcular_promedio_ponderado


def _con_matriculas_precargadas(query):
    """Evita el patron N+1: sin esto, cada acceso a estudiante.matriculas,
    matricula.detalles, detalle.curso y detalle.nota dispara una consulta
    aparte por fila, lo que con cientos de estudiantes se vuelve miles de
    round-trips a la BD (el origen real de la lentitud del dashboard)."""
    return query.options(
        joinedload(Estudiante.especialidad),
        selectinload(Estudiante.matriculas)
            .selectinload(Matricula.detalles)
            .joinedload(MatriculaDetalle.curso),
        selectinload(Estudiante.matriculas)
            .selectinload(Matricula.detalles)
            .joinedload(MatriculaDetalle.nota),
    )


def obtener_record_estudiante(id_estudiante):
    """
    Agrega dinámicamente Matricula, MatriculaDetalle y Nota para construir
    el récord académico completo de un estudiante.
    """
    estudiante = Estudiante.query.get(id_estudiante)
    if not estudiante:
        return None, "Estudiante no encontrado"
        
    especialidad = estudiante.especialidad
    facultad = especialidad.facultad if especialidad else None
    
    # 1. Obtener todas las matrículas del estudiante
    matriculas = Matricula.query.filter_by(id_estudiante=id_estudiante).all()
    
    # Agrupar cursos por periodo
    periodos_dict = defaultdict(list)
    
    total_creditos_matriculados = 0
    total_creditos_aprobados = 0
    cursos_calificados_global = []
    
    for matricula in matriculas:
        periodo = matricula.periodo
        if not periodo:
            continue
            
        for detalle in matricula.detalles:
            curso = detalle.curso
            if not curso:
                continue
                
            nota = detalle.nota
            
            # Determinar estados e información de notas
            parcial1 = float(nota.parcial1) if nota and nota.parcial1 is not None else None
            parcial2 = float(nota.parcial2) if nota and nota.parcial2 is not None else None
            final = float(nota.final) if nota and nota.final is not None else None
            sustitutorio = float(nota.sustitutorio) if nota and nota.sustitutorio is not None else None
            promedio = float(nota.promedio) if nota and nota.promedio is not None else None
            estado_nota = nota.estado if nota else "sin_nota"
            
            # Sumar créditos matriculados
            total_creditos_matriculados += curso.creditos
            
            # Es aprobado si hay promedio registrado y es mayor o igual a 10.5
            es_aprobado = False
            if promedio is not None:
                es_aprobado = promedio >= 10.5
                cursos_calificados_global.append((promedio, curso.creditos))
                
            if es_aprobado:
                total_creditos_aprobados += curso.creditos
                
            course_item = {
                "curso_codigo": curso.codigo,
                "curso_nombre": curso.nombre,
                "creditos": curso.creditos,
                "parcial1": parcial1,
                "parcial2": parcial2,
                "final": final,
                "sustitutorio": sustitutorio,
                "promedio": promedio,
                "estado_nota": estado_nota,
                "estado_detalle": detalle.estado,
            }
            
            periodos_dict[periodo].append((course_item, promedio, curso.creditos, es_aprobado))
            
    # Construir lista de periodos
    periodos_list = []
    
    # Ordenar periodos cronológicamente por nombre: el formato "YYYY-R" ordena
    # bien lexicográficamente ("2025-I" < "2025-II" < "2026-I"). No se usa
    # id_periodo porque un periodo histórico puede crearse después (id mayor).
    for periodo in sorted(periodos_dict.keys(), key=lambda p: p.nombre):
        items = periodos_dict[periodo]
        cursos_periodo = [x[0] for x in items]
        
        # Calcular estadísticas del periodo
        cursos_calificados_periodo = [(x[1], x[2]) for x in items if x[1] is not None]
        promedio_periodo = calcular_promedio_ponderado(cursos_calificados_periodo)
        
        creditos_matriculados_periodo = sum(x[2] for x in items)
        creditos_aprobados_periodo = sum(x[2] for x in items if x[3])
        
        periodos_list.append({
            "periodo_nombre": periodo.nombre,
            "promedio_ponderado_periodo": promedio_periodo,
            "creditos_matriculados_periodo": creditos_matriculados_periodo,
            "creditos_aprobados_periodo": creditos_aprobados_periodo,
            "cursos": cursos_periodo
        })
        
    promedio_acumulado = calcular_promedio_ponderado(cursos_calificados_global)
    
    record_data = {
        "estudiante": {
            "id_estudiante": estudiante.id_estudiante,
            "codigo": estudiante.codigo,
            "nombres": estudiante.nombres,
            "apellidos": estudiante.apellidos,
            "dni": estudiante.dni,
            "correo": estudiante.correo,
            "especialidad_nombre": especialidad.nombre if especialidad else "No asignada",
            "especialidad_codigo": especialidad.codigo if especialidad else "N/A",
            "facultad_nombre": facultad.nombre if facultad else "No asignada",
            "facultad_codigo": facultad.codigo if facultad else "N/A",
        },
        "resumen": {
            "total_creditos_matriculados": total_creditos_matriculados,
            "total_creditos_aprobados": total_creditos_aprobados,
            "promedio_ponderado_acumulado": promedio_acumulado,
        },
        "periodos": periodos_list
    }
    
    return record_data, None


def _paginar_lista(items, page=1, per_page=10):
    if page is None or per_page is None:
        return items, len(items)
    page = max(1, page)
    per_page = max(1, per_page)
    total = len(items)
    inicio = (page - 1) * per_page
    return items[inicio:inicio + per_page], total



def obtener_reporte_consolidado(id_especialidad=None, page=1, per_page=10):
    """
    Genera un reporte consolidado con estadísticas académicas globales de los estudiantes.
    Para uso de Administradores.
    """
    query = _con_matriculas_precargadas(Estudiante.query)
    if id_especialidad:
        query = query.filter_by(id_especialidad=id_especialidad)
        
    estudiantes = query.all()
    reporte = []
    
    for estudiante in estudiantes:
        especialidad = estudiante.especialidad
        
        total_creditos_matriculados = 0
        total_creditos_aprobados = 0
        cursos_calificados = []
        periodos_matriculados = set()
        
        for matricula in estudiante.matriculas:
            periodos_matriculados.add(matricula.id_periodo)
            for detalle in matricula.detalles:
                curso = detalle.curso
                if curso:
                    total_creditos_matriculados += curso.creditos
                    
                    nota = detalle.nota
                    if nota and nota.promedio is not None:
                        promedio = float(nota.promedio)
                        cursos_calificados.append((promedio, curso.creditos))
                        if promedio >= 10.5:
                            total_creditos_aprobados += curso.creditos
                            
        promedio_acumulado = calcular_promedio_ponderado(cursos_calificados)
        
        reporte.append({
            "id_estudiante": estudiante.id_estudiante,
            "codigo": estudiante.codigo,
            "nombres": estudiante.nombres,
            "apellidos": estudiante.apellidos,
            "especialidad_nombre": especialidad.nombre if especialidad else "No asignada",
            "total_creditos_matriculados": total_creditos_matriculados,
            "total_creditos_aprobados": total_creditos_aprobados,
            "promedio_ponderado_acumulado": promedio_acumulado,
            "periodos_matriculados": len(periodos_matriculados)
        })

    # Resumen global: se calcula sobre TODO el reporte (antes de recortar por
    # pagina), para que los KPI no cambien segun que pagina este visible.
    ppas_validos = [r["promedio_ponderado_acumulado"] for r in reporte if r["promedio_ponderado_acumulado"] is not None]
    resumen = {
        "total_alumnos": len(reporte),
        "promedio_ppa_global": round(sum(ppas_validos) / len(ppas_validos), 2) if ppas_validos else None,
        "promedio_creditos_aprobados": (
            round(sum(r["total_creditos_aprobados"] for r in reporte) / len(reporte), 1) if reporte else None
        ),
    }

    items, total = _paginar_lista(reporte, page, per_page)
    return items, total, resumen


def obtener_desempeno_cohortes(id_especialidad=None, page=1, per_page=10):
    """
    Analiza el desempeño de los alumnos agrupados por cohorte (año de ingreso extraído del código del alumno)
    y su respectiva Especialidad. Para uso de la Dirección.
    """
    query = _con_matriculas_precargadas(Estudiante.query)
    if id_especialidad:
        query = query.filter_by(id_especialidad=id_especialidad)
        
    estudiantes = query.all()
    
    # Agrupar estudiantes por (cohorte, especialidad_nombre)
    grupos = defaultdict(list)
    for est in estudiantes:
        cohorte = est.codigo[:4] if est.codigo and len(est.codigo) >= 4 else "Desconocido"
        especialidad_nombre = est.especialidad.nombre if est.especialidad else "No asignada"
        grupos[(cohorte, especialidad_nombre)].append(est)
        
    desempeno = []
    
    for (cohorte, esp_nombre), ests in grupos.items():
        total_estudiantes = len(ests)
        promedios_alumnos = []
        creditos_aprobados_alumnos = []
        
        total_cursos_aprobados = 0
        total_cursos_calificados = 0
        
        for est in ests:
            cursos_calificados_est = []
            total_aprobados_est = 0
            
            for mat in est.matriculas:
                for det in mat.detalles:
                    curso = det.curso
                    if curso:
                        nota = det.nota
                        if nota and nota.promedio is not None:
                            promedio = float(nota.promedio)
                            cursos_calificados_est.append((promedio, curso.creditos))
                            total_cursos_calificados += 1
                            if promedio >= 10.5:
                                total_aprobados_est += curso.creditos
                                total_cursos_aprobados += 1
                                
            promedio_est = calcular_promedio_ponderado(cursos_calificados_est)
            if promedio_est is not None:
                promedios_alumnos.append(promedio_est)
            creditos_aprobados_alumnos.append(total_aprobados_est)
            
        promedio_ponderado_promedio = (
            sum(promedios_alumnos) / len(promedios_alumnos) if promedios_alumnos else None
        )
        total_creditos_aprobados_promedio = (
            sum(creditos_aprobados_alumnos) / len(creditos_aprobados_alumnos) if creditos_aprobados_alumnos else None
        )
        tasa_aprobacion = (
            (total_cursos_aprobados / total_cursos_calificados) * 100 if total_cursos_calificados > 0 else None
        )
        
        desempeno.append({
            "cohorte": cohorte,
            "especialidad_nombre": esp_nombre,
            "total_estudiantes": total_estudiantes,
            "promedio_ponderado_promedio": round(promedio_ponderado_promedio, 2) if promedio_ponderado_promedio is not None else None,
            "total_creditos_aprobados_promedio": round(total_creditos_aprobados_promedio, 2) if total_creditos_aprobados_promedio is not None else None,
            "tasa_aprobacion": round(tasa_aprobacion, 2) if tasa_aprobacion is not None else None
        })
        
    # Ordenar por cohorte descendente y especialidad alfabética
    desempeno.sort(key=lambda x: (x["cohorte"], x["especialidad_nombre"]), reverse=True)

    # Resumen global: se calcula sobre TODAS las cohortes (antes de recortar
    # por pagina), para que los KPI no cambien segun que pagina este visible.
    proms_validos = [d["promedio_ponderado_promedio"] for d in desempeno if d["promedio_ponderado_promedio"] is not None]
    tasas_validas = [d["tasa_aprobacion"] for d in desempeno if d["tasa_aprobacion"] is not None]
    resumen = {
        "total_alumnos": sum(d["total_estudiantes"] for d in desempeno),
        "promedio_ppa_global": round(sum(proms_validos) / len(proms_validos), 2) if proms_validos else None,
        "tasa_aprobacion_global": round(sum(tasas_validas) / len(tasas_validas), 1) if tasas_validas else None,
    }

    items, total = _paginar_lista(desempeno, page, per_page)
    return items, total, resumen
