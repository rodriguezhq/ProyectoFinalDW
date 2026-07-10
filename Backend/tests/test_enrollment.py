from app.extensions import db
from app.models import Estudiante, Matricula, MatriculaDetalle, Nota, PeriodoAcademico, Seccion
from tests.conftest import token_para

ENROLLMENT_URL = "/api/enrollment"


def _auth_headers(client, username):
    return {"Authorization": f"Bearer {token_para(client, username)}"}


def _id_periodo(app):
    with app.app_context():
        return PeriodoAcademico.query.filter_by(nombre="2026-I").first().id_periodo


def _id_seccion(app):
    with app.app_context():
        return Seccion.query.filter_by(codigo="A").first().id_seccion


def _id_periodo_cerrado(app):
    with app.app_context():
        return PeriodoAcademico.query.filter_by(nombre="2025-II").first().id_periodo


# ---------------------------------------------------------------------------
# Solicitar matricula
# ---------------------------------------------------------------------------

def test_solicitar_matricula_exitosa_devuelve_201_y_crea_notas_vacias(client, app):
    headers = _auth_headers(client, "jperez")
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]},
        headers=headers,
    )
    body = resp.get_json()

    assert resp.status_code == 201
    assert body["estado"] == "pendiente"
    assert len(body["detalles"]) == 1
    assert body["detalles"][0]["estado"] == "matriculado"

    with app.app_context():
        detalle = MatriculaDetalle.query.filter_by(id_matricula_detalle=body["detalles"][0]["id_matricula_detalle"]).first()
        assert detalle.nota is not None
        assert detalle.nota.estado == "pendiente"


def test_solicitar_matricula_con_rol_incorrecto_devuelve_403(client, app):
    headers = _auth_headers(client, "admin_test")
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]},
        headers=headers,
    )
    assert resp.status_code == 403


def test_solicitar_matricula_duplicada_mismo_periodo_devuelve_409(client, app):
    headers = _auth_headers(client, "jperez")
    payload = {"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]}

    primera = client.post(ENROLLMENT_URL + "/", json=payload, headers=headers)
    assert primera.status_code == 201

    segunda = client.post(ENROLLMENT_URL + "/", json=payload, headers=headers)
    assert segunda.status_code == 409


def test_solicitar_matricula_seccion_llena_devuelve_409(client, app):
    id_periodo = _id_periodo(app)
    id_seccion = _id_seccion(app)  # capacidad=1

    # jperez toma el unico cupo
    resp1 = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": id_periodo, "secciones": [id_seccion]},
        headers=_auth_headers(client, "jperez"),
    )
    assert resp1.status_code == 201

    # mlopez intenta matricularse en la misma seccion, ya sin cupo
    resp2 = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": id_periodo, "secciones": [id_seccion]},
        headers=_auth_headers(client, "mlopez"),
    )
    assert resp2.status_code == 409


def test_solicitar_matricula_seccion_inexistente_devuelve_404(client, app):
    headers = _auth_headers(client, "jperez")
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [999999]},
        headers=headers,
    )
    assert resp.status_code == 404


def test_solicitar_matricula_periodo_inexistente_devuelve_404(client, app):
    headers = _auth_headers(client, "jperez")
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": 999999, "secciones": [_id_seccion(app)]},
        headers=headers,
    )
    assert resp.status_code == 404


def test_solicitar_matricula_en_periodo_cerrado_devuelve_409(client, app):
    headers = _auth_headers(client, "jperez")
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo_cerrado(app), "secciones": [_id_seccion(app)]},
        headers=headers,
    )
    assert resp.status_code == 409


def test_solicitar_matricula_sin_token_devuelve_401(client, app):
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]},
    )
    assert resp.status_code == 401


def test_mis_matriculas_devuelve_solo_las_propias(client, app):
    headers = _auth_headers(client, "jperez")
    client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]},
        headers=headers,
    )

    resp = client.get(ENROLLMENT_URL + "/mias", headers=headers)
    body = resp.get_json()

    assert resp.status_code == 200
    assert len(body["matriculas"]) == 1
    assert body["matriculas"][0]["estudiante_nombre"] == "Juan Perez"


def test_listar_todas_como_admin_incluye_estudiante_y_todas_las_matriculas(client, app):
    client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]},
        headers=_auth_headers(client, "jperez"),
    )

    resp = client.get(ENROLLMENT_URL + "/", headers=_auth_headers(client, "admin_test"))
    body = resp.get_json()

    assert resp.status_code == 200
    assert len(body["matriculas"]) == 1
    assert body["matriculas"][0]["estudiante_nombre"] == "Juan Perez"


def test_listar_todas_con_rol_no_admin_devuelve_403(client, app):
    resp = client.get(ENROLLMENT_URL + "/", headers=_auth_headers(client, "jperez"))
    assert resp.status_code == 403


def test_listar_todas_filtra_por_estado(client, app):
    id_matricula = _crear_matricula(client, app)
    admin_headers = _auth_headers(client, "admin_test")
    client.post(f"{ENROLLMENT_URL}/{id_matricula}/validar", headers=admin_headers)

    resp_pendientes = client.get(f"{ENROLLMENT_URL}/?estado=pendiente", headers=admin_headers)
    resp_validadas = client.get(f"{ENROLLMENT_URL}/?estado=validada", headers=admin_headers)

    assert len(resp_pendientes.get_json()["matriculas"]) == 0
    assert len(resp_validadas.get_json()["matriculas"]) == 1


