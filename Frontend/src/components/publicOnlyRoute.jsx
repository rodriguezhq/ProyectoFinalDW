import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ROLE_ROUTES = {
    1: '/admin',
    2: '/docente',
    3: '/estudiante',
    4: '/direccion',
};
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
        const route = ROLE_ROUTES[user.id_rol] || '/estudiante';
        return <Navigate to={route} replace />;
    }
    return <Outlet />;
}