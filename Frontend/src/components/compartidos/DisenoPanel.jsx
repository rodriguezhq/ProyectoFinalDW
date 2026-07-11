import React, { useState } from 'react';
import { opcionesMenuRol } from '../../constants/compartidos';

export default function DisenoPanel({ user, onLogout, activeMenuIndex = 0, setActiveMenuIndex, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const rol = user?.rol || 'Estudiante';
  const opcionesMenu = opcionesMenuRol[rol] || opcionesMenuRol['Estudiante'];

  const alternarSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white relative w-full font-sans">
      {/* Capa de superposición para móviles */}
      {sidebarOpen && (
         <div 
           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[98] animate-fade-in" 
           onClick={() => setSidebarOpen(false)}
         />
      )}

      {/* Barra lateral */}
      <aside className={`fixed lg:static inset-y-0 left-0 h-screen bg-primary-light text-text-main flex flex-col overflow-y-auto border-r border-primary/10 transition-all duration-300 z-[99] shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-[90px]' : 'w-[270px]'}`}>
        <div className={`flex items-center gap-3 p-6 border-b border-primary/10 ${isCollapsed ? 'lg:justify-center lg:p-5' : ''}`}>
          <img src="/Escudo_UNCP.png" alt="Logo UNCP" className="h-10 w-auto drop-shadow-sm" />
          <div className={`flex flex-col ${isCollapsed ? 'lg:hidden' : ''}`}>
            <span className="font-heading text-[1.15rem] font-extrabold text-primary tracking-tight leading-none">SGA - UNCP</span>
            <span className="text-[0.65rem] text-accent-hover font-extrabold tracking-wider mt-1">SISTEMA ACADÉMICO</span>
          </div>
        </div>

        {/* Navegación del Menú */}
        <nav className={`grow py-6 px-4 ${isCollapsed ? 'lg:py-6 lg:px-2' : ''}`}>
          <ul className="list-none flex flex-col gap-1.5">
            {opcionesMenu.map((opcion, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  className={`w-full flex items-center gap-3 p-3 px-4 rounded-md text-text-main/80 font-semibold text-[0.92rem] transition-all duration-300 text-left hover:text-primary hover:bg-white/60 ${activeMenuIndex === idx ? 'text-primary bg-white shadow-sm border-l-4 border-primary rounded-none rounded-r-md pl-3' : ''} ${isCollapsed ? 'lg:justify-center lg:p-3' : ''}`}
                  onClick={() => setActiveMenuIndex(idx)}
                >
                  <span className="text-[1.15rem]">{opcion.icono}</span>
                  <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>{opcion.etiqueta}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Pie de firma institucional */}
        <div className="p-5 border-t border-primary/10 text-primary/60 text-[0.78rem] font-bold text-center tracking-wider">
          <span className={`${isCollapsed ? 'lg:hidden' : ''}`}>UNCP © 2026</span>
          <span className={`hidden ${isCollapsed ? 'lg:block' : ''}`}>©</span>
        </div>
      </aside>

      {/* Contenedor principal de contenido */}
      <div className="grow flex flex-col h-full overflow-hidden min-w-0">
        {/* Barra superior */}
        <header className="h-[76px] bg-white border-b border-border px-8 flex items-center justify-between sticky top-0 z-[90] shrink-0">
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              className="block text-2xl text-text-heading cursor-pointer bg-none border-none focus:outline-none"
              aria-label="Alternar Menú"
              onClick={alternarSidebar}
            >
              ☰
            </button>
            <h2 className="hidden sm:block font-heading text-[1.45rem] font-extrabold text-text-heading tracking-tight truncate">
              {opcionesMenu[activeMenuIndex]?.etiqueta || 'Panel de Control'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative text-xl cursor-pointer text-text-main transition-all duration-300 hover:text-primary hover:scale-110">
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              🔔
            </div>
            <div className="hidden sm:block text-[0.88rem] font-semibold text-text-muted">
              📅 {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>

            {/* Dropdown del perfil de usuario */}
            <div className="relative ml-2">
              <button 
                type="button" 
                className="flex items-center gap-3 bg-bg-alt border border-border p-1.5 pr-3.5 rounded-full cursor-pointer transition-all duration-300 hover:bg-slate-100 hover:border-slate-300 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-primary text-white text-[1.1rem] font-bold flex items-center justify-center shadow-sm border-[1.5px] border-white">
                  {user?.nombres ? user.nombres.charAt(0) : 'U'}
                </div>
                <div className="hidden md:flex flex-col items-start gap-[1px]">
                  <span className="text-[0.88rem] font-bold text-text-heading leading-tight">{user?.nombres || ''}</span>
                  <span className="text-[0.72rem] text-text-muted font-semibold uppercase">{rol}</span>
                </div>
                <span className="text-[0.65rem] text-text-muted ml-1">▼</span>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[990] bg-transparent" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute top-[115%] right-0 w-[250px] bg-white border border-border rounded-xl shadow-lg z-[1000] py-2 animate-slide-up">
                    <div className="p-3 px-4 flex flex-col gap-0.5">
                      <span className="text-[0.92rem] font-bold text-text-heading">{`${user?.nombres || ''} ${user?.apellidos || ''}`}</span>
                      <span className="text-[0.78rem] text-text-muted">{user?.correo || `${user?.username}@uncp.edu.pe`}</span>
                    </div>
                    <div className="h-[1px] bg-border my-1.5"></div>
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-2.5 p-2.5 px-4 bg-none border-none text-[0.88rem] text-text-main font-medium text-left cursor-pointer transition-all duration-150 hover:bg-slate-50 hover:text-primary hover:pl-5 focus:outline-none" 
                      onClick={() => {
                        setDropdownOpen(false);
                        setProfileModalOpen(true);
                      }}
                    >
                      👤 Información del Perfil
                    </button>
                    <button type="button" className="w-full flex items-center gap-2.5 p-2.5 px-4 bg-none border-none text-[0.88rem] text-text-main font-medium text-left cursor-pointer transition-all duration-150 hover:bg-slate-50 hover:text-primary hover:pl-5 focus:outline-none" onClick={() => setDropdownOpen(false)}>🔑 Cambiar Contraseña</button>
                    <div className="h-[1px] bg-border my-1.5"></div>
                    <button 
                      type="button" 
                      className="w-full flex items-center gap-2.5 p-2.5 px-4 bg-none border-none text-[0.88rem] font-medium text-left cursor-pointer transition-all duration-150 hover:pl-5 focus:outline-none text-red-500 hover:bg-red-500/5 hover:text-red-600"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                    >
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="p-8 grow overflow-y-auto bg-white">
          {children}
        </main>
      </div>

      {/* Modal de información del perfil */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in">
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div className="text-left">
                  <h3 className="font-heading font-extrabold text-primary text-[1.15rem]">Información del Perfil</h3>
                  <p className="text-[0.7rem] text-primary/70 font-semibold uppercase tracking-wider leading-none mt-1">{rol}</p>
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
                  <span className="font-semibold text-text-heading text-left">{rol}</span>
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