# ---------------------------------------------------------------------------
# Validar matricula (Administrador)
# ---------------------------------------------------------------------------

def _crear_matricula(client, app, username="jperez"):
    resp = client.post(
        ENROLLMENT_URL + "/",
        json={"id_periodo": _id_periodo(app), "secciones": [_id_seccion(app)]},
        headers=_auth_headers(client, username),
    )
    return resp.get_json()["id_matricula"]


def test_validar_matricula_cambia_estado_a_validada(client, app):
    id_matricula = _crear_matricula(client, app)
    resp = client.post(
        f"{ENROLLMENT_URL}/{id_matricula}/validar", headers=_auth_headers(client, "admin_test")
    )
    assert resp.status_code == 200
    assert resp.get_json()["estado"] == "validada"


def test_validar_matricula_con_rol_estudiante_devuelve_403(client, app):
    id_matricula = _crear_matricula(client, app)
    resp = client.post(
        f"{ENROLLMENT_URL}/{id_matricula}/validar", headers=_auth_headers(client, "jperez")
    )
    assert resp.status_code == 403


def test_validar_matricula_inexistente_devuelve_404(client, app):
    resp = client.post(f"{ENROLLMENT_URL}/999999/validar", headers=_auth_headers(client, "admin_test"))
    assert resp.status_code == 404


def test_validar_matricula_ya_validada_devuelve_409(client, app):
    id_matricula = _crear_matricula(client, app)
    admin_headers = _auth_headers(client, "admin_test")
    client.post(f"{ENROLLMENT_URL}/{id_matricula}/validar", headers=admin_headers)

    resp = client.post(f"{ENROLLMENT_URL}/{id_matricula}/validar", headers=admin_headers)
    assert resp.status_code == 409


# ---------------------------------------------------------------------------
# Registrar pago (Administrador)
# ---------------------------------------------------------------------------

def test_registrar_pago_sin_validar_antes_devuelve_409(client, app):
    id_matricula = _crear_matricula(client, app)
    resp = client.post(
        f"{ENROLLMENT_URL}/{id_matricula}/pago",
        json={"monto": 100.0, "metodo_pago": "deposito"},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


def test_registrar_pago_exitoso_cambia_estado_a_pagada(client, app):
    id_matricula = _crear_matricula(client, app)
    admin_headers = _auth_headers(client, "admin_test")
    client.post(f"{ENROLLMENT_URL}/{id_matricula}/validar", headers=admin_headers)

    resp = client.post(
        f"{ENROLLMENT_URL}/{id_matricula}/pago",
        json={"monto": 250.5, "metodo_pago": "transferencia", "codigo_operacion": "OP-1"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert resp.get_json()["estado"] == "confirmado"

    with app.app_context():
        matricula = db.session.get(Matricula, id_matricula)
        assert matricula.estado == "pagada"


def test_registrar_pago_con_rol_estudiante_devuelve_403(client, app):
    id_matricula = _crear_matricula(client, app)
    resp = client.post(
        f"{ENROLLMENT_URL}/{id_matricula}/pago",
        json={"monto": 100.0, "metodo_pago": "deposito"},
        headers=_auth_headers(client, "jperez"),
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Ficha (PDF)
# ---------------------------------------------------------------------------

def test_ficha_devuelve_un_pdf_valido(client, app):
    id_matricula = _crear_matricula(client, app)
    resp = client.get(f"{ENROLLMENT_URL}/{id_matricula}/ficha", headers=_auth_headers(client, "jperez"))

    assert resp.status_code == 200
    assert resp.mimetype == "application/pdf"
    assert resp.data[:4] == b"%PDF"


def test_ficha_de_otro_estudiante_devuelve_403(client, app):
    id_matricula = _crear_matricula(client, app, username="jperez")
    resp = client.get(f"{ENROLLMENT_URL}/{id_matricula}/ficha", headers=_auth_headers(client, "mlopez"))
    assert resp.status_code == 403


def test_ficha_admin_si_puede_ver_la_de_cualquier_estudiante(client, app):
    id_matricula = _crear_matricula(client, app, username="jperez")
    resp = client.get(f"{ENROLLMENT_URL}/{id_matricula}/ficha", headers=_auth_headers(client, "admin_test"))
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Estadisticas (Direccion)
# ---------------------------------------------------------------------------

def test_estadisticas_requiere_rol_direccion(client, app):
    id_periodo = _id_periodo(app)
    _crear_matricula(client, app)

    resp_estudiante = client.get(
        f"{ENROLLMENT_URL}/estadisticas/{id_periodo}", headers=_auth_headers(client, "jperez")
    )
    assert resp_estudiante.status_code == 403

    resp_direccion = client.get(
        f"{ENROLLMENT_URL}/estadisticas/{id_periodo}", headers=_auth_headers(client, "direccion_test")
    )
    body = resp_direccion.get_json()
    assert resp_direccion.status_code == 200
    assert body["total_matriculados"] == 1
    assert body["por_estado"]["pendiente"] == 1


