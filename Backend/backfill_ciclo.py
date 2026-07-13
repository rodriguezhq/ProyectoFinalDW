"""
Backfill de Estudiante.ciclo para filas existentes (creadas antes de que ese
campo existiera en el modelo). Replica exactamente la misma logica que ya usa
_obtener_ciclo_estudiante() en enrollmentController.py, para que el valor
guardado coincida con lo que la app ya inferia al vuelo:

  1. Si tiene matricula en el periodo activo -> ciclo de esa seccion.
  2. Si no, busca su matricula mas reciente en un periodo pasado -> ciclo
     maximo de esos cursos + 1 (tope 10).
  3. Si no tiene ninguna matricula -> ciclo 1 (estudiante nuevo).

Uso:
    python backfill_ciclo.py
"""

from app import create_app
from app.extensions import db
from app.models import Estudiante, Matricula, PeriodoAcademico


def calcular_ciclo(estudiante, id_periodo_actual):
    matricula_actual = Matricula.query.filter_by(
        id_estudiante=estudiante.id_estudiante, id_periodo=id_periodo_actual
    ).first()
    if matricula_actual:
        for det in matricula_actual.detalles:
            if det.seccion and det.seccion.ciclo:
                return det.seccion.ciclo

    matricula_pasada = (
        Matricula.query.filter(
            Matricula.id_estudiante == estudiante.id_estudiante,
            Matricula.id_periodo != id_periodo_actual,
        )
        .order_by(Matricula.id_periodo.desc())
        .first()
    )
    if matricula_pasada:
        ciclo_max = 0
        for det in matricula_pasada.detalles:
            if det.seccion and det.seccion.ciclo:
                ciclo_max = max(ciclo_max, det.seccion.ciclo)
        if ciclo_max > 0:
            return min(ciclo_max + 1, 10)

    return 1


def run():
    periodo_actual = PeriodoAcademico.query.filter_by(es_matricula_activa=True).first()
    estudiantes = Estudiante.query.filter(Estudiante.ciclo.is_(None)).all()
    print(f"Estudiantes sin ciclo: {len(estudiantes)}")

    for est in estudiantes:
        est.ciclo = calcular_ciclo(est, periodo_actual.id_periodo)
    db.session.commit()

    print(f"Actualizados: {len(estudiantes)}")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        run()
