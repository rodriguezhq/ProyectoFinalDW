# Arquitectura Backend — Sistema Académico

Documento técnico: estructura de carpetas, modelo de datos y contrato de API.
Para el reparto de trabajo entre el equipo, ver [`BACKLOG.md`](./BACKLOG.md).

## 1. Estructura de carpetas

```
Backend/
├── run.py                  # Entry point: arranca la app Flask
├── requirements.txt        # Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, PyMySQL, Flask-CORS, flask-openapi3, pydantic
└── app/
    ├── __init__.py         # App factory: crea la app (OpenAPI de flask-openapi3), inicializa extensions, registra blueprints
    ├── config.py           # Config (DB URI MySQL, JWT secret, etc.) por entorno (dev/prod)
    ├── extensions.py       # Instancias compartidas: db = SQLAlchemy(), migrate = Migrate(), jwt = JWTManager()
    │
    ├── models/             # SQLAlchemy ORM: 1 clase = 1 tabla. Solo define columnas y relationships.
    ├── schemas/             # Pydantic: define el shape de entrada/salida de cada endpoint (valida + genera la doc de Scalar).
    ├── services/            # Lógica de negocio (queries, validaciones, reglas). No conoce HTTP.
    ├── Controllers/          # Reciben el request ya validado por el schema, llaman al service, devuelven la respuesta.
    ├── routes/               # Blueprints (APIBlueprint): solo URL + método + que schema usar + a que Controller llamar. Sin lógica.
    └── utils/                # "Middleware" del proyecto: todo lo que intercepta el request/response
                                #   de forma transversal a todos los módulos, no lógica de un módulo puntual.
        ├── decorators.py    # @jwt_required, @role_required("Administrador", "Direccion"), etc.
        ├── error_handlers.py # Manejador global: excepciones no controladas -> JSON (nunca HTML), 500 genérico sin filtrar detalles internos
        └── helpers.py       # Funciones puras reutilizables (formateo, generación de códigos QR, etc.)
```

> `Flask-Limiter` (rate limiting) vive como instancia en `extensions.py` (`limiter = Limiter(...)`), igual que `db`/`jwt`/`cors` — y se aplica con `@limiter.limit(...)` directo sobre la ruta que lo necesite (hoy solo `/api/auth/login`, 5 intentos/minuto), no centralizado en `utils/`, porque cada ruta puede necesitar un límite distinto.

Flujo de una request: `routes/*.py` (valida con el schema de Pydantic) → `Controllers/*.py` (orquesta) → `services/*.py` (lógica) → `models/*.py` (db) → el Controller arma la respuesta usando el shape del schema.

> Se usa **Pydantic** en vez de Marshmallow para la capa `schemas/` porque `flask-openapi3` (la librería que genera la documentación interactiva en `/openapi/scalar`) necesita que las clases de request/response sean modelos Pydantic — es un requisito técnico de la librería, no una preferencia de estilo. Ver `routes/auth.py` / `Controllers/userController.py` / `schemas/user_schema.py` como ejemplo de referencia para los próximos módulos.

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

## 3. Modelos: 1 tabla = 1 archivo

Cada tabla vive en su propio archivo dentro de `models/` (`facultad.py` → clase `Facultad`, `plan_estudios.py` → clase `PlanEstudios`, etc.). Se eligió así en vez de agrupar por dominio para que sea más fácil ubicar cada tabla y para que dos personas trabajando en paralelo no choquen editando el mismo archivo por tocar tablas distintas.

`models/__init__.py` importa las 18 clases para que Flask-Migrate las detecte automáticamente al generar migraciones — cualquier modelo nuevo debe agregarse ahí también.

Las relaciones entre archivos (`db.relationship("Docente", ...)`, `db.ForeignKey("facultad.id_facultad")`) usan **strings**, no imports directos entre archivos de modelos — así se evita cualquier problema de import circular, incluso con el ciclo real `Facultad ↔ Docente` (decano/facultad).

## 4. Mapeo módulo del enunciado → Schema / Controller / Service / Route

| Módulo (enunciado) | Schema (Pydantic) | Controller | Service | Route |
|---|---|---|---|---|
| Auth / login | `auth_schema.py` + `user_schema.py` (reusa `UserData`) ✅ | `authController.py` ✅ | `auth_service.py` ✅ | `auth.py` ✅ |
| 1. Matrícula | `enrollment_schema.py` | `enrollmentController.py` | `enrollment_service.py` | `enrollment.py` |
| 2. Cursos y Docentes | `course_schema.py` | `courseController.py` + `teacherController.py` | `course_service.py` | `courses.py` |
| 3. Notas | `grade_schema.py` | `gradeController.py` | `grade_service.py` | `grades.py` |
| 4. Récord Académico | `record_schema.py` | `studentController.py` | `record_service.py` | `records.py` |
| 5. Certificados y Documentos | `certificate_schema.py` | `certificateController.py` | `certificate_service.py` | `certificates.py` |
| 6. Administración y Seguridad | `user_schema.py` | `userController.py` + `auditController.py` | `admin_service.py` | `admin.py` |

✅ = ya implementado (Fase 2, Auth). El resto son los archivos que cada módulo debe crear siguiendo ese mismo patrón de 4 capas.

`schemas/common_schema.py` tiene `MessageResponse` — genérico para cualquier respuesta de error/mensaje simple (401/403/404/409), lo puede usar cualquier módulo, no es específico de ninguno.

**Regla para nombrar archivos de una capa cuando un módulo tiene varias responsabilidades (como Auth vs Administración, que ambos tocan `Usuario`):** si la acción es específica de un flujo (loguearse), va en su propio archivo (`auth_*`); si es genérica y reusable entre módulos (la forma de un usuario, un mensaje de error), va en un archivo compartido (`user_schema.py`, `common_schema.py`).

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
