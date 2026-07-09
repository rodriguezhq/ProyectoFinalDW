import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_ROUTES } from '../constants/roles';
import { SidebarClose, SidebarOpen, ChevronDown, LogOut, User as UserIcon, SquareArrowRightExitIcon } from 'lucide-react';
import uncpImagen from '../assets/Escudo_UNCP.png';

export default function SidebarShell({ menuOptions = [], children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const role = user?.rol || 'Estudiante';
    const currentPath = location.pathname;
    const activeMenuIndex = menuOptions.findIndex(opt => opt.path === currentPath);

    const handleToggle = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const handleMenuClick = (opt) => {
        setSidebarOpen(false); // Cierra el sidebar móvil al hacer clic
        navigate(opt.path);
    };

    const handleProfileClick = () => {
        setDropdownOpen(false);
        const baseRoute = ROLE_ROUTES[role] || '/estudiante';
        navigate(`${baseRoute}/perfil`);
    };

    const handleLogout = async () => {
        setDropdownOpen(false);
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
            <aside className={`fixed lg:static inset-y-0 left-0 h-screen bg-primary-light text-text-main flex flex-col overflow-y-auto border-r border-primary/10 transition-all duration-300 z-[99] shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-[90px]' : 'w-[250px]'}`}>
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
                                    onClick={() => handleMenuClick(opt)}
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
                    <button className={`w-full flex items-center gap-3 py-2 px-3 border-2 text-primary font-semibold text-[0.92rem] transition-all duration-300 text-left hover:text-primary hover:bg-white/60 ${isCollapsed ? 'lg:justify-center lg:py-2 lg:px-1' : ''}`}
                        onClick={() => logout()}
                    >
                        <span className="text-[1.15rem] text-red-600">{<LogOut />}</span>
                        <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
                    </button>
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
                            {currentPath.endsWith('/perfil') ? 'Vista Perfil' : (menuOptions[activeMenuIndex]?.label || 'Panel de Control')}
                        </h2>
                    </div>

                    {/* Menú de usuario */}
                    <div className="relative">
                        <button
                            type="button"
                            className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full border border-border hover:bg-bg-alt transition-all duration-150 focus:outline-none"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <div className="w-8 h-8 rounded-full bg-primary text-white text-[0.9rem] font-bold flex items-center justify-center shrink-0">
                                {user?.nombres ? user.nombres.charAt(0) : 'U'}
                            </div>
                            <span className="hidden sm:block text-[0.85rem] font-semibold text-text-heading">
                                {user?.nombres || user?.username || 'Usuario'}
                            </span>
                            <ChevronDown size={16} className="text-text-muted" />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-[95]" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-border rounded-lg shadow-lg z-[96] overflow-hidden">
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-2.5 py-2.5 px-4 text-[0.88rem] font-medium text-text-heading hover:bg-bg-alt transition-all duration-150"
                                        onClick={handleProfileClick}
                                    >
                                        <UserIcon size={16} />
                                        Ver perfil
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 grow overflow-y-auto bg-white min-w-0">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}
