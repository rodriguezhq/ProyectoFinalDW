import { BarChart3, Home, ShieldAlert } from 'lucide-react';
import SidebarShell from '../../components/sidebarShell';
import { Outlet } from 'react-router-dom';

const DireccionTabs = [
    { icon: <Home size={18} />, label: 'Inicio', path: '/direccion' },
    { icon: <BarChart3 size={18} />, label: 'Reportes Académicos', path: '/direccion/reportes' },
];


export default function DireccionDashboard() {
    return (
        <SidebarShell menuOptions={DireccionTabs}>
            <Outlet />
        </SidebarShell>
    )
}
