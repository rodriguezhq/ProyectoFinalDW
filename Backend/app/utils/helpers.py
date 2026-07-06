from decimal import Decimal, ROUND_HALF_UP


def calcular_promedio_ponderado(cursos_calificados):
    if not cursos_calificados:
        return None

    suma_ponderada = sum(Decimal(str(p)) * c for p, c in cursos_calificados)
    suma_creditos = sum(c for _, c in cursos_calificados)

    if suma_creditos == 0:
        return None

    promedio = suma_ponderada / Decimal(str(suma_creditos))
    return float(promedio.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
