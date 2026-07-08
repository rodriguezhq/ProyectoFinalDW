import { Calendar, ListChecks, FileText, BarChart3, ClipboardList, GraduationCap, FileSpreadsheet } from 'lucide-react';
import SidebarShell from '../../components/sidebarShell';
import { Outlet } from 'react-router-dom';

const EstudianteTabs = [
    { icon: <Calendar size={18} />, label: 'Horario de Clases', path: '/estudiante' },
    { icon: <ListChecks size={18} />, label: 'Solicitar Matrícula', path: '/estudiante/matricula' },
    { icon: <BarChart3 size={18} />, label: 'Hoja de Notas', path: '/estudiante/notas' }
];
export default function EstudianteDashboard() {
    return (
        <SidebarShell menuOptions={EstudianteTabs}>
            <Outlet />
        </SidebarShell>
    )
}