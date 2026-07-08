import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarClose, SidebarOpen } from 'lucide-react';
import uncpImagen from '../assets/Escudo_UNCP.png';

export default function SidebarShell({ menuOptions = [], children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeMenuIndex, setActiveMenuIndex] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const role = user?.rol || 'Estudiante';

    const handleToggle = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const handleMenuClick = (opt, idx) => {
        setActiveMenuIndex(idx);
        setSidebarOpen(false); // Cierra el sidebar móvil al hacer clic
        navigate(opt.path);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white relative w-full font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[98] animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 h-screen bg-primary-light text-text-main flex flex-col overflow-y-auto border-r border-primary/10 transition-all duration-300 z-[99] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-[90px]' : 'w-[300px]'}`}>
                <div className={`flex items-center gap-3 p-6 border-b border-primary/10 ${isCollapsed ? 'lg:justify-center lg:p-5' : ''}`}>
                    <img src={uncpImagen} alt="UNCP logo" className="h-10 w-auto drop-shadow-sm" />
                    <div className={`flex flex-col ${isCollapsed ? 'lg:hidden' : ''}`}>
                        <span className="font-heading text-[1.15rem] font-extrabold text-primary tracking-tight leading-none">SGA - UNCP</span>
                        <span className="text-[0.65rem] text-accent-hover font-extrabold tracking-wider mt-1">SISTEMA ACADÉMICO</span>
                    </div>
                </div>

                {/* Menu Navigation */}
                <nav className={`grow py-6 px-4 ${isCollapsed ? 'lg:py-6 lg:px-2' : ''}`}>
                    <ul className="list-none flex flex-col gap-1.5">
                        {menuOptions.map((opt, idx) => (
                            <li key={idx}>
                                <button
                                    type="button"
                                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-none text-text-main/80 font-semibold text-[0.92rem] transition-all duration-300 text-left hover:text-primary hover:bg-white/60 ${activeMenuIndex === idx ? 'text-primary bg-white shadow-sm' : ''} ${isCollapsed ? 'lg:justify-center lg:py-2 lg:px-1' : ''}`}
                                    onClick={() => handleMenuClick(opt, idx)}
                                >
                                    <span className="text-[1.15rem]">{opt.icon}</span>
                                    <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{opt.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Brand signature footer */}
                <div className="p-5 border-t border-primary/10 text-primary/60 text-[0.78rem] font-bold text-center tracking-wider">
                    <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>UNCP © 2026</span>
                    <span className={`hidden ${isCollapsed ? 'lg:block' : ''}`}>©</span>
                </div>
            </aside>

            {/* Content wrapper */}
            <div className="grow flex flex-col h-full overflow-hidden min-w-0">
                {/* Header Bar */}
                <header className="h-[76px] bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-[90] shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="block text-2xl text-text-heading cursor-pointer bg-none border-none focus:outline-none"
                            aria-label="Toggle Menu"
                            onClick={handleToggle}
                        >
                            {
                                !isCollapsed ? (
                                    <SidebarClose />
                                ) : (
                                    <SidebarOpen />
                                )
                            }
                        </button>
                        <h2 className="hidden sm:block font-heading text-[1.45rem] font-extrabold text-text-heading tracking-tight truncate">
                            {menuOptions[activeMenuIndex]?.label || 'Panel de Control'}
                        </h2>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 grow overflow-y-auto bg-white">
                    {children || <Outlet />}
                </main>
            </div>

            {/* Profile Info Modal */}
            {profileModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm ">
                    <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden ">
                        {/* Modal Header */}
                        <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">👤</span>
                                <div className="text-left">
                                    <h3 className="font-heading font-extrabold text-primary text-[1.15rem]">Información del Perfil</h3>
                                    <p className="text-[0.7rem] text-primary/70 font-semibold uppercase tracking-wider leading-none mt-1">{role}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="text-text-muted hover:text-primary transition-all duration-150 text-2xl font-bold cursor-pointer focus:outline-none"
                                onClick={() => setProfileModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-4 border-b border-border pb-4">
                                <div className="w-16 h-16 rounded-full bg-primary text-white text-[1.7rem] font-bold flex items-center justify-center shadow-md border-[2px] border-white shrink-0">
                                    {user?.nombres ? user.nombres.charAt(0) : 'U'}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-heading font-bold text-text-heading text-[1.1rem] leading-snug">
                                        {user?.nombres || ''} {user?.apellidos || ''}
                                    </h4>
                                    <p className="text-[0.8rem] text-text-muted mt-1">Usuario: <span className="font-mono font-semibold">{user?.username || ''}</span></p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 text-[0.88rem]">
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-text-muted font-bold text-left">Código:</span>
                                    <span className="font-mono font-semibold text-text-heading text-left">2026{1000 + (user?.id_usuario || 1)}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-text-muted font-bold text-left">Rol:</span>
                                    <span className="font-semibold text-text-heading text-left">{role}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-text-muted font-bold text-left">Correo:</span>
                                    <span className="font-medium text-text-heading text-left truncate">{user?.correo || `${user?.username || 'usuario'}@uncp.edu.pe`}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="text-text-muted font-bold text-left">Estado:</span>
                                    <span className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full text-[0.72rem] font-bold bg-emerald-100 text-emerald-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Activo
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-bg-alt border-t border-border flex justify-end">
                            <button
                                type="button"
                                className="bg-primary text-white py-2 px-5 font-semibold text-[0.88rem] rounded-md transition-all duration-150 hover:bg-primary-hover shadow-sm"
                                onClick={() => setProfileModalOpen(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
