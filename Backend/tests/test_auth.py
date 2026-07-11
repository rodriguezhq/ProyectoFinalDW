import json

from flask_jwt_extended import create_access_token, decode_token

from app.services.auth_service import hash_password, verify_password
from app.utils.decorators import role_required
from tests.conftest import TEST_PASSWORD

LOGIN_URL = "/api/auth/login"
LOGOUT_URL = "/api/auth/logout"


# ---------------------------------------------------------------------------
# Casos funcionales
# ---------------------------------------------------------------------------

def test_login_estudiante_exitoso_devuelve_200_y_setea_cookies_httponly(client):
    resp = client.post(LOGIN_URL, json={"correo": "juan.perez@test.com", "password": TEST_PASSWORD})
    body = resp.get_json()

    assert resp.status_code == 200
    # los tokens van SOLO en cookies httpOnly, nunca en el body
    assert "access_token" not in body
    assert "refresh_token" not in body
    assert body["user"]["nombres"] == "Juan"
    assert body["user"]["apellidos"] == "Perez"
    assert body["user"]["correo"] == "juan.perez@test.com"
    assert body["user"]["rol"] == "Estudiante"

    access_cookie = client.get_cookie("access_token_cookie")
    refresh_cookie = client.get_cookie("refresh_token_cookie")
    assert access_cookie is not None and access_cookie.http_only
    assert refresh_cookie is not None and refresh_cookie.http_only


def test_login_admin_exitoso_usa_datos_directos_de_usuario(client):
    resp = client.post(LOGIN_URL, json={"correo": "admin@test.com", "password": TEST_PASSWORD})
    body = resp.get_json()

    assert resp.status_code == 200
    assert body["user"]["nombres"] == "Rosa"
    assert body["user"]["rol"] == "Administrador"


def test_login_password_incorrecta_devuelve_401(client):
    resp = client.post(LOGIN_URL, json={"correo": "juan.perez@test.com", "password": "clave-mala"})
    assert resp.status_code == 401
    assert resp.get_json()["msg"] == "Credenciales inválidas"


def test_login_usuario_inexistente_devuelve_401(client):
    resp = client.post(LOGIN_URL, json={"correo": "no_existe@test.com", "password": TEST_PASSWORD})
    assert resp.status_code == 401


def test_login_usuario_inactivo_devuelve_401(client):
    resp = client.post(LOGIN_URL, json={"correo": "inactivo@test.com", "password": TEST_PASSWORD})
    assert resp.status_code == 401


def test_logout_devuelve_200(client):
    resp = client.post(LOGOUT_URL)
    assert resp.status_code == 200
    assert resp.get_json()["msg"] == "Logout exitoso"


# ---------------------------------------------------------------------------
# Validación de entrada (422 - Pydantic)
# ---------------------------------------------------------------------------

def test_login_sin_password_devuelve_422(client):
    resp = client.post(LOGIN_URL, json={"correo": "juan.perez@test.com"})
    assert resp.status_code == 422


def test_login_sin_correo_devuelve_422(client):
    resp = client.post(LOGIN_URL, json={"password": TEST_PASSWORD})
    assert resp.status_code == 422


def test_login_body_vacio_devuelve_422(client):
    resp = client.post(LOGIN_URL, json={})
    assert resp.status_code == 422


def test_login_correo_con_tipo_incorrecto_devuelve_422(client):
    resp = client.post(LOGIN_URL, json={"correo": 12345, "password": TEST_PASSWORD})
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Seguridad
# ---------------------------------------------------------------------------

def test_respuesta_de_login_nunca_expone_el_hash_de_password(client):
    resp = client.post(LOGIN_URL, json={"correo": "juan.perez@test.com", "password": TEST_PASSWORD})
    crudo = resp.get_data(as_text=True)
    assert "password_hash" not in crudo
    assert "scrypt" not in crudo  # prefijo tipico de un hash de werkzeug


def test_login_con_intento_de_sql_injection_no_autentica_ni_rompe(client):
    payload = {"correo": "jperez' OR '1'='1", "password": "' OR '1'='1"}
    resp = client.post(LOGIN_URL, json=payload)
    # SQLAlchemy parametriza la query -> no debe autenticar, y no debe tirar 500
    assert resp.status_code == 401


def test_login_correo_no_distingue_mayusculas(client):
    # el correo institucional se trata como case-insensitive (convencion estandar de email)
    resp = client.post(LOGIN_URL, json={"correo": "JUAN.PEREZ@TEST.COM", "password": TEST_PASSWORD})
    assert resp.status_code == 200


def test_password_hasheado_no_es_texto_plano():
    plano = "MiClaveSecreta1!"
    hasheado = hash_password(plano)
    assert hasheado != plano
    assert verify_password(plano, hasheado) is True
    assert verify_password("clave-equivocada", hasheado) is False


def test_dos_hashes_del_mismo_password_son_distintos_por_el_salt():
    hash1 = hash_password("MismoPassword1!")
    hash2 = hash_password("MismoPassword1!")
    assert hash1 != hash2


def test_jwt_access_token_incluye_claims_de_rol(client, app):
    client.post(LOGIN_URL, json={"correo": "juan.perez@test.com", "password": TEST_PASSWORD})
    token = client.get_cookie("access_token_cookie").value

    with app.app_context():
        claims = decode_token(token)

    assert claims["id_rol"] is not None
    assert claims["rol"] == "Estudiante"
    assert claims["sub"] is not None


def test_access_token_y_refresh_token_tienen_expiraciones_distintas(client, app):
    client.post(LOGIN_URL, json={"correo": "juan.perez@test.com", "password": TEST_PASSWORD})
    access_token = client.get_cookie("access_token_cookie").value
    refresh_token = client.get_cookie("refresh_token_cookie").value

    with app.app_context():
        access_claims = decode_token(access_token)
        refresh_claims = decode_token(refresh_token)

    # el refresh (30 dias) vence mucho despues que el access (8 horas)
    assert refresh_claims["exp"] > access_claims["exp"]
    assert access_claims["type"] == "access"
    assert refresh_claims["type"] == "refresh"


def test_ruta_protegida_rechaza_sin_token(app):
    _registrar_ruta_de_prueba(app)
    client = app.test_client()

    resp = client.get("/test/solo-admin")
    assert resp.status_code == 401


def test_ruta_protegida_rechaza_rol_incorrecto(app):
    _registrar_ruta_de_prueba(app)
    client = app.test_client()

    with app.app_context():
        token = create_access_token(identity="1", additional_claims={"rol": "Estudiante"})

    resp = client.get("/test/solo-admin", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 403


def test_ruta_protegida_permite_rol_correcto(app):
    _registrar_ruta_de_prueba(app)
    client = app.test_client()

    with app.app_context():
        token = create_access_token(identity="1", additional_claims={"rol": "Administrador"})

    resp = client.get("/test/solo-admin", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200


def _registrar_ruta_de_prueba(app):
    """Registra una ruta protegida efimera, solo para probar role_required."""
    if "solo_admin" in app.view_functions:
        return

    @app.route("/test/solo-admin")
    @role_required("Administrador")
    def solo_admin():
        return {"msg": "ok"}, 200
