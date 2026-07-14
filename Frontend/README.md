# Sistema Académico - Frontend

Interfaz web del sistema académico, construida con React y Vite. Consume la
API del backend y adapta la navegación y funcionalidades según el rol del
usuario autenticado (Estudiante, Docente, Administrador, Dirección).

## Requisitos

- Node.js 20 o superior
- Backend corriendo (ver [../Backend/README.md](../Backend/README.md))

## Instalación

1. Instalar dependencias

    ```bash
    npm install
    ```

2. Configurar variables de entorno

    Crear un archivo `.env` en esta carpeta:

    ```env
    VITE_API_BASE_URL=http://localhost:5000
    ```

3. Iniciar el servidor de desarrollo

    ```bash
    npm run dev
    ```

    La aplicación se sirve en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_BASE_URL` | URL base del backend. En desarrollo local, `http://localhost:5000`. En producción, se deja vacía (ver sección Despliegue). |

Esta variable se lee en tiempo de compilación (Vite), no en tiempo de
ejecución: cualquier cambio requiere reiniciar `npm run dev` o volver a
compilar con `npm run build`.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la aplicación para producción en `dist/` |
| `npm run preview` | Sirve localmente el resultado de `npm run build` |
| `npm run lint` | Analiza el código con Oxlint |

## Estructura del proyecto

```
src/
  Views/         Paginas de la aplicacion, organizadas por rol/modulo
  components/    Componentes reutilizables (paginacion, layouts, etc.)
  Services/      Funciones que llaman a la API del backend
  hooks/         Hooks personalizados (logica de estado por vista)
  Context/       Contexto de autenticacion (usuario y rol actual)
  constants/     Valores fijos (roles, acciones auditables, etc.)
  utils/         Utilidades compartidas (formato de fechas, exportacion a Excel/PDF)
  routes.jsx     Definicion de rutas y proteccion por rol
```

## Rutas por rol

Las rutas están protegidas por rol en `src/routes.jsx` mediante el
componente `ProtectedRoute`:

| Prefijo | Rol requerido |
|---------|----------------|
| `/estudiante/*` | Estudiante |
| `/docente/*` | Docente |
| `/admin/*` | Administrador |
| `/direccion/*` | Dirección |

## Despliegue

El frontend se despliega en Vercel como sitio estático.

- `VITE_API_BASE_URL` se deja vacía en la variable de entorno de Vercel:
  las peticiones a `/api/*` se hacen a rutas relativas, y son reenviadas al
  backend (Railway) mediante el rewrite definido en `vercel.json`.
- `vercel.json` define dos reglas, en este orden:
  1. `/api/(.*)` → reenvía al backend en Railway (mismo origen para el
     navegador, evita que las cookies de sesión se bloqueen por ser
     "cross-site").
  2. `/(.*)` → sirve `index.html`, necesario para que las rutas de React
     Router funcionen al entrar directo a una URL o al refrescar.
- No debe existir un archivo `.env` en el repositorio de despliegue: Vite
  lo prioriza sobre la variable configurada en Vercel y rompería el punto
  anterior.

## Dependencias principales

- **React** — Librería de interfaz de usuario
- **React Router** — Enrutamiento y protección de rutas por rol
- **Vite** — Herramienta de build y servidor de desarrollo
- **Tailwind CSS** — Estilos
- **lucide-react** — Iconos
- **sonner** — Notificaciones (toasts)
- **framer-motion** — Animaciones
