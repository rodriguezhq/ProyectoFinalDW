"""
Generador de datos masivos (factory_boy + Faker) para poblar el sistema con
volumen realista. Se apoya en el baseline que crea seed.py (roles, periodos,
facultades, especialidades, cursos, secciones, docentes y estudiantes base)
y solo AGREGA filas nuevas encima -- nunca borra ni reemplaza nada, así que
requiere que seed.py ya se haya corrido al menos una vez.

Respeta todos los unique constraints del esquema actual:
  - Docente.codigo / Docente.dni
  - Estudiante.codigo / Estudiante.dni
  - Usuario.username, Usuario.id_estudiante, Usuario.id_docente
  - Curso.codigo, Especialidad.codigo, Facultad.codigo (no se tocan, se reusa el catalogo)
  - uq_matricula_estudiante_periodo (id_estudiante, id_periodo)
  - uq_matricula_curso (id_matricula, id_curso)
  - Nota.id_matricula_detalle (unique, una nota por detalle)
  - Silabo.id_curso (unique, un silabo por curso)

Es re-ejecutable: cada corrida usa un offset aleatorio (RUN_OFFSET) para que
los codigos/dni/usernames nuevos no choquen con corridas anteriores.

Uso:
    python factories.py
    python factories.py --estudiantes 100 --docentes 15 --documentos 80 --auditoria 300
"""

import argparse
import random
from datetime import date, datetime, timedelta

import factory
from faker import Faker
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import (
    Auditoria,
    Curso,
    Docente,
    Documento,
    Especialidad,
    Estudiante,
    Facultad,
    Horario,
    Matricula,
    MatriculaDetalle,
    Nota,
    Pago,
    PeriodoAcademico,
    Rol,
    Seccion,
    Silabo,
    Usuario,
)

fake = Faker("es_ES")
DEMO_PASSWORD = "Password123!"
RUN_OFFSET = random.randint(1000, 8999)

TIPOS_DOCUMENTO = [
    "Constancia de Matrícula",
    "Constancia de Estudios",
    "Certificado de Notas",
    "Récord Académico",
]

# Facultades/especialidades nuevas que el generador puede crear (get-or-create
# por codigo: si ya existen de una corrida anterior, se reusan sin duplicar).
CATALOGO_FACULTADES = [
    ("Facultad de Ingenieria Mecanica", "FIM", "Ingenieria Mecanica", "IM"),
    ("Facultad de Ingenieria Electrica", "FIE", "Ingenieria Electrica", "IE"),
    ("Facultad de Ingenieria Industrial", "FII", "Ingenieria Industrial", "II"),
    ("Facultad de Ingenieria Quimica", "FIQ", "Ingenieria Quimica", "IQ"),
    ("Facultad de Ciencias Ambientales", "FCA", "Ingenieria Ambiental", "IAM"),
]

# Periodos historicos cerrados que se crean si no existen (2025-II ya viene
# del seed; 2026-I es el activo y unico con matricula activa).
PERIODOS_HISTORICOS = ["2023-I", "2023-II", "2024-I", "2024-II", "2025-I"]

NOMBRES_CURSO = [
    "Matematica Aplicada", "Fisica General", "Quimica General",
    "Dibujo de Ingenieria", "Estatica", "Dinamica", "Termodinamica",
    "Mecanica de Materiales", "Circuitos Electricos", "Procesos de Manufactura",
    "Investigacion de Operaciones", "Gestion de Calidad", "Seguridad Industrial",
    "Legislacion Laboral", "Etica Profesional", "Metodologia de la Investigacion",
    "Estadistica y Probabilidades", "Economia General", "Gestion Ambiental",
    "Proyecto de Tesis",
]

DIAS_SEMANA = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]
HORAS_INICIO = [8, 10, 14, 16]

ACCIONES_TABLA = {
    "login_exitoso": "usuario",
    "login_fallido": "usuario",
    "login_fallido_cuenta_inactiva": "usuario",
    "crear_usuario": "usuario",
    "actualizar_usuario": "usuario",
    "guardar_horario_ciclo": "horario",
    "registrar_matricula": "matricula",
    "confirmar_matricula_admin": "matricula",
    "confirmar_pago_admin": "pago",
    "actualizar_nota": "nota",
    "validar_acta": "matricula_detalle",
    "crear_periodo": "periodo_academico",
    "activar_periodo": "periodo_academico",
    "establecer_periodo_matricula": "periodo_academico",
}


