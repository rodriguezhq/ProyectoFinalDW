# Arquitectura Backend — Sistema Académico

Documento técnico: estructura de carpetas, modelo de datos y contrato de API.
Para el reparto de trabajo entre el equipo, ver [`BACKLOG.md`](./BACKLOG.md).

## 1. Estructura de carpetas

```
Backend/
├── run.py                  # Entry point: arranca la app Flask
├── requirements.txt        # Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, PyMySQL, Flask-CORS, marshmallow
└── app/
    ├── __init__.py         # App factory: crea Flask app, inicializa extensions, registra blueprints
    ├── config.py           # Config (DB URI MySQL, JWT secret, etc.) por entorno (dev/prod)
    ├── extensions.py       # Instancias compartidas: db = SQLAlchemy(), migrate = Migrate(), jwt = JWTManager()
    │
    ├── models/             # SQLAlchemy ORM: 1 clase = 1 tabla. Solo define columnas y relationships.
    ├── schemas/             # Marshmallow: serialización/validación de entrada-salida de la API.
    ├── services/            # Lógica de negocio (queries, validaciones, reglas). No conoce HTTP.
    ├── Controllers/          # Reciben el request ya parseado, llaman al service, devuelven respuesta.
    ├── routes/               # Blueprints: definen URL + método HTTP → controller. Sin lógica.
    └── utils/
        ├── decorators.py    # @jwt_required, @role_required("ADMIN", "DIRECCION"), etc.
        └── helpers.py       # Funciones puras reutilizables (formateo, generación de códigos QR, etc.)
```

Flujo de una request: `routes/*.py` → `Controllers/*.py` → `services/*.py` → `models/*.py` (db) → `schemas/*.py` (serializa respuesta).

## 2. Modelo de datos (18 tablas)

**Facultad** — `id_facultad PK, nombre, codigo, id_decano FK→Docente (null)`
**Especialidad** — `id_especialidad PK, nombre, codigo, id_facultad FK`
**Plan_Estudios** — `id_plan PK, nombre, version, fecha_aprobacion, estado, id_especialidad FK`
**Curso** — `id_curso PK, codigo, nombre, creditos, horas_teoria, horas_practica`
**Plan_Curso** — `id_plan_curso PK, id_plan FK, id_curso FK, ciclo`
**Periodo_Academico** — `id_periodo PK, nombre, fecha_inicio, fecha_fin, estado`
**Docente** — `id_docente PK, codigo, dni, nombres, apellidos, correo, telefono, categoria, condicion, estado, id_facultad FK`
**Estudiante** — `id_estudiante PK, codigo, dni, nombres, apellidos, correo, telefono, fecha_nacimiento, estado, id_especialidad FK`
**Seccion** — `id_seccion PK, codigo, horario, aula, capacidad, estado, id_plan_curso FK, id_docente FK, id_periodo FK`
**Rol** — `id_rol PK, nombre, descripcion`
**Usuario** — `id_usuario PK, username, password_hash, estado, id_rol FK, id_estudiante FK (null), id_docente FK (null), nombres (null), apellidos (null), correo (null)`
**Matricula** (cabecera) — `id_matricula PK, id_estudiante FK, id_periodo FK, fecha_matricula, estado`
**Matricula_Detalle** — `id_matricula_detalle PK, id_matricula FK, id_seccion FK, estado`
**Notas** — `id_nota PK, parcial1, parcial2, final, sustitutorio, promedio, estado, id_matricula_detalle FK`
**Pago** — `id_pago PK, fecha_pago, monto, metodo_pago, codigo_operacion, estado, id_matricula FK`
**Silabo** — `id_silabo PK, archivo, fecha_subida, estado, id_seccion FK`
**Documento** — `id_documento PK, tipo_documento, fecha_solicitud, fecha_emision, estado, archivo, codigo_qr, id_estudiante FK, id_usuario_emite FK→Usuario (null), id_usuario_autoriza FK→Usuario (null)`
**Auditoria** — `id_auditoria PK, accion, tabla, registro, fecha, ip, id_usuario FK`

