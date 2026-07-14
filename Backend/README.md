# Sistema Académico - Backend

API REST del sistema académico, construida con Flask, SQLAlchemy y MySQL.
Provee autenticación por roles, gestión académica (cursos, matrículas,
notas, horarios), certificados con código QR, auditoría de operaciones y
reportes estratégicos.

## Requisitos

- Python 3.10 o superior
- MySQL 8.0 o superior
- Entorno virtual (recomendado)

## Arquitectura

```
app/
  Controllers/   Logica de cada endpoint (recibe el request ya validado, orquesta el service)
  routes/        Definicion de rutas y schemas de entrada/salida (flask-openapi3)
  services/      Reglas de negocio y acceso a datos (SQLAlchemy)
  models/        Definicion de las tablas (SQLAlchemy ORM)
  schemas/       Modelos Pydantic para validar requests y responses
  utils/         Utilidades compartidas (paginacion, decoradores de rol, manejo de errores)
  static/        Archivos subidos (silabos)
migrations/      Historial de migraciones (Alembic, via Flask-Migrate)
tests/           Suite de pruebas (pytest)
seed.py          Datos base fijos y predecibles (roles, periodos, catalogo, usuarios de prueba)
factories.py     Generador de datos masivos con factory_boy (opcional, ver mas abajo)
```

El flujo de una petición es: `routes` (valida con Pydantic) → `Controllers`
(orquesta) → `services` (reglas de negocio, consultas SQLAlchemy) →
`models`.

## Instalación

1. Crear y activar el entorno virtual

    ```bash
    python -m venv venv
    venv\Scripts\activate   # Windows
    source venv/bin/activate  # Linux/Mac
    ```

2. Instalar dependencias

    ```bash
    pip install -r requirements.txt
    ```

3. Configurar variables de entorno

    Copiar `.env.example` a `.env` y completar los valores (ver tabla
    completa más abajo).

4. Ejecutar migraciones

    ```bash
    flask db upgrade
    ```

5. Poblar la base de datos

    ```bash
    python seed.py
    ```

    `seed.py` recrea todas las tablas desde cero (borra lo que haya), así
    que después de correrlo hay que re-marcar la migración actual:

    ```bash
    flask db stamp b3bfae78c500
    ```

6. (Opcional) Poblar con datos masivos — `factories.py`

    Genera volumen realista encima del baseline del seed (requiere haber
    corrido `seed.py` primero). Solo agrega datos, nunca borra, y se puede
    re-ejecutar las veces que se quiera sin duplicar ni chocar con corridas
    anteriores:

    ```bash
    python factories.py
    ```

    Valores por defecto: 3 facultades nuevas (con especialidad, malla de 20
    cursos con prerrequisitos, secciones y horarios), 5 periodos históricos
    cerrados (2023-I a 2025-I), 10 docentes, 70 estudiantes (cada uno con sus
    matrículas desde su año de ingreso, notas y pagos), 4 usuarios de
    Administración/Dirección, sílabos para todos los cursos, 60 documentos y
    250 registros de auditoría.

    Cantidades configurables:

    ```bash
    python factories.py --estudiantes 100 --docentes 15 --documentos 80 --auditoria 300 --facultades 5 --admins 6
    ```

    Todos los usuarios generados usan la contraseña `Password123!`.

7. Iniciar el servidor

    ```bash
    python run.py
    ```

    El servidor se ejecuta en `http://localhost:5000`.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `FLASK_ENV` | Sí | `development`, `production` o `testing`. Determina la configuración activa (`app/config.py`). |
| `SECRET_KEY` | Sí | Clave secreta de Flask. Generar con `python -c "import secrets; print(secrets.token_urlsafe(32))"`. |
| `JWT_SECRET_KEY` | Sí | Clave secreta para firmar los tokens JWT. Generar igual que `SECRET_KEY`. |
| `DATABASE_URL` | Sí | Cadena de conexión MySQL: `mysql+pymysql://usuario:contraseña@host:puerto/basededatos`. |
| `FRONTEND_URL` | Sí | Origen del frontend permitido por CORS (ej. `https://mi-frontend.vercel.app`). |

En `development`, las cookies JWT usan `SameSite=Lax` y no requieren HTTPS.
En `production`, se fuerzan a `SameSite=None; Secure` (`app/config.py`,
clase `ProductionConfig`), necesario porque frontend y backend viven en
dominios distintos.

## Pruebas

```bash
pytest
```

La suite usa una base de datos SQLite en memoria (`TestingConfig`), no
requiere MySQL ni variables de entorno adicionales.

## Documentación interactiva (Scalar)

El proyecto incluye Scalar como interfaz gráfica para probar los endpoints.
Con el servidor iniciado, abrir en el navegador:

```
http://localhost:5000/openapi/scalar
```

Requiere la librería `flask-openapi3-scalar` (incluida en
`requirements.txt`); los recursos estáticos de Scalar se cargan vía CDN.

## Usuarios de prueba (seed)

| Usuario | Rol | Contraseña |
|---------|-----|------------|
| `admin` | Administrador | `Password123!` |
| `direccion` | Dirección | `Password123!` |
| `jsuasnabar` | Docente | `Password123!` |
| `atorres` | Docente | `Password123!` |
| `cmartinez` | Estudiante | `Password123!` |
| `sfernandez` | Estudiante | `Password123!` |

## Despliegue

El backend se despliega en Railway junto con su base de datos MySQL.

- Comando de inicio: `gunicorn run:app --bind 0.0.0.0:$PORT`
- Variable `FLASK_ENV=production` obligatoria (activa `ProductionConfig`).
- El middleware `ProxyFix` (`app/__init__.py`) está activo solo en
  `production`: corrige la IP del cliente y el protocolo cuando la petición
  pasa por los proxies de Vercel y Railway antes de llegar a la aplicación
  (sin esto, `request.remote_addr` capturaría la IP del proxy en vez de la
  del usuario real, afectando tanto la auditoría como el rate limiting).
- Tras cada despliegue nuevo sobre una base de datos ya existente, correr
  `flask db upgrade` para aplicar migraciones pendientes.

## Dependencias principales

- **Flask** — Framework web
- **Flask-SQLAlchemy** — ORM para base de datos
- **Flask-Migrate** — Migraciones de BD (Alembic)
- **Flask-JWT-Extended** — Autenticación con JWT (cookies httpOnly)
- **Flask-CORS** — Soporte CORS
- **Flask-Limiter** — Límite de peticiones por IP
- **flask-openapi3** — Definición de rutas, validación y documentación OpenAPI
- **flask-openapi3-scalar** — Interfaz interactiva de documentación (Scalar)
- **pydantic** — Validación de datos y modelos de esquemas
- **PyMySQL** — Conector MySQL
- **python-dotenv** — Carga de variables de entorno desde `.env`
- **reportlab** — Generación de PDFs (certificados, actas)
- **gunicorn** — Servidor WSGI de producción
- **pytest** — Suite de pruebas
- **factory_boy + Faker** — Generación de datos masivos de prueba (`factories.py`)