def _slug(texto):
    tabla = str.maketrans("áéíóúÁÉÍÓÚñÑ", "aeiouAEIOUnN")
    return texto.translate(tabla).lower().replace(" ", "")


def _username(nombres, apellidos, n):
    base = _slug(f"{nombres.split()[0][0]}{apellidos.split()[0]}")
    return f"{base}{RUN_OFFSET}{n}"


def _nota_aprobatoria(prob_aprobado=0.78):
    if random.random() < prob_aprobado:
        return round(random.uniform(10.5, 19.5), 2)
    return round(random.uniform(3.0, 10.4), 2)


def _fecha_aleatoria(inicio, fin):
    delta = fin - inicio
    segundos = random.randint(0, int(delta.total_seconds()))
    return inicio + timedelta(seconds=segundos)


def _ip_aleatoria():
    return f"192.168.{random.randint(1, 5)}.{random.randint(2, 250)}"


class DocenteFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Docente
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "commit"

    codigo = factory.Sequence(lambda n: f"D{RUN_OFFSET + n:05d}")
    dni = factory.Sequence(lambda n: str(41000000 + RUN_OFFSET + n))
    nombres = factory.LazyFunction(fake.first_name)
    apellidos = factory.LazyFunction(lambda: f"{fake.last_name()} {fake.last_name()}")
    telefono = factory.LazyFunction(lambda: f"9{random.randint(10000000, 99999999)}")
    categoria = factory.LazyFunction(lambda: random.choice(["Principal", "Asociado", "Auxiliar"]))
    condicion = factory.LazyFunction(lambda: random.choice(["Nombrado", "Contratado"]))
    estado = "activo"

    @factory.lazy_attribute
    def correo(self):
        return f"{_slug(self.nombres)}.{_slug(self.apellidos.split()[0])}{RUN_OFFSET}@uncp.edu.pe"


class EstudianteFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Estudiante
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "commit"

    nombres = factory.LazyFunction(fake.first_name)
    apellidos = factory.LazyFunction(lambda: f"{fake.last_name()} {fake.last_name()}")
    dni = factory.Sequence(lambda n: str(72000000 + RUN_OFFSET + n))
    telefono = factory.LazyFunction(lambda: f"9{random.randint(10000000, 99999999)}")
    ciclo = 1
    estado = "activo"

    @factory.lazy_attribute
    def correo(self):
        return f"{_slug(self.nombres)}.{_slug(self.apellidos.split()[0])}{RUN_OFFSET}@uncp.edu.pe"


class SilaboFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Silabo
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = "commit"

    fecha_subida = factory.LazyFunction(datetime.now)
    estado = factory.LazyFunction(lambda: random.choice(["aprobado", "aprobado", "pendiente"]))

    @factory.lazy_attribute
    def archivo(self):
        return f"/silabos/curso_{self.id_curso}_gen{RUN_OFFSET}.pdf"


def cargar_catalogo():
    """Lee el catalogo que seed.py ya dejo en la BD (no crea nada nuevo)."""
    rol_docente = Rol.query.filter_by(nombre="Docente").first()
    rol_estudiante = Rol.query.filter_by(nombre="Estudiante").first()
    usuario_admin = Usuario.query.filter_by(username="admin").first()
    usuario_direccion = Usuario.query.filter_by(username="direccion").first()

    if not all([rol_docente, rol_estudiante, usuario_admin, usuario_direccion]):
        raise RuntimeError(
            "No se encontro el baseline de seed.py (roles/usuarios admin-direccion). "
            "Corre 'python seed.py' primero."
        )

    periodo_pasado = PeriodoAcademico.query.filter_by(estado="cerrado").first()
    periodo_actual = PeriodoAcademico.query.filter_by(es_matricula_activa=True).first()
    facultades = Facultad.query.all()
    especialidades = {e.codigo: e for e in Especialidad.query.all()}
    cursos = Curso.query.all()
    secciones = Seccion.query.all()

    return {
        "rol_docente": rol_docente,
        "rol_estudiante": rol_estudiante,
        "usuario_admin": usuario_admin,
        "usuario_direccion": usuario_direccion,
        "periodo_pasado": periodo_pasado,
        "periodo_actual": periodo_actual,
        "facultades": facultades,
        "especialidades": especialidades,
        "cursos": cursos,
        "secciones": secciones,
    }


