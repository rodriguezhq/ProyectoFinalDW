from decimal import Decimal, ROUND_HALF_UP

from app.extensions import db
from app.models.nota import Nota
from app.models.matricula_detalle import MatriculaDetalle
from app.models.matricula import Matricula
from app.models.curso import Curso
from app.models.periodo_academico import PeriodoAcademico
from app.models.docente import Docente
from app.models.estudiante import Estudiante


def _calcular_promedio(parcial1, parcial2, final, sustitutorio):

    if parcial1 is None or parcial2 is None or final is None:
        return None

    notas = [Decimal(str(parcial1)), Decimal(str(parcial2)), Decimal(str(final))]

    if sustitutorio is not None:
        sust = Decimal(str(sustitutorio))
        # Reemplaza la nota más baja si el sustitutorio es mayor
        idx_min = notas.index(min(notas))
        if sust > notas[idx_min]:
            notas[idx_min] = sust

    promedio = sum(notas) / 3
    return promedio.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _determinar_estado(promedio):
    if promedio is None:
        return "registrada"
    return "aprobada" if promedio >= Decimal("10.50") else "desaprobada"


def _nota_a_dict(nota):
    detalle = nota.matricula_detalle
    curso = detalle.curso if detalle else None
    periodo = detalle.matricula.periodo if detalle and detalle.matricula else None
    
    # Buscar el docente asignado a este curso en el Horario programado
    docente = None
    if detalle and detalle.matricula:
        from app.models.horario import Horario
        horarios = Horario.query.filter_by(
            id_periodo=detalle.matricula.id_periodo,
            id_especialidad=detalle.matricula.estudiante.id_especialidad
        ).all()
        for h in horarios:
            for bloque in h.detalles:
                if bloque.get("id_curso") and int(bloque.get("id_curso")) == detalle.id_curso:
                    docente_id = bloque.get("id_docente")
                    if docente_id:
                        docente = db.session.get(Docente, int(docente_id))
                        break
            if docente:
                break

    return {
        "id_nota": nota.id_nota,
        "parcial1": float(nota.parcial1) if nota.parcial1 is not None else None,
        "parcial2": float(nota.parcial2) if nota.parcial2 is not None else None,
        "final": float(nota.final) if nota.final is not None else None,
        "sustitutorio": (
            float(nota.sustitutorio) if nota.sustitutorio is not None else None
        ),
        "promedio": float(nota.promedio) if nota.promedio is not None else None,
        "estado": nota.estado,
        "id_matricula_detalle": nota.id_matricula_detalle,
        "curso_nombre": curso.nombre if curso else None,
        "curso_codigo": curso.codigo if curso else None,
        "seccion_codigo": "A",  # Simulado
        "periodo_nombre": periodo.nombre if periodo else None,
        "docente_nombre": f"{docente.nombres} {docente.apellidos}" if docente else None,
    }


def registrar_notas(id_matricula_detalle, data):

    # Verificar que el matricula_detalle existe
    detalle = MatriculaDetalle.query.get(id_matricula_detalle)
    if not detalle:
        return None, "Matrícula detalle no encontrada"

    # Buscar nota existente o crear una nueva
    nota = Nota.query.filter_by(id_matricula_detalle=id_matricula_detalle).first()

    if nota:
        # Actualizar solo los campos que vienen en el body
        if data.get("parcial1") is not None:
            nota.parcial1 = data["parcial1"]
        if data.get("parcial2") is not None:
            nota.parcial2 = data["parcial2"]
        if data.get("final") is not None:
            nota.final = data["final"]
        if data.get("sustitutorio") is not None:
            nota.sustitutorio = data["sustitutorio"]
    else:
        # Crear nota nueva
        nota = Nota(
            parcial1=data.get("parcial1"),
            parcial2=data.get("parcial2"),
            final=data.get("final"),
            sustitutorio=data.get("sustitutorio"),
            id_matricula_detalle=id_matricula_detalle,
        )
        db.session.add(nota)

    # Calcular promedio y estado
    promedio = _calcular_promedio(
        nota.parcial1, nota.parcial2, nota.final, nota.sustitutorio
    )
    nota.promedio = promedio
    nota.estado = _determinar_estado(promedio)

    db.session.commit()
    return _nota_a_dict(nota), None


def obtener_notas_estudiante(id_estudiante):
    estudiante = Estudiante.query.get(id_estudiante)
    if not estudiante:
        return None, []

    estudiante_dict = {
        "id_estudiante": estudiante.id_estudiante,
        "codigo": estudiante.codigo,
        "nombres": estudiante.nombres,
        "apellidos": estudiante.apellidos,
        "dni": estudiante.dni,
        "correo": estudiante.correo,
    }

    notas = (
        Nota.query.join(
            MatriculaDetalle,
            Nota.id_matricula_detalle == MatriculaDetalle.id_matricula_detalle,
        )
        .join(Matricula, MatriculaDetalle.id_matricula == Matricula.id_matricula)
        .filter(Matricula.id_estudiante == id_estudiante)
        .all()
    )
    return estudiante_dict, [_nota_a_dict(n) for n in notas]


