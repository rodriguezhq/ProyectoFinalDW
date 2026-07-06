from datetime import date

import pytest
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import (
    Curso,
    Especialidad,
    Estudiante,
    Facultad,
    PeriodoAcademico,
    PlanCurso,
    PlanEstudios,
    Rol,
    Seccion,
    Usuario,
)

TEST_PASSWORD = "Secret123!"


@pytest.fixture
def app():
    flask_app = create_app("testing")
    with flask_app.app_context():
        db.create_all()
        _seed_minimo()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def _seed_minimo():
    rol_admin = Rol(nombre="Administrador")
    rol_estudiante = Rol(nombre="Estudiante")
    rol_docente = Rol(nombre="Docente")
    rol_direccion = Rol(nombre="Direccion")
    db.session.add_all([rol_admin, rol_estudiante, rol_docente, rol_direccion])
    db.session.commit()

    facultad = Facultad(nombre="Facultad de Prueba", codigo="FP")
    db.session.add(facultad)
    db.session.commit()

    especialidad = Especialidad(nombre="Especialidad de Prueba", codigo="EP", id_facultad=facultad.id_facultad)
    db.session.add(especialidad)
    db.session.commit()

    estudiante = Estudiante(
        codigo="E001",
        dni="12345678",
        nombres="Juan",
        apellidos="Perez",
        correo="juan.perez@test.com",
        estado="activo",
        id_especialidad=especialidad.id_especialidad,
    )
    estudiante_2 = Estudiante(
        codigo="E002",
        dni="87654321",
        nombres="Maria",
        apellidos="Lopez",
        correo="maria.lopez@test.com",
        estado="activo",
        id_especialidad=especialidad.id_especialidad,
    )
    db.session.add_all([estudiante, estudiante_2])
    db.session.commit()

    usuario_estudiante = Usuario(
        username="jperez",
        password_hash=generate_password_hash(TEST_PASSWORD),
        estado="activo",
        id_rol=rol_estudiante.id_rol,
        id_estudiante=estudiante.id_estudiante,
    )
    usuario_estudiante_2 = Usuario(
        username="mlopez",
        password_hash=generate_password_hash(TEST_PASSWORD),
        estado="activo",
        id_rol=rol_estudiante.id_rol,
        id_estudiante=estudiante_2.id_estudiante,
    )
    usuario_inactivo = Usuario(
        username="inactivo",
        password_hash=generate_password_hash(TEST_PASSWORD),
        estado="inactivo",
        id_rol=rol_estudiante.id_rol,
    )
    usuario_admin = Usuario(
        username="admin_test",
        password_hash=generate_password_hash(TEST_PASSWORD),
        estado="activo",
        id_rol=rol_admin.id_rol,
        nombres="Rosa",
        apellidos="Admin",
        correo="admin@test.com",
    )
    usuario_direccion = Usuario(
        username="direccion_test",
        password_hash=generate_password_hash(TEST_PASSWORD),
        estado="activo",
        id_rol=rol_direccion.id_rol,
        nombres="Victor",
        apellidos="Direccion",
        correo="direccion@test.com",
    )
    db.session.add_all(
        [usuario_estudiante, usuario_estudiante_2, usuario_inactivo, usuario_admin, usuario_direccion]
    )
    db.session.commit()

    periodo = PeriodoAcademico(
        nombre="2026-I", fecha_inicio=date(2026, 3, 1), fecha_fin=date(2026, 7, 18), estado="activo"
    )
    periodo_cerrado = PeriodoAcademico(
        nombre="2025-II", fecha_inicio=date(2025, 8, 1), fecha_fin=date(2025, 12, 20), estado="cerrado"
    )
    db.session.add_all([periodo, periodo_cerrado])
    db.session.commit()

    curso = Curso(codigo="C001", nombre="Curso de Prueba", creditos=4, horas_teoria=3, horas_practica=2)
    db.session.add(curso)
    db.session.commit()

    plan = PlanEstudios(
        nombre="Plan de Prueba",
        version="1",
        fecha_aprobacion=date(2020, 1, 1),
        estado="vigente",
        id_especialidad=especialidad.id_especialidad,
    )
    db.session.add(plan)
    db.session.commit()

    plan_curso = PlanCurso(id_plan=plan.id_plan, id_curso=curso.id_curso, ciclo=1)
    db.session.add(plan_curso)
    db.session.commit()

    # capacidad=1 a proposito: permite probar el caso "seccion llena" con solo 2 estudiantes
    seccion = Seccion(
        codigo="A",
        capacidad=1,
        estado="abierta",
        id_plan_curso=plan_curso.id_plan_curso,
        id_periodo=periodo.id_periodo,
    )
    db.session.add(seccion)
    db.session.commit()