def _crear_secciones_y_horarios(facultad, especialidad, periodo, cursos_esp, docentes_fac):
    """Crea seccion 'A' y bloque de Horario JSON para cada ciclo, asignando
    docentes de la facultad en slots que no se crucen entre si (mismo docente
    nunca queda con dos bloques el mismo dia/hora dentro del periodo)."""
    ocupado = set()
    for ciclo in range(1, 11):
        cursos_ciclo = [c for c in cursos_esp if c.ciclo == ciclo]
        if not cursos_ciclo:
            continue
        slots_ciclo = set()  # dos cursos del mismo ciclo nunca al mismo dia/hora

        seccion = Seccion.query.filter_by(
            id_periodo=periodo.id_periodo, id_especialidad=especialidad.id_especialidad,
            ciclo=ciclo, codigo="A",
        ).first()
        if not seccion:
            seccion = Seccion(
                codigo="A", id_especialidad=especialidad.id_especialidad,
                ciclo=ciclo, id_periodo=periodo.id_periodo,
            )
            db.session.add(seccion)
            db.session.commit()

        horario = Horario.query.filter_by(
            id_periodo=periodo.id_periodo, id_facultad=facultad.id_facultad,
            id_especialidad=especialidad.id_especialidad, ciclo=ciclo,
        ).first()
        if horario:
            continue

        bloques = []
        for curso in cursos_ciclo:
            docente = random.choice(docentes_fac)
            slot = next(
                (d, h) for d in DIAS_SEMANA for h in HORAS_INICIO
                if (docente.id_docente, d, h) not in ocupado and (d, h) not in slots_ciclo
            )
            ocupado.add((docente.id_docente, slot[0], slot[1]))
            slots_ciclo.add(slot)
            bloques.append({
                "codigo": "A",
                "seccion": "A",
                "dia": slot[0],
                "horaInicio": f"{slot[1]:02d}:00",
                "horaFin": f"{slot[1] + 2:02d}:00",
                "id_curso": curso.id_curso,
                "curso_nombre": curso.nombre,
                "id_docente": docente.id_docente,
            })
        db.session.add(Horario(
            id_periodo=periodo.id_periodo, id_facultad=facultad.id_facultad,
            id_especialidad=especialidad.id_especialidad, ciclo=ciclo,
            estado="activo", detalles=bloques,
        ))
        db.session.commit()


def generar_catalogo(ctx, n_facultades):
    """Amplia el catalogo academico: facultades nuevas con su especialidad,
    docentes, decano, malla de cursos (2 por ciclo, con prerrequisitos),
    secciones y horarios en ambos periodos. Todo get-or-create por codigo,
    asi que re-correrlo no duplica nada."""
    n = min(n_facultades, len(CATALOGO_FACULTADES))
    print(f"Ampliando catalogo academico ({n} facultades nuevas)...")
    pw = generate_password_hash(DEMO_PASSWORD)

    for idx, (nombre_fac, cod_fac, nombre_esp, cod_esp) in enumerate(CATALOGO_FACULTADES[:n]):
        facultad = Facultad.query.filter_by(codigo=cod_fac).first()
        if not facultad:
            facultad = Facultad(nombre=nombre_fac, codigo=cod_fac)
            db.session.add(facultad)
            db.session.commit()

        especialidad = Especialidad.query.filter_by(codigo=cod_esp).first()
        if not especialidad:
            especialidad = Especialidad(
                nombre=nombre_esp, codigo=cod_esp, id_facultad=facultad.id_facultad
            )
            db.session.add(especialidad)
            db.session.commit()

        docentes_fac = Docente.query.filter_by(id_facultad=facultad.id_facultad).all()
        while len(docentes_fac) < 3:
            docente = DocenteFactory.create(id_facultad=facultad.id_facultad)
            db.session.add(Usuario(
                username=_username(docente.nombres, docente.apellidos, f"c{idx}{len(docentes_fac)}"),
                password_hash=pw, estado="activo",
                id_rol=ctx["rol_docente"].id_rol, id_docente=docente.id_docente,
            ))
            db.session.commit()
            docentes_fac.append(docente)

        if not facultad.id_decano:
            facultad.id_decano = docentes_fac[0].id_docente
            db.session.commit()

        cursos_esp = []
        for ciclo in range(1, 11):
            for j in range(2):
                codigo_curso = f"{cod_esp}{ciclo}0{j + 1}"
                curso = Curso.query.filter_by(codigo=codigo_curso).first()
                if not curso:
                    curso = Curso(
                        codigo=codigo_curso,
                        nombre=NOMBRES_CURSO[(ciclo * 2 + j + idx * 3) % len(NOMBRES_CURSO)],
                        creditos=random.randint(3, 5),
                        horas_teoria=random.randint(2, 3),
                        horas_practica=random.randint(2, 4),
                        ciclo=ciclo,
                        id_facultad=facultad.id_facultad,
                    )
                    db.session.add(curso)
                    curso.especialidades.append(especialidad)
                    if ciclo > 1 and random.random() < 0.6:
                        previos = [c for c in cursos_esp if c.ciclo == ciclo - 1]
                        if previos:
                            curso.prerrequisitos.append(random.choice(previos))
                    db.session.commit()
                cursos_esp.append(curso)

        for periodo in [ctx["periodo_pasado"], ctx["periodo_actual"]]:
            _crear_secciones_y_horarios(facultad, especialidad, periodo, cursos_esp, docentes_fac)

    # Refrescar el catalogo en memoria para que la generacion de estudiantes
    # tambien matricule en las especialidades nuevas.
    ctx["facultades"] = Facultad.query.all()
    ctx["especialidades"] = {e.codigo: e for e in Especialidad.query.all()}
    ctx["cursos"] = Curso.query.all()
    ctx["secciones"] = Seccion.query.all()