def obtener_notas_curso(id_curso):
    detalles = MatriculaDetalle.query.filter_by(id_curso=id_curso).all()

    resultado = []
    for detalle in detalles:
        nota = detalle.nota
        if nota:
            nota_dict = _nota_a_dict(nota)
        else:
            curso = detalle.curso
            periodo = detalle.matricula.periodo if detalle.matricula else None
            
            # Buscar el docente en el Horario programado
            docente = None
            if detalle and detalle.matricula:
                from app.models.horario import Horario
                horarios = Horario.query.filter_by(
                    id_periodo=detalle.matricula.id_periodo,
                    id_especialidad=detalle.matricula.estudiante.id_especialidad
                ).all()
                for h in horarios:
                    for bloque in h.detalles:
                        if bloque.get("id_curso") and int(bloque.get("id_curso")) == detalle.id_curso:
                            docente_id = bloque.get("id_docente")
                            if docente_id:
                                docente = db.session.get(Docente, int(docente_id))
                                break
                    if docente:
                        break

            nota_dict = {
                "id_nota": None,
                "parcial1": None,
                "parcial2": None,
                "final": None,
                "sustitutorio": None,
                "promedio": None,
                "estado": "sin_nota",
                "id_matricula_detalle": detalle.id_matricula_detalle,
                "curso_nombre": curso.nombre if curso else None,
                "curso_codigo": curso.codigo if curso else None,
                "seccion_codigo": "A",
                "periodo_nombre": periodo.nombre if periodo else None,
                "docente_nombre": (
                    f"{docente.nombres} {docente.apellidos}" if docente else None
                ),
            }

        # Agregar info del estudiante
        estudiante = detalle.matricula.estudiante
        nota_dict["estudiante_nombre"] = f"{estudiante.nombres} {estudiante.apellidos}"
        nota_dict["estudiante_codigo"] = estudiante.codigo

        resultado.append(nota_dict)

    return resultado


def obtener_notas_curso_periodo(id_curso, id_periodo):
    # Obtiene las notas de los estudiantes matriculados en un curso para un periodo especifico
    detalles_matricula = MatriculaDetalle.query.join(Matricula).filter(
        Matricula.id_periodo == id_periodo,
        MatriculaDetalle.id_curso == id_curso
    ).all()

    resultado_notas = []
    for detalle in detalles_matricula:
        nota_estudiante = detalle.nota
        if nota_estudiante:
            diccionario_nota = _nota_a_dict(nota_estudiante)
        else:
            objeto_curso = detalle.curso
            objeto_periodo = detalle.matricula.periodo if detalle.matricula else None
            
            # Buscar el docente en el Horario programado
            objeto_docente = None
            if detalle and detalle.matricula:
                from app.models.horario import Horario
                lista_horarios = Horario.query.filter_by(
                    id_periodo=detalle.matricula.id_periodo,
                    id_especialidad=detalle.matricula.estudiante.id_especialidad
                ).all()
                for item_horario in lista_horarios:
                    for item_bloque in item_horario.detalles:
                        if item_bloque.get("id_curso") and int(item_bloque.get("id_curso")) == detalle.id_curso:
                            id_docente_bloque = item_bloque.get("id_docente")
                            if id_docente_bloque:
                                objeto_docente = db.session.get(Docente, int(id_docente_bloque))
                                break
                    if objeto_docente:
                        break

            diccionario_nota = {
                "id_nota": None,
                "parcial1": None,
                "parcial2": None,
                "final": None,
                "sustitutorio": None,
                "promedio": None,
                "estado": "sin_nota",
                "id_matricula_detalle": detalle.id_matricula_detalle,
                "curso_nombre": objeto_curso.nombre if objeto_curso else None,
                "curso_codigo": objeto_curso.codigo if objeto_curso else None,
                "seccion_codigo": "A",
                "periodo_nombre": objeto_periodo.nombre if objeto_periodo else None,
                "docente_nombre": (
                    f"{objeto_docente.nombres} {objeto_docente.apellidos}" if objeto_docente else None
                ),
            }

        # Agregar informacion del estudiante
        objeto_estudiante = detalle.matricula.estudiante
        diccionario_nota["estudiante_nombre"] = f"{objeto_estudiante.nombres} {objeto_estudiante.apellidos}"
        diccionario_nota["estudiante_codigo"] = objeto_estudiante.codigo

        resultado_notas.append(diccionario_nota)

    return resultado_notas

