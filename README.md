# Sistema Académico UNCP

Sistema de gestión académica institucional para la Universidad Nacional del
Centro del Perú, con cuatro roles diferenciados: Estudiante, Docente,
Administrador y Dirección.

## Arquitectura

El proyecto está dividido en dos aplicaciones independientes que se
comunican por HTTP:

| Carpeta     | Contenido    | Tecnología                 |
| ----------- | ------------ | -------------------------- |
| `Backend/`  | API REST     | Flask + SQLAlchemy + MySQL |
| `Frontend/` | Interfaz web | React + Vite               |

En producción, el frontend (desplegado en Vercel) reenvía las peticiones
`/api/*` hacia el backend (desplegado en Railway) mediante un rewrite
configurado en `Frontend/vercel.json`. Esto hace que, desde el navegador,
ambas aplicaciones parezcan un único origen, lo cual es necesario para que
la cookie de sesión (JWT) no sea bloqueada por las políticas de cookies
"cross-site" de los navegadores modernos.

```
Navegador -> Vercel (Frontend estático + proxy /api/*) -> Railway (API Flask) -> MySQL
```

## Requisitos

- Python 3.10 o superior
- Node.js 20 o superior
- MySQL 8.0 o superior

## Instalación

Cada aplicación tiene su propia guía de instalación y configuración
detallada:

- [Backend/README.md](Backend/README.md) — API, base de datos, migraciones,
  variables de entorno, datos de prueba y despliegue.
- [Frontend/README.md](Frontend/README.md) — interfaz web, variables de
  entorno y despliegue.

Para desarrollo local, ambas aplicaciones corren al mismo tiempo: el backend
en `http://localhost:5000` y el frontend en `http://localhost:5173`.

## Roles del sistema

| Rol           | Funcionalidades principales                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Estudiante    | Horario de clases, matrícula, notas, récord académico, solicitud de certificados                                         |
| Docente       | Cursos asignados, registro de notas, gestión de sílabos                                                                  |
| Administrador | Gestión de usuarios y roles, cursos, periodos académicos, validación de matrículas, emisión de certificados              |
| Dirección     | Bitácora de auditoría, reportes estratégicos (desempeño por cohorte, consolidado), supervisión académica y de matrículas |

Cada rol tiene sus propias rutas protegidas en el frontend
(`Frontend/src/routes.jsx`) y sus propios endpoints restringidos en el
backend (decorador `role_required` en `Backend/app/utils/decorators.py`).

## Usuarios de prueba (seed)

| Usuario      | Rol           | Contraseña     |
| ------------ | ------------- | -------------- |
| `admin`      | Administrador | `Password123!` |
| `direccion`  | Dirección     | `Password123!` |
| `jsuasnabar` | Docente       | `Password123!` |
| `atorres`    | Docente       | `Password123!` |
| `cmartinez`  | Estudiante    | `Password123!` |
| `sfernandez` | Estudiante    | `Password123!` |


## Despliegue

| Componente      | Plataforma |
| --------------- | ---------- |
| Backend + MySQL | Railway    |
| Frontend        | Vercel     |

El detalle de variables de entorno y comandos de despliegue está en la
sección "Despliegue" de cada README (`Backend/README.md`,
`Frontend/README.md`).
