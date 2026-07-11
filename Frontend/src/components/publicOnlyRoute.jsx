import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_ROUTES } from "../constants/roles";
import NotFound from "./notFound";

export default function PublicOnlyRoute() {
    const { user, isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-alt">
                <span className="w-10 h-10 border-4 border-primary/30 rounded-full border-t-primary animate-spin"></span>
            </div>
        );
    }
    if (isAuthenticated && user) {
        // No adivinar destino para roles sin ruta mapeada (evita mandar a un
        // dashboard equivocado y evita loops de redirect entre "/" y esa ruta).
        const route = ROLE_ROUTES[user.rol];
        if (!route) {
            return <NotFound />;
        }
        return <Navigate to={route} replace />;
    }
    return <Outlet />;
}