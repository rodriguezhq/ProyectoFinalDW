import io

from app.extensions import db
from app.models import Curso, Docente, Especialidad, Facultad, PeriodoAcademico, PlanCurso, PlanEstudios, Seccion
from tests.conftest import token_para

COURSES_URL = "/api/courses"


def _auth_headers(client, username):
    return {"Authorization": f"Bearer {token_para(client, username)}"}


def _ids(app):
    with app.app_context():
        return {
            "facultad": Facultad.query.filter_by(codigo="FP").first().id_facultad,
            "especialidad": Especialidad.query.filter_by(codigo="EP").first().id_especialidad,
            "curso": Curso.query.filter_by(codigo="C001").first().id_curso,
            "plan": PlanEstudios.query.filter_by(nombre="Plan de Prueba").first().id_plan,
            "plan_curso": PlanCurso.query.first().id_plan_curso,
            "periodo": PeriodoAcademico.query.filter_by(nombre="2026-I").first().id_periodo,
            "seccion": Seccion.query.filter_by(codigo="A").first().id_seccion,
            "docente": Docente.query.filter_by(codigo="D001").first().id_docente,
        }


# ---------------- Facultad ----------------

def test_crear_facultad_exitosa_devuelve_201(client, app):
    resp = client.post(
        f"{COURSES_URL}/facultades",
        json={"nombre": "Facultad Nueva", "codigo": "FN"},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    assert resp.get_json()["codigo"] == "FN"


def test_crear_facultad_codigo_duplicado_devuelve_409(client, app):
    resp = client.post(
        f"{COURSES_URL}/facultades",
        json={"nombre": "Duplicada", "codigo": "FP"},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


def test_crear_facultad_con_rol_no_admin_devuelve_403(client, app):
    resp = client.post(
        f"{COURSES_URL}/facultades",
        json={"nombre": "X", "codigo": "X1"},
        headers=_auth_headers(client, "jperez"),
    )
    assert resp.status_code == 403


def test_listar_facultades_incluye_la_del_seed(client, app):
    resp = client.get(f"{COURSES_URL}/facultades", headers=_auth_headers(client, "jperez"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert any(f["codigo"] == "FP" for f in body["facultades"])


# ---------------- Especialidad ----------------

def test_crear_especialidad_con_facultad_inexistente_devuelve_404(client, app):
    resp = client.post(
        f"{COURSES_URL}/especialidades",
        json={"nombre": "X", "codigo": "X1", "id_facultad": 999999},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 404


def test_crear_especialidad_exitosa(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/especialidades",
        json={"nombre": "Nueva Especialidad", "codigo": "NE", "id_facultad": ids["facultad"]},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201


# ---------------- PlanEstudios ----------------

def test_crear_plan_estudios_exitoso(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/planes-estudio",
        json={
            "nombre": "Plan Nuevo",
            "version": "2",
            "fecha_aprobacion": "2021-01-01",
            "id_especialidad": ids["especialidad"],
        },
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    assert resp.get_json()["estado"] == "vigente"


# ---------------- Curso ----------------

def test_crear_curso_codigo_duplicado_devuelve_409(client, app):
    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={"codigo": "C001", "nombre": "Dup", "creditos": 3},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


# ---------------- PlanCurso ----------------

def test_crear_plan_curso_duplicado_devuelve_409(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/planes-curso",
        json={"id_plan": ids["plan"], "id_curso": ids["curso"], "ciclo": 1},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


# ---------------- Seccion ----------------

def test_crear_seccion_exitosa(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/secciones",
        json={"codigo": "B", "capacidad": 20, "id_plan_curso": ids["plan_curso"], "id_periodo": ids["periodo"]},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    assert resp.get_json()["estado"] == "abierta"


def test_crear_seccion_con_periodo_inexistente_devuelve_404(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/secciones",
        json={"codigo": "C", "id_plan_curso": ids["plan_curso"], "id_periodo": 999999},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 404


def test_actualizar_seccion_asigna_docente(client, app):
    ids = _ids(app)
    resp = client.put(
        f"{COURSES_URL}/secciones/{ids['seccion']}",
        json={"id_docente": ids["docente"]},
        headers=_auth_headers(client, "admin_test"),
    )
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["id_docente"] == ids["docente"]
    assert body["docente_nombre"] == "Carlos Torres"


def test_listar_secciones_filtra_por_periodo(client, app):
    ids = _ids(app)
    resp = client.get(f"{COURSES_URL}/secciones?id_periodo={ids['periodo']}", headers=_auth_headers(client, "jperez"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert len(body["secciones"]) >= 1


# ---------------- Docente ----------------

def test_mis_secciones_devuelve_solo_las_asignadas(client, app):
    ids = _ids(app)
    with app.app_context():
        seccion = db.session.get(Seccion, ids["seccion"])
        seccion.id_docente = ids["docente"]
        db.session.commit()

    resp = client.get(f"{COURSES_URL}/mis-secciones", headers=_auth_headers(client, "ctorres"))
    body = resp.get_json()
    assert resp.status_code == 200
    assert len(body["secciones"]) == 1


def test_mis_secciones_con_rol_no_docente_devuelve_403(client, app):
    resp = client.get(f"{COURSES_URL}/mis-secciones", headers=_auth_headers(client, "admin_test"))
    assert resp.status_code == 403


def test_subir_silabo_exitoso(client, app):
    ids = _ids(app)
    with app.app_context():
        seccion = db.session.get(Seccion, ids["seccion"])
        seccion.id_docente = ids["docente"]
        db.session.commit()

    data = {"archivo": (io.BytesIO(b"contenido silabo"), "silabo.pdf")}
    resp = client.post(
        f"{COURSES_URL}/secciones/{ids['seccion']}/silabo",
        data=data,
        content_type="multipart/form-data",
        headers=_auth_headers(client, "ctorres"),
    )
    body = resp.get_json()
    assert resp.status_code == 201
    assert body["archivo"].endswith(".pdf")


def test_subir_silabo_de_seccion_de_otro_docente_devuelve_403(client, app):
    ids = _ids(app)
    # la seccion del seed NO esta asignada a ctorres en este test
    data = {"archivo": (io.BytesIO(b"x"), "silabo.pdf")}
    resp = client.post(
        f"{COURSES_URL}/secciones/{ids['seccion']}/silabo",
        data=data,
        content_type="multipart/form-data",
        headers=_auth_headers(client, "ctorres"),
    )
    assert resp.status_code == 403


# ---------------- Direccion ----------------

def test_carga_docente_cuenta_secciones_y_horas(client, app):
    ids = _ids(app)
    with app.app_context():
        seccion = db.session.get(Seccion, ids["seccion"])
        seccion.id_docente = ids["docente"]
        db.session.commit()

    resp = client.get(
        f"{COURSES_URL}/carga-docente?id_periodo={ids['periodo']}", headers=_auth_headers(client, "direccion_test")
    )
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["carga"][0]["total_secciones"] == 1
    assert body["carga"][0]["total_horas"] == 5  # 3 teoria + 2 practica del curso del seed


def test_carga_docente_con_rol_no_direccion_devuelve_403(client, app):
    ids = _ids(app)
    resp = client.get(
        f"{COURSES_URL}/carga-docente?id_periodo={ids['periodo']}", headers=_auth_headers(client, "admin_test")
    )
    assert resp.status_code == 403


def test_cumplimiento_plan(client, app):
    ids = _ids(app)
    resp = client.get(
        f"{COURSES_URL}/cumplimiento-plan?id_plan={ids['plan']}&id_periodo={ids['periodo']}",
        headers=_auth_headers(client, "direccion_test"),
    )
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["total_cursos"] == 1
    assert body["cursos_con_seccion"] == 1
    assert body["porcentaje_cumplimiento"] == 100.0
