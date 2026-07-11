from app.models import Estudiante, Rol
from tests.conftest import TEST_PASSWORD, token_para

ADMIN_URL = "/api/admin"


def _login(client, correo, password=TEST_PASSWORD):
    return client.post("/api/auth/login", json={"correo": correo, "password": password})


def _auth_headers(client, username):
    return {"Authorization": f"Bearer {token_para(client, username)}"}


def _id_rol_estudiante(app):
    with app.app_context():
        return Rol.query.filter_by(nombre="Estudiante").first().id_rol


def _id_estudiante_sin_cuenta(app):
    """Crea un estudiante sin cuenta de usuario para ser vinculado en los tests."""
    from app.extensions import db
    from app.models import Especialidad

    with app.app_context():
        especialidad = Especialidad.query.filter_by(codigo="EP").first()
        est = Estudiante(
            codigo="E003", dni="99988877", nombres="Luis", apellidos="Nuevo",
            correo="luis.nuevo@test.com", estado="activo", id_especialidad=especialidad.id_especialidad,
        )
        db.session.add(est)
        db.session.commit()
        return est.id_estudiante


# ---------------- Usuario ----------------

def test_crear_usuario_vinculado_a_estudiante_exitoso(client, app):
    id_rol = _id_rol_estudiante(app)
    id_estudiante = _id_estudiante_sin_cuenta(app)

    resp = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "lnuevo", "id_rol": id_rol, "id_estudiante": id_estudiante},
        headers=_auth_headers(client, "admin_test"),
    )
    body = resp.get_json()
    assert resp.status_code == 201
    assert body["username"] == "lnuevo"
    assert len(body["password_temporal"]) > 0


def test_password_temporal_generada_funciona_para_loguearse(client, app):
    id_rol = _id_rol_estudiante(app)
    id_estudiante = _id_estudiante_sin_cuenta(app)

    creado = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "lnuevo2", "id_rol": id_rol, "id_estudiante": id_estudiante},
        headers=_auth_headers(client, "admin_test"),
    ).get_json()

    resp = client.post(
        "/api/auth/login", json={"correo": "luis.nuevo@test.com", "password": creado["password_temporal"]}
    )
    assert resp.status_code == 200


def test_crear_usuario_username_duplicado_devuelve_409(client, app):
    id_rol = _id_rol_estudiante(app)
    resp = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "jperez", "id_rol": id_rol},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


def test_crear_usuario_rol_inexistente_devuelve_404(client, app):
    resp = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "nuevo_user", "id_rol": 999999},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 404


def test_crear_usuario_estudiante_y_docente_a_la_vez_devuelve_400(client, app):
    id_rol = _id_rol_estudiante(app)
    id_estudiante = _id_estudiante_sin_cuenta(app)
    resp = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "mixto", "id_rol": id_rol, "id_estudiante": id_estudiante, "id_docente": 1},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 400


def test_crear_usuario_estudiante_que_ya_tiene_cuenta_devuelve_409(client, app):
    id_rol = _id_rol_estudiante(app)
    with app.app_context():
        estudiante_con_cuenta = Estudiante.query.filter_by(codigo="E001").first().id_estudiante

    resp = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "otro_user", "id_rol": id_rol, "id_estudiante": estudiante_con_cuenta},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


def test_crear_usuario_con_rol_no_admin_devuelve_403(client, app):
    id_rol = _id_rol_estudiante(app)
    resp = client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "x", "id_rol": id_rol},
        headers=_auth_headers(client, "jperez"),
    )
    assert resp.status_code == 403


def test_listar_usuarios_incluye_los_del_seed(client, app):
    resp = client.get(f"{ADMIN_URL}/usuarios", headers=_auth_headers(client, "admin_test"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert any(u["username"] == "jperez" for u in body["usuarios"])


def test_actualizar_usuario_cambia_estado(client, app):
    with app.app_context():
        from app.models import Usuario

        id_usuario = Usuario.query.filter_by(username="jperez").first().id_usuario

    resp = client.put(
        f"{ADMIN_URL}/usuarios/{id_usuario}",
        json={"estado": "inactivo"},
        headers=_auth_headers(client, "admin_test"),
    )
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["estado"] == "inactivo"


def test_actualizar_usuario_inexistente_devuelve_404(client, app):
    resp = client.put(
        f"{ADMIN_URL}/usuarios/999999", json={"estado": "inactivo"}, headers=_auth_headers(client, "admin_test")
    )
    assert resp.status_code == 404


# ---------------- Rol ----------------

def test_crear_rol_exitoso(client, app):
    resp = client.post(
        f"{ADMIN_URL}/roles",
        json={"nombre": "Bibliotecario", "descripcion": "Gestiona la biblioteca"},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201


def test_crear_rol_duplicado_devuelve_409(client, app):
    resp = client.post(
        f"{ADMIN_URL}/roles",
        json={"nombre": "Estudiante"},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


def test_listar_roles_cualquier_autenticado(client, app):
    resp = client.get(f"{ADMIN_URL}/roles", headers=_auth_headers(client, "jperez"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert any(r["nombre"] == "Estudiante" for r in body["roles"])


# ---------------- Auditoria ----------------

def test_login_exitoso_queda_registrado_en_auditoria(client, app):
    _login(client, "juan.perez@test.com")  # dispara login_exitoso

    resp = client.get(f"{ADMIN_URL}/auditoria?accion=login_exitoso", headers=_auth_headers(client, "direccion_test"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert len(body["auditorias"]) >= 1
    assert body["auditorias"][0]["accion"] == "login_exitoso"


def test_login_fallido_queda_registrado_en_auditoria(client, app):
    client.post("/api/auth/login", json={"correo": "juan.perez@test.com", "password": "clave-mala"})

    resp = client.get(f"{ADMIN_URL}/auditoria?accion=login_fallido", headers=_auth_headers(client, "direccion_test"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert len(body["auditorias"]) >= 1


def test_crear_usuario_queda_registrado_en_auditoria(client, app):
    id_rol = _id_rol_estudiante(app)
    id_estudiante = _id_estudiante_sin_cuenta(app)
    client.post(
        f"{ADMIN_URL}/usuarios",
        json={"username": "auditado", "id_rol": id_rol, "id_estudiante": id_estudiante},
        headers=_auth_headers(client, "admin_test"),
    )

    resp = client.get(f"{ADMIN_URL}/auditoria?accion=crear_usuario", headers=_auth_headers(client, "direccion_test"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert len(body["auditorias"]) == 1


def test_auditoria_con_rol_no_direccion_devuelve_403(client, app):
    resp = client.get(f"{ADMIN_URL}/auditoria", headers=_auth_headers(client, "admin_test"))
    assert resp.status_code == 403