### Relaciones

```
Facultad ──┬── Especialidad ──┬── Estudiante ──┬── Usuario
           │                  │                ├── Matricula ──┬── Pago
           │                  │                │                └── Matricula_Detalle ── Notas
           │                  │                └── Documento (emite/autoriza → Usuario)
           │                  └── Plan_Estudios ── Plan_Curso ── Curso
           │
           └── Docente ──┬── Usuario
                          ├── Facultad.id_decano (reverso)
                          └── Seccion ──┬── Periodo_Academico
                                        ├── Plan_Curso
                                        ├── Silabo
                                        └── Matricula_Detalle

Rol ── Usuario ── Auditoria
```

El récord académico **no tiene tabla propia** — se calcula en `record_service.py` agregando `Nota` + `Matricula_Detalle` + `Matricula` del estudiante. Solo `Documento` guarda el registro de cuándo se solicitó/emitió como PDF.

## 3. Mapeo tabla → archivo de modelo

| Archivo `models/` | Tablas que contiene |
|---|---|
| `academic.py` *(nuevo)* | Facultad, Especialidad, PlanEstudios, PlanCurso, Curso, PeriodoAcademico, Seccion |
| `user.py` | Usuario, Rol |
| `student.py` | Estudiante |
| `teacher.py` | Docente, Silabo |
| `enrollment.py` | Matricula, MatriculaDetalle, Pago |
| `grade.py` | Nota |
| `certificate.py` | Documento |
| `audit.py` | Auditoria |

## 4. Mapeo módulo del enunciado → Controller / Service / Route

| Módulo (enunciado) | Controller | Service | Route |
|---|---|---|---|
| Auth / login | `userController.py` | `auth_service.py` | `auth.py` |
| 1. Matrícula | `enrollmentController.py` | `enrollment_service.py` | `enrollment.py` |
| 2. Cursos y Docentes | `courseController.py` + `teacherController.py` | `course_service.py` | `courses.py` |
| 3. Notas | `gradeController.py` | `grade_service.py` | `grades.py` |
| 4. Récord Académico | `studentController.py` | `record_service.py` | `records.py` |
| 5. Certificados y Documentos | `certificateController.py` | `certificate_service.py` | `certificates.py` |
| 6. Administración y Seguridad | `userController.py` + `auditController.py` | `admin_service.py` | `admin.py` |

## 5. Rutas generales de la API (prefijo `/api`)

```
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/courses/facultades
GET    /api/courses/especialidades
GET    /api/courses/planes-estudio
GET    /api/courses/cursos
GET    /api/courses/secciones
POST   /api/courses/secciones          (admin: asigna docente/horario)

GET    /api/enrollment/mias            (estudiante: sus matrículas)
POST   /api/enrollment                 (estudiante: solicita matrícula)
POST   /api/enrollment/:id/validar     (admin: valida requisitos)
POST   /api/enrollment/:id/pago        (admin: registra pago)
GET    /api/enrollment/:id/ficha       (descarga ficha oficial)

POST   /api/grades/:matricula_detalle_id   (docente: registra notas)
GET    /api/grades/estudiante/:id          (estudiante: consulta notas)

GET    /api/records/:estudiante_id     (récord académico completo)

POST   /api/certificates                (estudiante: solicita certificado/constancia)
POST   /api/certificates/:id/emitir     (admin: emite con QR)
POST   /api/certificates/:id/autorizar  (dirección: autoriza)

GET    /api/admin/usuarios
POST   /api/admin/usuarios              (crear usuario + asignar rol)
GET    /api/admin/auditoria
```

## 6. Estado actual

Todos los archivos de `Controllers/`, `models/`, `routes/`, `schemas/`, `services/`, `utils/`, `config.py`, `extensions.py`, `app/__init__.py`, `run.py`, `requirements.txt` existen pero están **vacíos (0 líneas)**.
