import { Home } from 'lucide-react';
import SidebarShell from '../../components/sidebarShell';
import { Outlet } from 'react-router-dom';

const DireccionTabs = [
    { icon: <Home size={18} />, label: 'Inicio', path: '/direccion' },
];

export default function DireccionDashboard() {
    return (
        <SidebarShell menuOptions={DireccionTabs}>
            <Outlet />
        </SidebarShell>
    )
}
