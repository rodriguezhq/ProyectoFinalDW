import { Home, Notebook } from 'lucide-react';
import SidebarShell from '../../components/sidebarShell';
import { Outlet } from 'react-router-dom';

const DocenteTabs = [
    { icon: <Home size={18} />, label: 'Inicio', path: '/docente' },
    { icon: <Notebook size={18} />, label: 'Registrar Notas', path: '/docente/notas' }
];

export default function DocenteDashboard() {
    return (
        <SidebarShell menuOptions={DocenteTabs}>
            <Outlet />
        </SidebarShell>
    )
}