def generar_historial_periodos(ctx):
    """Crea los periodos historicos cerrados y, para cada especialidad,
    sus secciones y horarios en cada periodo cerrado (get-or-create), de
    modo que los estudiantes veteranos puedan tener record academico real
    en varios semestres."""
    print("Creando historial de periodos academicos...")
    for nombre in PERIODOS_HISTORICOS:
        if not PeriodoAcademico.query.filter_by(nombre=nombre).first():
            db.session.add(PeriodoAcademico(nombre=nombre, estado="cerrado", es_matricula_activa=False))
    db.session.commit()

    ctx["periodos_cerrados"] = sorted(
        PeriodoAcademico.query.filter_by(estado="cerrado").all(), key=lambda p: p.nombre
    )

    for especialidad in ctx["especialidades"].values():
        facultad = especialidad.facultad
        cursos_esp = [c for c in ctx["cursos"] if especialidad in c.especialidades]
        docentes_fac = Docente.query.filter_by(id_facultad=facultad.id_facultad).all()
        if not cursos_esp or not docentes_fac:
            continue
        for periodo in ctx["periodos_cerrados"]:
            _crear_secciones_y_horarios(facultad, especialidad, periodo, cursos_esp, docentes_fac)

    ctx["secciones"] = Seccion.query.all()


def generar_admins(ctx, cantidad):
    """Usuarios extra de rol Administrador y Direccion (alternados)."""
    print(f"Creando {cantidad} usuarios de Administracion/Direccion...")
    rol_admin = Rol.query.filter_by(nombre="Administrador").first()
    rol_direccion = Rol.query.filter_by(nombre="Direccion").first()
    pw = generate_password_hash(DEMO_PASSWORD)
    for i in range(cantidad):
        rol = rol_admin if i % 2 == 0 else rol_direccion
        nombres = fake.first_name()
        apellidos = f"{fake.last_name()} {fake.last_name()}"
        db.session.add(Usuario(
            username=_username(nombres, apellidos, f"a{i}"),
            password_hash=pw, estado="activo", id_rol=rol.id_rol,
            nombres=nombres, apellidos=apellidos,
            correo=f"{_slug(nombres)}.{_slug(apellidos.split()[0])}{RUN_OFFSET}@uncp.edu.pe",
        ))
    db.session.commit()


def generar_docentes(ctx, cantidad):
    print(f"Creando {cantidad} docentes nuevos...")
    pw = generate_password_hash(DEMO_PASSWORD)
    docentes = []
    for i in range(cantidad):
        facultad = random.choice(ctx["facultades"])
        docente = DocenteFactory.create(id_facultad=facultad.id_facultad)
        usuario = Usuario(
            username=_username(docente.nombres, docente.apellidos, f"d{i}"),
            password_hash=pw,
            estado="activo",
            id_rol=ctx["rol_docente"].id_rol,
            id_docente=docente.id_docente,
        )
        db.session.add(usuario)
        docentes.append(docente)
    db.session.commit()
    return docentes


