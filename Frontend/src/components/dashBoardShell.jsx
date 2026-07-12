import React from 'react';
import {
    Calendar,
    FileSpreadsheet,
    FileText,
    BookOpen,
    User,
    Edit3,
    LayoutDashboard,
    Settings,
    Clock,
    Users,
    FileCheck,
    TrendingUp,
    Shield,
    Stamp,
    ShieldCheck,
    GraduationCap
} from 'lucide-react';
import SidebarShell from './sidebarShell';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

const MENU_OPTIONS = {
    [ROLES.ESTUDIANTE]: [
        { icon: <Calendar size={18} />, label: 'Horario de Clases', path: '/estudiante' },
        { icon: <FileSpreadsheet size={18} />, label: 'Hoja de Notas', path: '/estudiante/notas' },
        { icon: <FileText size={18} />, label: 'Récord Académico', path: '/estudiante/record' },
        { icon: <BookOpen size={18} />, label: 'Matrícula', path: '/estudiante/matricula' },
        { icon: <Stamp size={18} />, label: 'Certificados', path: '/estudiante/certificados' },
        { icon: <User size={18} />, label: 'Ver Perfil', path: '/estudiante/perfil' }
    ],
    [ROLES.DOCENTE]: [
        { icon: <Calendar size={18} />, label: 'Horario de Clases', path: '/docente' },
        { icon: <BookOpen size={18} />, label: 'Cursos Asignados', path: '/docente/cursos' },
        { icon: <Edit3 size={18} />, label: 'Registrar Notas', path: '/docente/notas' },
        { icon: <User size={18} />, label: 'Ver Perfil', path: '/docente/perfil' }
    ],
    [ROLES.ADMINISTRADOR]: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard Control', path: '/admin' },
        { icon: <Settings size={18} />, label: 'Mantenimiento Académico', path: '/admin/mantenimiento' },
        { icon: <Clock size={18} />, label: 'Diseñar Horario', path: '/admin/horarios' },
        {icon: <Users size={18} />, label: 'Usuarios y Roles', path: '/admin/usuarios' },
        { icon: <FileCheck size={18} />, label: 'Validar Matrículas', path: '/admin/validar-matriculas' },
        { icon: <FileCheck size={18} />, label: 'Validar Actas', path: '/admin/actas-notas' },
        { icon: <Stamp size={18} />, label: 'Certificados', path: '/admin/certificados' },
        { icon: <User size={18} />, label: 'Ver Perfil', path: '/admin/perfil' }
    ],
    [ROLES.DIRECCION]: [
        { icon: <LayoutDashboard size={18} />, label: 'Dashboard Estratégico', path: '/direccion' },
        { icon: <TrendingUp size={18} />, label: 'Reportes de Cohortes', path: '/direccion/reportes' },
        { icon: <BookOpen size={18} />, label: 'Estadísticas de Matrícula', path: '/direccion/matriculas' },
        { icon: <GraduationCap size={18} />, label: 'Supervisión Académica', path: '/direccion/supervision' },
        { icon: <Shield size={18} />, label: 'Bitácora Auditoría', path: '/direccion/auditoria' },
        { icon: <ShieldCheck size={18} />, label: 'Certificados', path: '/direccion/certificados' },
        { icon: <User size={18} />, label: 'Ver Perfil', path: '/direccion/perfil' }
    ]
};

export default function DashBoardShell() {
    const { user } = useAuth();
    const role = user?.rol || ROLES.ESTUDIANTE;
    const menuOptions = MENU_OPTIONS[role] || [];
    
    return <SidebarShell menuOptions={menuOptions} />;
}

export function EstudianteDashboard() {
    return <DashBoardShell />;
}

export function DocenteDashboard() {
    return <DashBoardShell />;
}

export function AdministradorDashboard() {
    return <DashBoardShell />;
}

export function DireccionDashboard() {
    return <DashBoardShell />;
}
