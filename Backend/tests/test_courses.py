import io

from app.extensions import db
from app.models import Curso, Docente, Especialidad, Facultad, PeriodoAcademico, Seccion
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


# ---------------- Curso ----------------

def test_crear_curso_codigo_duplicado_devuelve_409(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={"codigo": "C001", "nombre": "Dup", "creditos": 3, "id_facultad": ids["facultad"]},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 409


def test_crear_curso_exitoso(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={"codigo": "C002", "nombre": "Nuevo Curso", "creditos": 4, "ciclo": 2, "id_facultad": ids["facultad"]},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["codigo"] == "C002"
    assert body["ciclo"] == 2
    assert body["id_facultad"] == ids["facultad"]


def test_crear_curso_con_prerrequisitos_exitoso(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={
            "codigo": "C003",
            "nombre": "Curso Avanzado",
            "creditos": 4,
            "ciclo": 3,
            "id_facultad": ids["facultad"],
            "id_prerrequisitos": [ids["curso"]]
        },
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["codigo"] == "C003"
    assert body["ciclo"] == 3
    assert ids["curso"] in body["id_prerrequisitos"]


def test_crear_curso_con_prerrequisito_de_otra_facultad_devuelve_400(client, app):
    from app.models import Facultad
    ids = _ids(app)
    with app.app_context():
        # Crear otra facultad y un curso asociado a ella
        fac_ot = Facultad(nombre="Facultad Alterna", codigo="FALT")
        db.session.add(fac_ot)
        db.session.commit()
        curso_ot = Curso(codigo="C_ALT", nombre="Curso de Otra Facultad", creditos=4, id_facultad=fac_ot.id_facultad)
        db.session.add(curso_ot)
        db.session.commit()
        id_curso_ot = curso_ot.id_curso

    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={
            "codigo": "C004",
            "nombre": "Invalido por Prerrequisito",
            "creditos": 4,
            "ciclo": 2,
            "id_facultad": ids["facultad"],
            "id_prerrequisitos": [id_curso_ot]
        },
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 400
    assert "prerrequisitos deben pertenecer a la misma facultad" in resp.get_json()["msg"]


def test_crear_curso_con_carreras_exitoso(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={
            "codigo": "C010",
            "nombre": "Curso de Sistemas",
            "creditos": 3,
            "ciclo": 1,
            "id_facultad": ids["facultad"],
            "id_especialidades": [ids["especialidad"]]
        },
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert ids["especialidad"] in body["id_especialidades"]


def test_crear_curso_con_carrera_de_otra_facultad_devuelve_400(client, app):
    from app.models import Especialidad, Facultad
    ids = _ids(app)
    with app.app_context():
        # Crear otra facultad y una especialidad asociada a ella
        fac_ot = Facultad(nombre="Facultad Alterna 2", codigo="FALT2")
        db.session.add(fac_ot)
        db.session.commit()
        esp_ot = Especialidad(nombre="Carrera Alterna 2", codigo="CALT2", id_facultad=fac_ot.id_facultad)
        db.session.add(esp_ot)
        db.session.commit()
        id_esp_ot = esp_ot.id_especialidad

    resp = client.post(
        f"{COURSES_URL}/cursos",
        json={
            "codigo": "C011",
            "nombre": "Invalido por Carrera",
            "creditos": 3,
            "ciclo": 1,
            "id_facultad": ids["facultad"],
            "id_especialidades": [id_esp_ot]
        },
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 400
    assert "carreras/especialidades asignadas deben pertenecer a la misma facultad" in resp.get_json()["msg"]


# ---------------- Seccion ----------------

def test_crear_seccion_exitosa(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/secciones",
        json={"codigo": "B", "id_especialidad": ids["especialidad"], "ciclo": 1, "id_periodo": ids["periodo"]},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["codigo"] == "B"
    assert body["id_especialidad"] == ids["especialidad"]
    assert body["ciclo"] == 1
    assert body["id_periodo"] == ids["periodo"]


def test_crear_seccion_con_periodo_inexistente_devuelve_404(client, app):
    ids = _ids(app)
    resp = client.post(
        f"{COURSES_URL}/secciones",
        json={"codigo": "C", "id_especialidad": ids["especialidad"], "ciclo": 1, "id_periodo": 999999},
        headers=_auth_headers(client, "admin_test"),
    )
    assert resp.status_code == 404


def test_actualizar_seccion_exitosa(client, app):
    ids = _ids(app)
    resp = client.put(
        f"{COURSES_URL}/secciones/{ids['seccion']}",
        json={"codigo": "A-Mod", "id_especialidad": ids["especialidad"], "ciclo": 2, "id_periodo": ids["periodo"]},
        headers=_auth_headers(client, "admin_test"),
    )
    body = resp.get_json()
    assert resp.status_code == 200
    assert body["codigo"] == "A-Mod"
    assert body["ciclo"] == 2


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
        from app.models.horario import Horario
        horario = Horario(
            id_periodo=ids["periodo"],
            id_facultad=ids["facultad"],
            id_especialidad=ids["especialidad"],
            ciclo=1,
            detalles=[
                {
                    "id_curso": ids["curso"],
                    "id_docente": ids["docente"],
                    "codigo": "A",
                    "dia": "LUNES",
                    "horaInicio": "08:00",
                    "horaFin": "10:00",
                    "curso_nombre": "Curso de Prueba"
                }
            ]
        )
        db.session.add(horario)
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
        from app.models.horario import Horario
        horario = Horario(
            id_periodo=ids["periodo"],
            id_facultad=ids["facultad"],
            id_especialidad=ids["especialidad"],
            ciclo=1,
            detalles=[
                {
                    "id_curso": ids["curso"],
                    "id_docente": ids["docente"],
                    "codigo": "A",
                    "dia": "LUNES",
                    "horaInicio": "08:00",
                    "horaFin": "10:00",
                    "curso_nombre": "Curso de Prueba"
                }
            ]
        )
        db.session.add(horario)
        db.session.commit()

    data = {"archivo": (io.BytesIO(b"contenido silabo"), "silabo.pdf")}
    resp = client.post(
        f"{COURSES_URL}/cursos/{ids['curso']}/silabo",
        data=data,
        content_type="multipart/form-data",
        headers=_auth_headers(client, "ctorres"),
    )
    body = resp.get_json()
    assert resp.status_code == 201
    assert body["archivo"].endswith(".pdf")


def test_subir_silabo_de_seccion_de_otro_docente_devuelve_403(client, app):
    ids = _ids(app)
    # No hay horario asignado a ctorres para este curso en este test
    data = {"archivo": (io.BytesIO(b"x"), "silabo.pdf")}
    resp = client.post(
        f"{COURSES_URL}/cursos/{ids['curso']}/silabo",
        data=data,
        content_type="multipart/form-data",
        headers=_auth_headers(client, "ctorres"),
    )
    assert resp.status_code == 403


# ---------------- Direccion ----------------

def test_carga_docente_cuenta_secciones_y_horas(client, app):
    ids = _ids(app)
    with app.app_context():
        from app.models.horario import Horario
        horario = Horario(
            id_periodo=ids["periodo"],
            id_facultad=ids["facultad"],
            id_especialidad=ids["especialidad"],
            ciclo=1,
            detalles=[
                {
                    "id_curso": ids["curso"],
                    "id_docente": ids["docente"],
                    "codigo": "A",
                    "dia": "LUNES",
                    "horaInicio": "08:00",
                    "horaFin": "10:00",
                    "curso_nombre": "Curso de Prueba"
                }
            ]
        )
        db.session.add(horario)
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