def _secciones_disponibles(ctx, especialidad_codigo, periodo):
    """Secciones existentes de esa especialidad+periodo, junto con el curso
    de ese mismo ciclo (una seccion puede alojar cualquier curso de su ciclo).
    Un mismo curso solo aparece una vez (con una sola seccion candidata) para
    que random.sample nunca pueda elegirlo dos veces y violar uq_matricula_curso."""
    especialidad = ctx["especialidades"][especialidad_codigo]
    pares_por_curso = {}
    for seccion in ctx["secciones"]:
        if seccion.id_periodo != periodo.id_periodo or seccion.id_especialidad != especialidad.id_especialidad:
            continue
        cursos_del_ciclo = [
            c for c in ctx["cursos"]
            if c.ciclo == seccion.ciclo and especialidad in c.especialidades
        ]
        for curso in cursos_del_ciclo:
            pares_por_curso.setdefault(curso.id_curso, (curso, seccion))
    return list(pares_por_curso.values())


def calcular_ciclo_estudiante(estudiante, id_periodo_actual):
    """
    Calcula el ciclo actual en base a las matriculas del estudiante.
    """
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


def generar_estudiantes(ctx, cantidad):
    print(f"Creando {cantidad} estudiantes nuevos (con matriculas, notas y pagos)...")
    pw = generate_password_hash(DEMO_PASSWORD)
    cohortes = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
    pesos_cohorte = [5, 10, 15, 15, 15, 15, 15, 10]

    periodos_cerrados = ctx.get("periodos_cerrados", [ctx["periodo_pasado"]])
    pares_cache = {}

    def pares_de(cod, periodo):
        clave = (cod, periodo.id_periodo)
        if clave not in pares_cache:
            pares_cache[clave] = _secciones_disponibles(ctx, cod, periodo)
        return pares_cache[clave]

    # Solo especialidades donde de verdad se puede matricular hoy
    codigos_esp = [cod for cod in ctx["especialidades"] if pares_de(cod, ctx["periodo_actual"])]
    pesos_esp = [40 if cod == "IS" else 15 if cod == "IC" else 12 for cod in codigos_esp]

    pagos_creados = 0
    for i in range(cantidad):
        anio = random.choices(cohortes, weights=pesos_cohorte, k=1)[0]
        especialidad_codigo = random.choices(codigos_esp, weights=pesos_esp, k=1)[0]
        especialidad = ctx["especialidades"][especialidad_codigo]

        codigo = f"{anio}{200000 + RUN_OFFSET + i:06d}"
        edad_ingreso = random.randint(17, 22)
        nacimiento = date(anio - edad_ingreso, random.randint(1, 12), random.randint(1, 28))

        estudiante = EstudianteFactory.create(
            codigo=codigo,
            fecha_nacimiento=nacimiento,
            id_especialidad=especialidad.id_especialidad,
        )
        usuario = Usuario(
            username=_username(estudiante.nombres, estudiante.apellidos, f"e{i}"),
            password_hash=pw,
            estado="activo",
            id_rol=ctx["rol_estudiante"].id_rol,
            id_estudiante=estudiante.id_estudiante,
        )
        db.session.add(usuario)
        db.session.commit()

        _matricular(ctx, estudiante, ctx["periodo_actual"], pares_de(especialidad_codigo, ctx["periodo_actual"]), en_curso=True)
        pagos_creados += 1

        # Historial: matricula en cada periodo cerrado desde su anio de
        # ingreso (con alguna pausa aleatoria, como en la vida real)
        for periodo in periodos_cerrados:
            if int(periodo.nombre[:4]) < anio:
                continue
            if random.random() > 0.85:
                continue
            pares = pares_de(especialidad_codigo, periodo)
            if pares:
                _matricular(ctx, estudiante, periodo, pares, en_curso=False)
                pagos_creados += 1

        # Calcular y persistir el ciclo del estudiante segun las matriculas generadas
        estudiante.ciclo = calcular_ciclo_estudiante(estudiante, ctx["periodo_actual"].id_periodo)
        db.session.commit()

    print(f"  -> {pagos_creados} matriculas (con su pago) generadas para los nuevos estudiantes.")


