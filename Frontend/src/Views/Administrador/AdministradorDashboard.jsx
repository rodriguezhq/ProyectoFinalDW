import { FileSpreadsheet, Home } from 'lucide-react';
import SidebarShell from '../../components/sidebarShell';
import { Outlet } from 'react-router-dom';

const AdministradorTabs = [
    { icon: <Home size={18} />, label: 'Inicio', path: '/admin' },
    { icon: <FileSpreadsheet size={18} />, label: 'Actas y Consolidación', path: '/admin/actas-notas' }
];

export default function AdministradorDashboard() {
    return (
        <SidebarShell menuOptions={AdministradorTabs}>
            <Outlet />
        </SidebarShell>
    )
}
