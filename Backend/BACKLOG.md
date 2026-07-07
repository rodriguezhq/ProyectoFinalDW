# Backlog del equipo — Cristhian & Scoot

Reparto de trabajo y checklist de tareas. Para el detalle técnico (estructura de carpetas, modelo de datos, endpoints) ver [`ARQUITECTURA.md`](./ARQUITECTURA.md).

División: **por módulo funcional, full-stack** (backend + frontend de cada módulo lo hace la misma persona) para poder trabajar en paralelo sin bloquearse.

- **Cristhian** → Matrícula, Cursos y Docentes, Administración y Seguridad
- **Scoot** → Notas, Récord Académico, Certificados y Documentos

> Nota: si prefieren otra división (por capa Backend/Frontend, o por fases secuenciales trabajando juntos), se puede reorganizar este documento — esta es la propuesta por defecto.

## Fase 0 — Setup base (bloqueante, hacer primero) — **Cristhian**

- [x] `requirements.txt`
- [x] `app/config.py` (URI de conexión MySQL, JWT secret, Development/Production/Testing)
- [x] `app/extensions.py` (`db`, `migrate`, `jwt`, `cors`)
- [x] `app/__init__.py` (app factory + registro de blueprints)
- [x] `run.py`
- [x] Crear base de datos MySQL vacía y probar conexión

## Fase 1 — Modelos completos, las 18 tablas (bloqueante, hacer segundo) — **Cristhian**

- [x] Modelos (1 archivo por tabla, ver `ARQUITECTURA.md`)
- [x] `flask db init` / `flask db migrate` / `flask db upgrade`
- [x] Seed completo de datos de prueba (`seed.py`)

**Una vez terminada la Fase 1, ambos pueden trabajar en paralelo.**

## Fase 2 — Auth (apenas exista el modelo Usuario/Rol) — **Scoot**

- [x] `services/auth_service.py` (login, hash de password, generación JWT)
- [x] `utils/decorators.py` (`@role_required("Administrador", "Direccion", ...)`)
- [x] `routes/auth.py` (`POST /api/auth/login`, `POST /api/auth/logout`)
- [x] `Controllers/authController.py` + `schemas/auth_schema.py` + `schemas/user_schema.py` + `schemas/common_schema.py`
- [x] Tests (`tests/test_auth.py`, `tests/test_models.py`) — 23 casos, funcionales + seguridad
- [ ] Frontend: pantalla de login + guardado de token + rutas protegidas por rol (hoy es un mock, sin conexión real al backend)

---

## Cristhian — Módulo 1: Matrícula

- [x] `schemas/enrollment_schema.py`
- [x] `services/enrollment_service.py` (solicitar matrícula, validar requisitos, registrar pago, generar ficha PDF, estadísticas)
- [x] `Controllers/enrollmentController.py`
- [x] `routes/enrollment.py` (6 endpoints: solicitar, mías, validar, pago, ficha, estadísticas)
- [x] Tests (`tests/test_enrollment.py`) — 18 casos, funcionales + seguridad + roles
- [ ] Frontend estudiante: solicitar matrícula, descargar ficha
- [ ] Frontend admin: validar requisitos, registrar pago, generar ficha oficial
- [ ] Frontend dirección: dashboard de estadísticas de matrícula

## Cristhian — Módulo 2: Cursos y Docentes

- [x] `schemas/course_schema.py`
- [x] `services/course_service.py` (CRUD Facultad/Especialidad/PlanEstudios/Curso/PlanCurso/Seccion, asignación docente, sílabo, reportes de Dirección)
- [x] `Controllers/courseController.py` + `Controllers/teacherController.py`
- [x] `routes/courses.py` (18 endpoints: CRUD académico + secciones + mis-secciones + subir sílabo real (multipart) + carga docente + cumplimiento de plan)
- [x] Tests (`tests/test_courses.py`) — 20 casos
- [ ] Frontend docente: ver cursos asignados, subir sílabo, subir notas (link a módulo 3)
- [ ] Frontend admin: asignar docentes, gestionar horarios/secciones
- [ ] Frontend dirección: carga docente y cumplimiento de plan de estudios

## Cristhian — Módulo 6: Administración y Seguridad

- [x] `services/admin_service.py` (CRUD usuarios + roles) + `services/audit_service.py` (compartido)
- [x] `Controllers/userController.py` (CRUD usuarios/roles) + `Controllers/auditController.py` (lectura de bitácora)
- [x] `routes/admin.py` (7 endpoints)
- [x] Auditoría real: login exitoso/fallido, crear/actualizar usuario quedan registrados (con IP) — verificado, ya no es una tabla vacía
- [x] Tests (`tests/test_admin.py`) — 17 casos
- [ ] Frontend admin: gestión de perfiles de acceso (roles)
- [ ] Frontend dirección: panel de auditorías y reportes estratégicos

**Backend de Cristhian: 3/3 módulos completos** (Matrícula, Cursos y Docentes, Administración y Seguridad).

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
