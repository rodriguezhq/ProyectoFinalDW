import React, { useState } from 'react';

// Options list matching tasks from modulesData per role
const roleMenuOptions = {
  Estudiante: [
    { icon: '🗓️', label: 'Horario de Clases', active: true },
    { icon: '📝', label: 'Solicitar Matrícula' },
    { icon: '📥', label: 'Descargar Ficha' },
    { icon: '📊', label: 'Hoja de Notas' },
    { icon: '🎓', label: 'Récord Académico' },
    { icon: '📄', label: 'Solicitar Certificados' }
  ],
  Docente: [
    { icon: '🗓️', label: 'Horario de Clases', active: true },
    { icon: '📚', label: 'Cursos Asignados' },
    { icon: '✍️', label: 'Registrar Notas' },
    { icon: '🔎', label: 'Notas Estudiante' },
    { icon: '🏫', label: 'Notas por Sección' }
  ],
  Administrador: [
    { icon: '📈', label: 'Dashboard de Control', active: true },
    { icon: '📝', label: 'Validar Matrículas' },
    { icon: '💵', label: 'Registrar Pagos' },
    { icon: '🏫', label: 'Asignar Docentes' },
    { icon: '📊', label: 'Validar Actas' },
    { icon: '📄', label: 'Emitir Certificados (QR)' },
    { icon: '🛡️', label: 'Usuarios y Roles' }
  ],
  Direccion: [
    { icon: '📈', label: 'Dashboard Estratégico', active: true },
    { icon: '📝', label: 'Estadísticas Matrícula' },
    { icon: '📚', label: 'Carga Docente' },
    { icon: '🎓', label: 'Desempeño Cohortes' },
    { icon: '📄', label: 'Autorizar Certificados' },
    { icon: '🛡️', label: 'Bitácora Auditoría' }
  ]
};

export default function DashboardLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = user?.rol || 'Estudiante';
  const menuOptions = roleMenuOptions[role] || roleMenuOptions['Estudiante'];

  const handleToggle = () => {
    if (window.innerWidth <= 968) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <img src="/Escudo_UNCP.png" alt="UNCP logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">SGA - UNCP</span>
            <span className="sidebar-brand-sub">SISTEMA ACADÉMICO</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuOptions.map((opt, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  className={`sidebar-menu-btn ${activeMenuIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveMenuIndex(idx)}
                >
                  <span className="menu-icon">{opt.icon}</span>
                  <span className="menu-label">{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Brand signature footer */}
        <div className="sidebar-footer">
          <span className="menu-label">UNCP © 2026</span>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="dashboard-content-wrapper">
        {/* Header Bar */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              type="button" 
              className="sidebar-toggle"
              aria-label="Toggle Menu"
              onClick={handleToggle}
            >
              ☰
            </button>
            <h2 className="header-page-title">
              {menuOptions[activeMenuIndex]?.label || 'Panel de Control'}
            </h2>
          </div>

          <div className="header-right">
            <div className="header-alert-indicator">
              <span className="pulse-dot"></span>
              🔔
            </div>
            <div className="header-date">
              📅 {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>

            {/* Profile Dropdown */}
            <div className="user-dropdown-container">
              <button 
                type="button" 
                className="user-profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="header-avatar-circle">
                  {user?.nombres ? user.nombres.charAt(0) : 'U'}
                </div>
                <div className="header-user-text">
                  <span className="header-user-name">{user?.nombres || ''}</span>
                  <span className="header-user-role">{role}</span>
                </div>
                <span className="dropdown-caret">▼</span>
              </button>

              {dropdownOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                  <div className="dropdown-menu-list">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-fullname">{`${user?.nombres || ''} ${user?.apellidos || ''}`}</span>
                      <span className="dropdown-user-email">{user?.correo || `${user?.username}@uncp.edu.pe`}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button type="button" className="dropdown-item" onClick={() => setDropdownOpen(false)}>👤 Información del Perfil</button>
                    <button type="button" className="dropdown-item" onClick={() => setDropdownOpen(false)}>🔑 Cambiar Contraseña</button>
                    <div className="dropdown-divider"></div>
                    <button 
                      type="button" 
                      className="dropdown-item logout"
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

        {/* Page Content */}
        <main className="dashboard-main-content animate-slide-up">
          {children}
        </main>
      </div>
    </div>
  );
}
