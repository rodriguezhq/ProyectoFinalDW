from datetime import date

import pytest
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import (
    Curso,
    Docente,
    Especialidad,
    Estudiante,
    Facultad,
    PeriodoAcademico,
    Rol,
    Seccion,
    Usuario,
)

CONTRASENA_PRUEBA = "Secret123!"
TEST_PASSWORD = CONTRASENA_PRUEBA  # Alias para compatibilidad con tests existentes


def token_para(client, username):
    with client.application.app_context():
        user = Usuario.query.filter_by(username=username).first()
        return create_access_token(
            identity=str(user.id_usuario),
            additional_claims={"id_rol": user.id_rol, "rol": user.rol.nombre if user.rol else None},
        )


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
    # Roles
    rol_admin = Rol(nombre="Administrador")
    rol_estudiante = Rol(nombre="Estudiante")
    rol_docente = Rol(nombre="Docente")
    rol_direccion = Rol(nombre="Direccion")
    db.session.add_all([rol_admin, rol_estudiante, rol_docente, rol_direccion])
    db.session.commit()

    # Facultad y especialidad
    facultad = Facultad(nombre="Facultad de Prueba", codigo="FP")
    db.session.add(facultad)
    db.session.commit()

    especialidad = Especialidad(nombre="Especialidad de Prueba", codigo="EP", id_facultad=facultad.id_facultad)
    db.session.add(especialidad)
    db.session.commit()

    # Estudiantes (sin id_plan)
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

    # Docente
    docente = Docente(
        codigo="D001",
        dni="11223344",
        nombres="Carlos",
        apellidos="Torres",
        correo="carlos.torres@test.com",
        estado="activo",
        id_facultad=facultad.id_facultad,
    )
    db.session.add(docente)
    db.session.commit()

    # Usuarios
    usuario_estudiante = Usuario(
        username="jperez",
        password_hash=generate_password_hash(CONTRASENA_PRUEBA),
        estado="activo",
        id_rol=rol_estudiante.id_rol,
        id_estudiante=estudiante.id_estudiante,
    )
    usuario_estudiante_2 = Usuario(
        username="mlopez",
        password_hash=generate_password_hash(CONTRASENA_PRUEBA),
        estado="activo",
        id_rol=rol_estudiante.id_rol,
        id_estudiante=estudiante_2.id_estudiante,
    )
    usuario_inactivo = Usuario(
        username="inactivo",
        password_hash=generate_password_hash(CONTRASENA_PRUEBA),
        estado="inactivo",
        id_rol=rol_estudiante.id_rol,
    )
    usuario_admin = Usuario(
        username="admin_test",
        password_hash=generate_password_hash(CONTRASENA_PRUEBA),
        estado="activo",
        id_rol=rol_admin.id_rol,
        nombres="Rosa",
        apellidos="Admin",
        correo="admin@test.com",
    )
    usuario_direccion = Usuario(
        username="direccion_test",
        password_hash=generate_password_hash(CONTRASENA_PRUEBA),
        estado="activo",
        id_rol=rol_direccion.id_rol,
        nombres="Victor",
        apellidos="Direccion",
        correo="direccion@test.com",
    )
    usuario_docente = Usuario(
        username="ctorres",
        password_hash=generate_password_hash(CONTRASENA_PRUEBA),
        estado="activo",
        id_rol=rol_docente.id_rol,
        id_docente=docente.id_docente,
    )
    db.session.add_all(
        [
            usuario_estudiante,
            usuario_estudiante_2,
            usuario_inactivo,
            usuario_admin,
            usuario_direccion,
            usuario_docente,
        ]
    )
    db.session.commit()

    # Periodos
    periodo = PeriodoAcademico(
        nombre="2026-I", estado="activo"
    )
    periodo_cerrado = PeriodoAcademico(
        nombre="2025-II", estado="cerrado"
    )
    db.session.add_all([periodo, periodo_cerrado])
    db.session.commit()

    # Curso (vinculado a facultad y especialidad)
    curso = Curso(codigo="C001", nombre="Curso de Prueba", creditos=4, horas_teoria=3, horas_practica=2, id_facultad=facultad.id_facultad)
    curso.especialidades.append(especialidad)
    db.session.add(curso)
    db.session.commit()

    # Seccion vinculada a especialidad, ciclo y periodo
    # capacidad=1 a propósito: permite probar el caso "seccion llena" con solo 2 estudiantes
    seccion = Seccion(
        codigo="A",
        id_especialidad=especialidad.id_especialidad,
        ciclo=1,
        id_periodo=periodo.id_periodo,
        capacidad=1,
        estado="abierta",
    )
    db.session.add(seccion)
    db.session.commit()
