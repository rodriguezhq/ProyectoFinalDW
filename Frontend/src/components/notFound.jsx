import { Link } from 'react-router-dom';

// Página para rutas inexistentes o secciones sin implementar todavía
// (ej. dashboards de Docente/Admin/Dirección mientras no existan).
// No redirige a "/": si el visitante ya tiene sesión, PublicOnlyRoute lo
// rebotaría de vuelta a esta misma ruta inexistente, formando un loop infinito.
export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-alt text-center px-6">
            <h1 className="text-3xl font-extrabold text-text-heading mb-2">404</h1>
            <p className="text-text-muted mb-6">Esta sección todavía no está disponible o la página no existe.</p>
            <Link to="/" className="text-primary font-semibold hover:underline">Volver al inicio</Link>
        </div>
    );
}
