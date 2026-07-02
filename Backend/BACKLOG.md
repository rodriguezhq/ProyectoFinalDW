# Backlog del equipo — Cristhian & Scoot

Reparto de trabajo y checklist de tareas. Para el detalle técnico (estructura de carpetas, modelo de datos, endpoints) ver [`ARQUITECTURA.md`](./ARQUITECTURA.md).

División: **por módulo funcional, full-stack** (backend + frontend de cada módulo lo hace la misma persona) para poder trabajar en paralelo sin bloquearse.

- **Cristhian** → Matrícula, Cursos y Docentes, Administración y Seguridad
- **Scoot** → Notas, Récord Académico, Certificados y Documentos

> Nota: si prefieren otra división (por capa Backend/Frontend, o por fases secuenciales trabajando juntos), se puede reorganizar este documento — esta es la propuesta por defecto.

## Fase 0 — Setup base (bloqueante, hacer primero) — **Cristhian**

- [ ] `requirements.txt` (Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, PyMySQL, Flask-CORS, marshmallow)
- [ ] `app/config.py` (URI de conexión MySQL, JWT secret)
- [ ] `app/extensions.py` (`db`, `migrate`, `jwt`)
- [ ] `app/__init__.py` (app factory + registro de blueprints)
- [ ] `run.py`
- [ ] Crear base de datos MySQL vacía y probar conexión

## Fase 1 — Modelos completos, las 18 tablas (bloqueante, hacer segundo) — **Cristhian**

- [ ] `models/academic.py` (Facultad, Especialidad, PlanEstudios, PlanCurso, Curso, PeriodoAcademico, Seccion)
- [ ] `models/user.py` (Usuario, Rol)
- [ ] `models/student.py` (Estudiante)
- [ ] `models/teacher.py` (Docente, Silabo)
- [ ] `models/enrollment.py` (Matricula, MatriculaDetalle, Pago)
- [ ] `models/grade.py` (Nota)
- [ ] `models/certificate.py` (Documento)
- [ ] `models/audit.py` (Auditoria)
- [ ] `flask db init` / `flask db migrate` / `flask db upgrade`
- [ ] Seed de datos de prueba (roles, 1 facultad, 1 especialidad, 1 periodo)

**Una vez terminada la Fase 1, ambos pueden trabajar en paralelo.**

## Fase 2 — Auth (apenas exista el modelo Usuario/Rol) — **Scoot**

- [ ] `services/auth_service.py` (login, hash de password, generación JWT)
- [ ] `utils/decorators.py` (`@role_required("ADMIN", "DIRECCION", ...)`)
- [ ] `routes/auth.py` (`POST /api/auth/login`, `POST /api/auth/logout`)
- [ ] Frontend: pantalla de login + guardado de token + rutas protegidas por rol

---

## Cristhian — Módulo 1: Matrícula

- [ ] `schemas/enrollment_schema.py`
- [ ] `services/enrollment_service.py` (solicitar matrícula, validar requisitos, generar ficha)
- [ ] `Controllers/enrollmentController.py`
- [ ] `routes/enrollment.py`
- [ ] Frontend estudiante: solicitar matrícula, descargar ficha
- [ ] Frontend admin: validar requisitos, registrar pago, generar ficha oficial
- [ ] Frontend dirección: dashboard de estadísticas de matrícula

## Cristhian — Módulo 2: Cursos y Docentes

- [ ] `schemas/course_schema.py`
- [ ] `services/course_service.py` (CRUD Facultad/Especialidad/PlanEstudios/Curso/Seccion, asignación docente)
- [ ] `Controllers/courseController.py` + `Controllers/teacherController.py`
- [ ] `routes/courses.py`
- [ ] Frontend docente: ver cursos asignados, subir sílabo, subir notas (link a módulo 3)
- [ ] Frontend admin: asignar docentes, gestionar horarios/secciones
- [ ] Frontend dirección: carga docente y cumplimiento de plan de estudios

## Cristhian — Módulo 6: Administración y Seguridad

- [ ] `services/admin_service.py` (gestión de usuarios y roles)
- [ ] `Controllers/userController.py` (CRUD usuarios) + `Controllers/auditController.py` (lectura de bitácora)
- [ ] `routes/admin.py`
- [ ] Middleware de auditoría (registra automáticamente en `Auditoria` sobre creates/updates/deletes sensibles)
- [ ] Frontend admin: gestión de perfiles de acceso (roles)
- [ ] Frontend dirección: panel de auditorías y reportes estratégicos

---

## Scoot — Módulo 3: Notas

- [ ] `schemas/grade_schema.py`
- [ ] `services/grade_service.py` (registrar parciales/final/sustitutorio, calcular promedio)
- [ ] `Controllers/gradeController.py`
- [ ] `routes/grades.py`
- [ ] Frontend docente: registrar notas parciales y finales por sección
- [ ] Frontend estudiante: consultar hoja de notas por ciclo
- [ ] Frontend admin: validar actas y consolidar notas
- [ ] Frontend dirección: indicadores académicos (promedios, aprobados/desaprobados)

## Scoot — Módulo 4: Récord Académico

- [ ] `schemas/record_schema.py`
- [ ] `services/record_service.py` (agregación de Nota + MatriculaDetalle + Matricula por estudiante — sin tabla propia)
- [ ] `routes/records.py`
- [ ] Frontend estudiante: historial académico completo
- [ ] Frontend admin: reportes consolidados (exportar PDF/Excel)
- [ ] Frontend dirección: desempeño por cohorte/programa

## Scoot — Módulo 5: Certificados y Documentos

- [ ] `schemas/certificate_schema.py`
- [ ] `services/certificate_service.py` (solicitud → autorización → emisión, generación de QR)
- [ ] `Controllers/certificateController.py`
- [ ] `routes/certificates.py`
- [ ] Frontend estudiante: solicitar certificados/constancias en línea
- [ ] Frontend admin: emitir certificados con firma digital/QR
- [ ] Frontend dirección: autorizar emisión de documentos oficiales

---

## Entregables finales (ambos)

- [ ] Capturas de pantalla de cada módulo funcionando
- [ ] README con instrucciones de instalación/ejecución (backend + frontend)
- [ ] Preparar presentación/exposición final
