# sistema academico - backend

API REST de sistema academico con Flask

## Requisitos

- Python 3.10+
- MySQL 8.0+
- Entorno virtual (recomendado)

## Instalación

1. Crear y activar el entorno virtual

    ```bash
    python -m venv venv
    venv\Scripts\activate   # Windows
    source venv/bin/activate  # Linux/Mac
    ```

2. instalar dependencias

    ```bash
    pip install -r requirements.txt
    ```

3. configurar variables de entorno
    Copiar `.env.example` a `.env` y ajustar la conexión a MySQL:

    ```env
    DATABASE_URL=mysql+pymysql://usuario:contraseña@localhost:3306/sistema_academico
    SECRET_KEY=tu-secret-key
    JWT_SECRET_KEY=tu-jwt-secret-key
    ```

4. Ejecutar migraciones

    ```bash
    flask db upgrade
    ```

5. Poblar la base de datos

    ```bash
    python seed.py
    ```

    > **Nota:** `seed.py` recrea todas las tablas desde cero (borra lo que haya),
    > asi que despues de correrlo hay que re-marcar la migracion actual:
    >
    > ```bash
    > flask db stamp b3bfae78c500
    > ```

6. (Opcional) Poblar con datos masivos — `factories.py`

    Genera volumen realista encima del baseline del seed (requiere haber
    corrido `seed.py` primero). **Solo agrega datos, nunca borra**, y se puede
    re-ejecutar las veces que se quiera sin duplicar ni chocar con corridas
    anteriores:

    ```bash
    python factories.py
    ```

    Valores por defecto: 3 facultades nuevas (con especialidad, malla de 20
    cursos con prerrequisitos, secciones y horarios), 5 periodos historicos
    cerrados (2023-I a 2025-I), 10 docentes, 70 estudiantes (cada uno con sus
    matriculas desde su año de ingreso, notas y pagos), 4 usuarios de
    Administracion/Direccion, silabos para todos los cursos, 60 documentos y
    250 registros de auditoria.

    Cantidades configurables:

    ```bash
    python factories.py --estudiantes 100 --docentes 15 --documentos 80 --auditoria 300 --facultades 5 --admins 6
    ```

    Todos los usuarios generados usan la contraseña `Password123!`.

    Con los valores por defecto la BD queda con: 7 periodos, 5 facultades,
    5 especialidades, 75 cursos, ~265 secciones y horarios, ~337 matriculas,
    ~1290 detalles con su nota, ~336 pagos, 62 documentos, ~254 auditorias
    y ~104 usuarios. Los datos respetan todas las relaciones y restricciones
    (sin choques de horario entre cursos matriculados ni docentes en dos
    sitios a la vez).

7. iniciar el servidor

    ```bash
    python run.py
    ```

El servidor se ejecutará en `http://localhost:5000`.

## Endpoints disponibles

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |

## Documentación interactiva (Scalar)

El proyecto incluye **Scalar** como interfaz gráfica para probar los endpoints.
Una vez iniciado el servidor, abrir en el navegador:

```
http://localhost:5000/openapi/scalar
```

> Aunque requiere la librería `flask-openapi3-scalar` en Python (incluida en `requirements.txt`), los recursos estáticos de Scalar (CSS/JS) se cargan vía CDN de forma automática.
>
### Usuarios de prueba (seed)

| Usuario | Rol | Contraseña |
|---------|-----|------------|
| `admin` | Administrador | `Password123!` |
| `direccion` | Dirección | `Password123!` |
| `jsuasnabar` | Docente | `Password123!` |
| `atorres` | Docente | `Password123!` |
| `cmartinez` | Estudiante | `Password123!` |
| `sfernandez` | Estudiante | `Password123!` |

## Dependencias principales

- **Flask** — Framework web
- **Flask-SQLAlchemy** — ORM para base de datos
- **Flask-Migrate** — Migraciones de BD
- **Flask-JWT-Extended** — Autenticación con JWT
- **Flask-CORS** — Soporte CORS
- **flask-openapi3** — Generación de OpenAPI y documentación de APIs
- **flask-openapi3-scalar** — Interfaz interactiva de documentación con Scalar
- **pydantic** — Validación de datos y modelos de esquemas
- **PyMySQL** — Conector MySQL
- **marshmallow** — Serialización/validación
- **python-dotenv** — Variables de entorno
- **factory_boy + Faker** — Generación de datos masivos de prueba (`factories.py`)
