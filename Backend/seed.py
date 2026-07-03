"""
Seed completo del sistema academico: llena las 18 tablas con datos de
prueba realistas y coherentes entre si (mismos periodos, mismas secciones,
notas ya calculadas, un certificado emitido, etc.)

Uso:
    python seed.py
"""

from datetime import date, datetime

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
    Matricula,
    MatriculaDetalle,
    Nota,
    Pago,
    PeriodoAcademico,
    PlanCurso,
    PlanEstudios,
    Rol,
    Seccion,
    Silabo,
    Usuario,
)

DEMO_PASSWORD = "Password123!"


def clear_data():
    """Borra todo en el orden correcto (hijos antes que padres)."""
    print("Limpiando datos existentes...")
    Nota.query.delete()
    Silabo.query.delete()
    Auditoria.query.delete()
    Pago.query.delete()
    Documento.query.delete()
    MatriculaDetalle.query.delete()
    Matricula.query.delete()
    Seccion.query.delete()
    Usuario.query.delete()
    db.session.execute(Facultad.__table__.update().values(id_decano=None))
    db.session.commit()
    Estudiante.query.delete()
    Docente.query.delete()
    PlanCurso.query.delete()
    PlanEstudios.query.delete()
    Especialidad.query.delete()
    Facultad.query.delete()
    Curso.query.delete()
    PeriodoAcademico.query.delete()
    Rol.query.delete()
    db.session.commit()


