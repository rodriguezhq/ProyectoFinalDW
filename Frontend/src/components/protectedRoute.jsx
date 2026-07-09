import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_ROUTES } from "../constants/roles";
import NotFound from "./notFound";

// Guard genérico de rutas privadas.
// - Sin sesión: manda al login, recordando a dónde quería ir.
// - Con sesión pero rol no autorizado: manda a SU propio home, no al login
//   (ya está autenticado, solo no tiene permiso para esa sección).
// - allowedRoles vacío/omitido: solo exige sesión, cualquier rol pasa.
export default function ProtectedRoute({ allowedRoles }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-alt">
                <span className="w-10 h-10 border-4 border-primary/30 rounded-full border-t-primary animate-spin"></span>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        const homeRoute = ROLE_ROUTES[user.rol];
        if (!homeRoute) {
            return <NotFound />;
        }
        return <Navigate to={homeRoute} replace />;
    }

    return <Outlet />;
}
