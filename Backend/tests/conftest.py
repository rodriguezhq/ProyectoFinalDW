import pytest
from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models import Especialidad, Estudiante, Facultad, Rol, Usuario

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
    db.session.add_all([rol_admin, rol_estudiante, rol_docente])
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
    db.session.add(estudiante)
    db.session.commit()

    usuario_estudiante = Usuario(
        username="jperez",
        password_hash=generate_password_hash(TEST_PASSWORD),
        estado="activo",
        id_rol=rol_estudiante.id_rol,
        id_estudiante=estudiante.id_estudiante,
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
    db.session.add_all([usuario_estudiante, usuario_inactivo, usuario_admin])
    db.session.commit()