def seed():
    # ---------- Roles ----------
    print("Creando roles...")
    rol_admin = Rol(nombre="Administrador", descripcion="Gestiona matriculas, pagos y usuarios")
    rol_docente = Rol(nombre="Docente", descripcion="Registra notas y silabos")
    rol_estudiante = Rol(nombre="Estudiante", descripcion="Consulta notas, record y certificados")
    rol_direccion = Rol(nombre="Direccion", descripcion="Supervisa y autoriza a nivel institucional")
    db.session.add_all([rol_admin, rol_docente, rol_estudiante, rol_direccion])
    db.session.commit()

    # ---------- Cursos (catalogo) ----------
    print("Creando cursos...")
    curso_ed = Curso(codigo="ED101", nombre="Estructura de Datos", creditos=4, horas_teoria=3, horas_practica=2)
    curso_bd = Curso(codigo="BD201", nombre="Base de Datos II", creditos=4, horas_teoria=3, horas_practica=2)
    curso_daw = Curso(codigo="DAW301", nombre="Desarrollo de Aplicaciones Web", creditos=5, horas_teoria=3, horas_practica=4)
    curso_isw = Curso(codigo="ISW301", nombre="Ingenieria de Software", creditos=4, horas_teoria=3, horas_practica=2)
    curso_ms = Curso(codigo="MSU101", nombre="Mecanica de Suelos", creditos=4, horas_teoria=3, horas_practica=2)
    curso_ca = Curso(codigo="CAR201", nombre="Concreto Armado", creditos=4, horas_teoria=3, horas_practica=2)
    db.session.add_all([curso_ed, curso_bd, curso_daw, curso_isw, curso_ms, curso_ca])
    db.session.commit()

    # ---------- Periodos academicos ----------
    print("Creando periodos academicos...")
    periodo_pasado = PeriodoAcademico(
        nombre="2025-II", fecha_inicio=date(2025, 8, 1), fecha_fin=date(2025, 12, 20), estado="cerrado"
    )
    periodo_actual = PeriodoAcademico(
        nombre="2026-I", fecha_inicio=date(2026, 3, 1), fecha_fin=date(2026, 7, 18), estado="activo"
    )
    db.session.add_all([periodo_pasado, periodo_actual])
    db.session.commit()

    # ---------- Facultades (sin decano todavia, por el ciclo FK) ----------
    print("Creando facultades...")
    facultad_fis = Facultad(nombre="Facultad de Ingenieria de Sistemas", codigo="FIS")
    facultad_fic = Facultad(nombre="Facultad de Ingenieria Civil", codigo="FIC")
    db.session.add_all([facultad_fis, facultad_fic])
    db.session.commit()

    # ---------- Docentes ----------
    print("Creando docentes...")
    docente_jaime = Docente(
        codigo="D001", dni="20123456", nombres="Jaime", apellidos="Suasnabar Terrel",
        correo="jsuasnabar@uncp.edu.pe", telefono="964111222", categoria="Principal",
        condicion="Nombrado", estado="activo", id_facultad=facultad_fis.id_facultad,
    )
    docente_carlos = Docente(
        codigo="D002", dni="20234567", nombres="Carlos", apellidos="Espinoza Montes",
        correo="cespinoza@uncp.edu.pe", telefono="964222333", categoria="Principal",
        condicion="Nombrado", estado="activo", id_facultad=facultad_fic.id_facultad,
    )
    docente_ana = Docente(
        codigo="D003", dni="20345678", nombres="Ana", apellidos="Torres Quispe",
        correo="atorres@uncp.edu.pe", telefono="964333444", categoria="Asociado",
        condicion="Contratado", estado="activo", id_facultad=facultad_fis.id_facultad,
    )
    docente_luis = Docente(
        codigo="D004", dni="20456789", nombres="Luis", apellidos="Ramirez Palomino",
        correo="lramirez@uncp.edu.pe", telefono="964444555", categoria="Auxiliar",
        condicion="Contratado", estado="activo", id_facultad=facultad_fis.id_facultad,
    )
    db.session.add_all([docente_jaime, docente_carlos, docente_ana, docente_luis])
    db.session.commit()

    # ---------- Asignar decanos (rompe el ciclo Facultad<->Docente) ----------
    facultad_fis.id_decano = docente_jaime.id_docente
    facultad_fic.id_decano = docente_carlos.id_docente
    db.session.commit()

    # ---------- Especialidades ----------
    print("Creando especialidades...")
    esp_is = Especialidad(nombre="Ingenieria de Sistemas", codigo="IS", id_facultad=facultad_fis.id_facultad)
    esp_ic = Especialidad(nombre="Ingenieria Civil", codigo="IC", id_facultad=facultad_fic.id_facultad)
    db.session.add_all([esp_is, esp_ic])
    db.session.commit()

    # ---------- Planes de estudio ----------
    print("Creando planes de estudio...")
    plan_is = PlanEstudios(
        nombre="Plan Curricular Ingenieria de Sistemas", version="2020",
        fecha_aprobacion=date(2020, 1, 15), estado="vigente", id_especialidad=esp_is.id_especialidad,
    )
    plan_ic = PlanEstudios(
        nombre="Plan Curricular Ingenieria Civil", version="2019",
        fecha_aprobacion=date(2019, 12, 10), estado="vigente", id_especialidad=esp_ic.id_especialidad,
    )
    db.session.add_all([plan_is, plan_ic])
    db.session.commit()

    # ---------- Plan_Curso (curso + ciclo dentro de cada plan) ----------
    print("Creando plan_curso...")
    pc_ed = PlanCurso(id_plan=plan_is.id_plan, id_curso=curso_ed.id_curso, ciclo=3)
    pc_bd = PlanCurso(id_plan=plan_is.id_plan, id_curso=curso_bd.id_curso, ciclo=5)
    pc_daw = PlanCurso(id_plan=plan_is.id_plan, id_curso=curso_daw.id_curso, ciclo=9)
    pc_isw = PlanCurso(id_plan=plan_is.id_plan, id_curso=curso_isw.id_curso, ciclo=7)
    pc_ms = PlanCurso(id_plan=plan_ic.id_plan, id_curso=curso_ms.id_curso, ciclo=4)
    pc_ca = PlanCurso(id_plan=plan_ic.id_plan, id_curso=curso_ca.id_curso, ciclo=6)
    db.session.add_all([pc_ed, pc_bd, pc_daw, pc_isw, pc_ms, pc_ca])
    db.session.commit()

    # ---------- Estudiantes ----------
    print("Creando estudiantes...")
    est_cristhian = Estudiante(
        codigo="2021100001", dni="70111222", nombres="Cristhian", apellidos="Martinez",
        correo="cristhian.martinez@uncp.edu.pe", telefono="987111222",
        fecha_nacimiento=date(2003, 5, 12), estado="activo", id_especialidad=esp_is.id_especialidad,
    )
    est_scoot = Estudiante(
        codigo="2021100002", dni="70222333", nombres="Scoot", apellidos="Fernandez",
        correo="scoot.fernandez@uncp.edu.pe", telefono="987222333",
        fecha_nacimiento=date(2003, 8, 20), estado="activo", id_especialidad=esp_is.id_especialidad,
    )
    est_maria = Estudiante(
        codigo="2021100003", dni="70333444", nombres="Maria", apellidos="Huaman Rojas",
        correo="maria.huaman@uncp.edu.pe", telefono="987333444",
        fecha_nacimiento=date(2002, 3, 3), estado="activo", id_especialidad=esp_is.id_especialidad,
    )
    est_pedro = Estudiante(
        codigo="2020100015", dni="70444555", nombres="Pedro", apellidos="Salazar Lima",
        correo="pedro.salazar@uncp.edu.pe", telefono="987444555",
        fecha_nacimiento=date(2001, 11, 27), estado="activo", id_especialidad=esp_ic.id_especialidad,
    )
    db.session.add_all([est_cristhian, est_scoot, est_maria, est_pedro])
    db.session.commit()

    # ---------- Secciones ----------
    print("Creando secciones...")
    # Periodo pasado (2025-II): donde ya se cursaron y calificaron cursos
    sec_ed_pasado = Seccion(
        codigo="A", horario="Lun/Mie 08:00-10:00", aula="B-201", capacidad=30, estado="cerrada",
        id_plan_curso=pc_ed.id_plan_curso, id_docente=docente_ana.id_docente, id_periodo=periodo_pasado.id_periodo,
    )
    sec_bd_pasado = Seccion(
        codigo="A", horario="Mar/Jue 10:00-12:00", aula="B-105", capacidad=30, estado="cerrada",
        id_plan_curso=pc_bd.id_plan_curso, id_docente=docente_luis.id_docente, id_periodo=periodo_pasado.id_periodo,
    )
    # Periodo actual (2026-I): en curso
    sec_daw_actual = Seccion(
        codigo="A", horario="Lun/Mie 14:00-18:00", aula="Lab-03", capacidad=25, estado="abierta",
        id_plan_curso=pc_daw.id_plan_curso, id_docente=docente_ana.id_docente, id_periodo=periodo_actual.id_periodo,
    )
    sec_isw_actual = Seccion(
        codigo="A", horario="Vie 08:00-12:00", aula="C-302", capacidad=30, estado="abierta",
        id_plan_curso=pc_isw.id_plan_curso, id_docente=docente_luis.id_docente, id_periodo=periodo_actual.id_periodo,
    )
    sec_ms_actual = Seccion(
        codigo="A", horario="Mar/Jue 08:00-10:00", aula="A-101", capacidad=35, estado="abierta",
        id_plan_curso=pc_ms.id_plan_curso, id_docente=docente_carlos.id_docente, id_periodo=periodo_actual.id_periodo,
    )
    db.session.add_all([sec_ed_pasado, sec_bd_pasado, sec_daw_actual, sec_isw_actual, sec_ms_actual])
    db.session.commit()

    # ---------- Usuarios (login) ----------
    print("Creando usuarios...")
    pw = generate_password_hash(DEMO_PASSWORD)
    usuarios = [
        Usuario(username="admin", password_hash=pw, estado="activo", id_rol=rol_admin.id_rol,
                nombres="Rosa", apellidos="Cardenas Vila", correo="admin@uncp.edu.pe"),
        Usuario(username="direccion", password_hash=pw, estado="activo", id_rol=rol_direccion.id_rol,
                nombres="Victor", apellidos="Quinto Aguirre", correo="direccion@uncp.edu.pe"),
        Usuario(username="jsuasnabar", password_hash=pw, estado="activo", id_rol=rol_docente.id_rol,
                id_docente=docente_jaime.id_docente),
        Usuario(username="atorres", password_hash=pw, estado="activo", id_rol=rol_docente.id_rol,
                id_docente=docente_ana.id_docente),
        Usuario(username="lramirez", password_hash=pw, estado="activo", id_rol=rol_docente.id_rol,
                id_docente=docente_luis.id_docente),
        Usuario(username="cespinoza", password_hash=pw, estado="activo", id_rol=rol_docente.id_rol,
                id_docente=docente_carlos.id_docente),
        Usuario(username="cmartinez", password_hash=pw, estado="activo", id_rol=rol_estudiante.id_rol,
                id_estudiante=est_cristhian.id_estudiante),
        Usuario(username="sfernandez", password_hash=pw, estado="activo", id_rol=rol_estudiante.id_rol,
                id_estudiante=est_scoot.id_estudiante),
        Usuario(username="mhuaman", password_hash=pw, estado="activo", id_rol=rol_estudiante.id_rol,
                id_estudiante=est_maria.id_estudiante),
        Usuario(username="psalazar", password_hash=pw, estado="activo", id_rol=rol_estudiante.id_rol,
                id_estudiante=est_pedro.id_estudiante),
    ]
    db.session.add_all(usuarios)
    db.session.commit()
    usuario_admin, usuario_direccion = usuarios[0], usuarios[1]

    # ---------- Matriculas (cabecera) ----------
    print("Creando matriculas...")
    mat_cristhian_pasado = Matricula(
        id_estudiante=est_cristhian.id_estudiante, id_periodo=periodo_pasado.id_periodo,
        fecha_matricula=datetime(2025, 7, 20, 9, 0), estado="pagada",
    )
    mat_cristhian_actual = Matricula(
        id_estudiante=est_cristhian.id_estudiante, id_periodo=periodo_actual.id_periodo,
        fecha_matricula=datetime(2026, 2, 20, 9, 0), estado="pagada",
    )
    mat_scoot_actual = Matricula(
        id_estudiante=est_scoot.id_estudiante, id_periodo=periodo_actual.id_periodo,
        fecha_matricula=datetime(2026, 2, 21, 10, 0), estado="pagada",
    )
    mat_maria_actual = Matricula(
        id_estudiante=est_maria.id_estudiante, id_periodo=periodo_actual.id_periodo,
        fecha_matricula=datetime(2026, 2, 22, 11, 0), estado="validada",
    )
    mat_pedro_actual = Matricula(
        id_estudiante=est_pedro.id_estudiante, id_periodo=periodo_actual.id_periodo,
        fecha_matricula=datetime(2026, 2, 23, 12, 0), estado="pendiente",
    )
    db.session.add_all([mat_cristhian_pasado, mat_cristhian_actual, mat_scoot_actual, mat_maria_actual, mat_pedro_actual])
    db.session.commit()

    # ---------- Matricula_Detalle ----------
    print("Creando matricula_detalle...")
    det_cristhian_ed = MatriculaDetalle(id_matricula=mat_cristhian_pasado.id_matricula, id_seccion=sec_ed_pasado.id_seccion, estado="matriculado")
    det_cristhian_bd = MatriculaDetalle(id_matricula=mat_cristhian_pasado.id_matricula, id_seccion=sec_bd_pasado.id_seccion, estado="matriculado")
    det_cristhian_daw = MatriculaDetalle(id_matricula=mat_cristhian_actual.id_matricula, id_seccion=sec_daw_actual.id_seccion, estado="matriculado")
    det_cristhian_isw = MatriculaDetalle(id_matricula=mat_cristhian_actual.id_matricula, id_seccion=sec_isw_actual.id_seccion, estado="matriculado")
    det_scoot_daw = MatriculaDetalle(id_matricula=mat_scoot_actual.id_matricula, id_seccion=sec_daw_actual.id_seccion, estado="matriculado")
    det_maria_isw = MatriculaDetalle(id_matricula=mat_maria_actual.id_matricula, id_seccion=sec_isw_actual.id_seccion, estado="matriculado")
    det_pedro_ms = MatriculaDetalle(id_matricula=mat_pedro_actual.id_matricula, id_seccion=sec_ms_actual.id_seccion, estado="matriculado")
    db.session.add_all([
        det_cristhian_ed, det_cristhian_bd, det_cristhian_daw, det_cristhian_isw,
        det_scoot_daw, det_maria_isw, det_pedro_ms,
    ])
    db.session.commit()

    # ---------- Pagos (uno por matricula-cabecera) ----------
    print("Creando pagos...")
    db.session.add_all([
        Pago(fecha_pago=datetime(2025, 7, 20, 9, 30), monto=450.00, metodo_pago="transferencia",
             codigo_operacion="OP-20250720-01", estado="confirmado", id_matricula=mat_cristhian_pasado.id_matricula),
        Pago(fecha_pago=datetime(2026, 2, 20, 9, 30), monto=520.00, metodo_pago="transferencia",
             codigo_operacion="OP-20260220-01", estado="confirmado", id_matricula=mat_cristhian_actual.id_matricula),
        Pago(fecha_pago=datetime(2026, 2, 21, 10, 30), monto=350.00, metodo_pago="tarjeta",
             codigo_operacion="OP-20260221-01", estado="confirmado", id_matricula=mat_scoot_actual.id_matricula),
        Pago(fecha_pago=datetime(2026, 2, 22, 11, 30), monto=280.00, metodo_pago="deposito",
             codigo_operacion="OP-20260222-01", estado="pendiente", id_matricula=mat_maria_actual.id_matricula),
    ])
    db.session.commit()

    # ---------- Notas ----------
    print("Creando notas...")
    db.session.add_all([
        # Periodo cerrado: notas completas y consolidadas
        Nota(parcial1=15, parcial2=16, final=17, sustitutorio=None, promedio=16.00,
             estado="consolidada", id_matricula_detalle=det_cristhian_ed.id_matricula_detalle),
        Nota(parcial1=12, parcial2=10, final=11, sustitutorio=13, promedio=13.00,
             estado="consolidada", id_matricula_detalle=det_cristhian_bd.id_matricula_detalle),
        # Periodo activo: solo parcial1 registrado, curso en curso
        Nota(parcial1=14, parcial2=None, final=None, sustitutorio=None, promedio=None,
             estado="registrada", id_matricula_detalle=det_cristhian_daw.id_matricula_detalle),
        Nota(parcial1=16, parcial2=None, final=None, sustitutorio=None, promedio=None,
             estado="registrada", id_matricula_detalle=det_cristhian_isw.id_matricula_detalle),
        Nota(parcial1=13, parcial2=None, final=None, sustitutorio=None, promedio=None,
             estado="registrada", id_matricula_detalle=det_scoot_daw.id_matricula_detalle),
        Nota(parcial1=None, parcial2=None, final=None, sustitutorio=None, promedio=None,
             estado="pendiente", id_matricula_detalle=det_maria_isw.id_matricula_detalle),
        Nota(parcial1=None, parcial2=None, final=None, sustitutorio=None, promedio=None,
             estado="pendiente", id_matricula_detalle=det_pedro_ms.id_matricula_detalle),
    ])
    db.session.commit()

    # ---------- Silabos ----------
    print("Creando silabos...")
    db.session.add_all([
        Silabo(archivo="/silabos/daw301_2026-1.pdf", fecha_subida=datetime(2026, 2, 15, 9, 0),
               estado="aprobado", id_seccion=sec_daw_actual.id_seccion),
        Silabo(archivo="/silabos/isw301_2026-1.pdf", fecha_subida=datetime(2026, 2, 16, 9, 0),
               estado="aprobado", id_seccion=sec_isw_actual.id_seccion),
        Silabo(archivo="/silabos/msu101_2026-1.pdf", fecha_subida=datetime(2026, 2, 17, 9, 0),
               estado="pendiente", id_seccion=sec_ms_actual.id_seccion),
    ])
    db.session.commit()

    # ---------- Documentos (certificados/constancias) ----------
    print("Creando documentos...")
    db.session.add_all([
        Documento(
            tipo_documento="constancia_matricula", fecha_solicitud=datetime(2026, 3, 1, 10, 0),
            fecha_emision=datetime(2026, 3, 2, 15, 0), estado="emitido",
            archivo="/documentos/constancia_2021100001.pdf", codigo_qr="QR-CM-2021100001-2026I",
            id_estudiante=est_cristhian.id_estudiante,
            id_usuario_emite=usuario_admin.id_usuario, id_usuario_autoriza=usuario_direccion.id_usuario,
        ),
        Documento(
            tipo_documento="certificado_notas", fecha_solicitud=datetime(2026, 6, 20, 9, 0),
            fecha_emision=None, estado="solicitado",
            archivo=None, codigo_qr=None,
            id_estudiante=est_scoot.id_estudiante,
            id_usuario_emite=None, id_usuario_autoriza=None,
        ),
    ])
    db.session.commit()

    # ---------- Auditoria ----------
    print("Creando auditoria...")
    db.session.add_all([
        Auditoria(accion="login", tabla="usuario", registro=str(usuario_admin.id_usuario),
                   fecha=datetime(2026, 3, 1, 8, 55), ip="192.168.1.10", id_usuario=usuario_admin.id_usuario),
        Auditoria(accion="validar_matricula", tabla="matricula", registro=str(mat_maria_actual.id_matricula),
                   fecha=datetime(2026, 2, 22, 12, 0), ip="192.168.1.10", id_usuario=usuario_admin.id_usuario),
        Auditoria(accion="emitir_documento", tabla="documento", registro="1",
                   fecha=datetime(2026, 3, 2, 15, 0), ip="192.168.1.10", id_usuario=usuario_admin.id_usuario),
        Auditoria(accion="autorizar_documento", tabla="documento", registro="1",
                   fecha=datetime(2026, 3, 2, 14, 30), ip="192.168.1.15", id_usuario=usuario_direccion.id_usuario),
    ])
    db.session.commit()

    print("\nSeed completo.")
    print(f"Password para todos los usuarios de prueba: {DEMO_PASSWORD}")
    print("Usuarios: admin, direccion, jsuasnabar, atorres, lramirez, cespinoza, cmartinez, sfernandez, mhuaman, psalazar")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        clear_data()
        seed()
