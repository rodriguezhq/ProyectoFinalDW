# sistema academico - backend

API REST de sistema academico con falsk

## requsitos

- Python 3.10+
- MySQL 8.0+
- Entorno virtual (recomendado)

## instalacion

1. crear y activar el entorno virutal

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

6. iniciar el servidor

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
http://localhost:5000/scalar
```

> Scalar se carga desde CDN, **no requiere instalar dependencias adicionales** en Python.
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
- **PyMySQL** — Conector MySQL
- **marshmallow** — Serialización/validación
- **python-dotenv** — Variables de entorno