def _fecha_matricula_para(periodo):
    """Fecha de matricula plausible segun el nombre del periodo (YYYY-R)."""
    anio = int(periodo.nombre[:4])
    if periodo.nombre.endswith("-I"):
        return _fecha_aleatoria(datetime(anio, 2, 15), datetime(anio, 3, 10))
    return _fecha_aleatoria(datetime(anio, 7, 10), datetime(anio, 8, 5))


def _bloques_de(curso, seccion):
    """Bloques del Horario JSON que corresponden a este curso+seccion."""
    horario = Horario.query.filter_by(
        id_periodo=seccion.id_periodo,
        id_especialidad=seccion.id_especialidad,
        ciclo=seccion.ciclo,
    ).first()
    if not horario:
        return []
    return [
        b for b in (horario.detalles or [])
        if b.get("id_curso") == curso.id_curso and (b.get("seccion") or "A") == seccion.codigo
    ]


def _chocan(b1, b2):
    if b1.get("dia") != b2.get("dia"):
        return False
    return b1.get("horaInicio", "") < b2.get("horaFin", "") and b2.get("horaInicio", "") < b1.get("horaFin", "")


def _matricular(ctx, estudiante, periodo, pares_disponibles, en_curso):
    """Crea una Matricula + N MatriculaDetalle (cursos distintos) + Nota + Pago.

    Respeta la misma regla que valida el sistema al matricular: nunca elige
    dos cursos cuyos bloques de horario se crucen entre si.
    """
    objetivo = min(len(pares_disponibles), random.randint(3, 6))
    barajados = random.sample(pares_disponibles, k=len(pares_disponibles))
    elegidos = []
    bloques_tomados = []
    for curso, seccion in barajados:
        bloques = _bloques_de(curso, seccion)
        if any(_chocan(b, t) for b in bloques for t in bloques_tomados):
            continue
        elegidos.append((curso, seccion))
        bloques_tomados.extend(bloques)
        if len(elegidos) >= objetivo:
            break

    fecha_matricula = _fecha_matricula_para(periodo)
    matricula = Matricula(
        id_estudiante=estudiante.id_estudiante,
        id_periodo=periodo.id_periodo,
        fecha_matricula=fecha_matricula,
        estado="confirmada",
    )
    db.session.add(matricula)
    db.session.commit()

    for curso, seccion in elegidos:
        detalle = MatriculaDetalle(
            id_matricula=matricula.id_matricula,
            id_seccion=seccion.id_seccion,
            id_curso=curso.id_curso,
            estado="matriculado",
        )
        db.session.add(detalle)
        db.session.flush()  # asigna el id sin cerrar la transaccion

        if en_curso:
            if random.random() < 0.5:
                nota = Nota(estado="pendiente", id_matricula_detalle=detalle.id_matricula_detalle)
            else:
                parcial1 = round(random.uniform(8, 19), 2)
                parcial2 = round(random.uniform(8, 19), 2) if random.random() < 0.4 else None
                nota = Nota(
                    parcial1=parcial1, parcial2=parcial2, estado="registrada",
                    id_matricula_detalle=detalle.id_matricula_detalle,
                )
        else:
            parcial1 = round(random.uniform(6, 19), 2)
            parcial2 = round(random.uniform(6, 19), 2)
            final = round(random.uniform(6, 19), 2)
            promedio = _nota_aprobatoria()
            nota = Nota(
                parcial1=parcial1, parcial2=parcial2, final=final, promedio=promedio,
                estado="consolidada", id_matricula_detalle=detalle.id_matricula_detalle,
            )
        db.session.add(nota)
    db.session.commit()

    monto = round(random.uniform(280, 650), 2)
    pago = Pago(
        fecha_pago=fecha_matricula + timedelta(minutes=random.randint(10, 120)),
        monto=monto,
        metodo_pago=random.choice(["transferencia", "tarjeta", "deposito", "efectivo"]),
        codigo_operacion=f"OP-{fecha_matricula:%Y%m%d}-{RUN_OFFSET}{matricula.id_matricula}",
        estado="confirmado" if (not en_curso or random.random() < 0.75) else "pendiente",
        id_matricula=matricula.id_matricula,
    )
    db.session.add(pago)
    db.session.commit()


def generar_silabos(ctx):
    cursos_sin_silabo = [
        c for c in ctx["cursos"] if not Silabo.query.filter_by(id_curso=c.id_curso).first()
    ]
    print(f"Creando silabos para {len(cursos_sin_silabo)} cursos que aun no tenian...")
    for curso in cursos_sin_silabo:
        SilaboFactory.create(id_curso=curso.id_curso)
    db.session.commit()


def generar_documentos(ctx, cantidad):
    print(f"Creando {cantidad} solicitudes de documentos/certificados...")
    estudiantes = Estudiante.query.all()
    for i in range(cantidad):
        estudiante = random.choice(estudiantes)
        tipo = random.choice(TIPOS_DOCUMENTO)
        fecha_solicitud = _fecha_aleatoria(datetime(2025, 8, 1), datetime(2026, 7, 12))
        estado = random.choices(["solicitado", "autorizado", "emitido"], weights=[40, 25, 35], k=1)[0]

        documento = Documento(
            tipo_documento=tipo, fecha_solicitud=fecha_solicitud, estado="solicitado",
            id_estudiante=estudiante.id_estudiante,
        )
        db.session.add(documento)
        db.session.commit()

        if estado in ("autorizado", "emitido"):
            documento.estado = "autorizado"
            documento.id_usuario_autoriza = ctx["usuario_direccion"].id_usuario
            db.session.commit()

        if estado == "emitido":
            fecha_emision = fecha_solicitud + timedelta(days=random.randint(1, 5))
            codigo_qr = f"QR-{tipo[:3].upper()}-{documento.id_documento}-{fecha_solicitud:%Y%m%d}"
            documento.estado = "emitido"
            documento.fecha_emision = fecha_emision
            documento.codigo_qr = codigo_qr
            documento.archivo = f"/documentos/{codigo_qr.lower()}.pdf"
            documento.id_usuario_emite = ctx["usuario_admin"].id_usuario
            db.session.commit()


def generar_auditoria(ctx, cantidad):
    print(f"Creando {cantidad} registros de auditoria...")
    usuarios = Usuario.query.all()
    acciones = list(ACCIONES_TABLA.keys())
    registros = []
    for _ in range(cantidad):
        usuario = random.choice(usuarios)
        accion = random.choice(acciones)
        registros.append(Auditoria(
            accion=accion,
            tabla=ACCIONES_TABLA[accion],
            registro=str(random.randint(1, 500)),
            fecha=_fecha_aleatoria(datetime(2025, 7, 1), datetime(2026, 7, 12)),
            ip=_ip_aleatoria(),
            id_usuario=usuario.id_usuario,
        ))
    db.session.add_all(registros)
    db.session.commit()


def run(n_docentes, n_estudiantes, n_documentos, n_auditoria, n_facultades, n_admins):
    ctx = cargar_catalogo()
    generar_catalogo(ctx, n_facultades)
    generar_historial_periodos(ctx)
    generar_admins(ctx, n_admins)
    generar_docentes(ctx, n_docentes)
    generar_estudiantes(ctx, n_estudiantes)
    # Se deshabilita la generacion automatica de silabos para cumplir con la regla de que inicien sin silabo
    # generar_silabos(ctx)
    generar_documentos(ctx, n_documentos)
    generar_auditoria(ctx, n_auditoria)

    print("\nPoblado con factories completo.")
    print(f"Password para todos los usuarios generados: {DEMO_PASSWORD}")
    print(f"Offset de esta corrida (RUN_OFFSET): {RUN_OFFSET}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Poblar la BD con datos masivos via factory_boy.")
    parser.add_argument("--docentes", type=int, default=10)
    parser.add_argument("--estudiantes", type=int, default=70)
    parser.add_argument("--documentos", type=int, default=60)
    parser.add_argument("--auditoria", type=int, default=250)
    parser.add_argument("--facultades", type=int, default=3,
                        help="Facultades nuevas con especialidad, cursos, secciones y horarios (max 5)")
    parser.add_argument("--admins", type=int, default=4,
                        help="Usuarios extra de Administrador/Direccion (alternados)")
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        run(args.docentes, args.estudiantes, args.documentos, args.auditoria,
            args.facultades, args.admins)
