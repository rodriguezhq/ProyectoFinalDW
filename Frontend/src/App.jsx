import { useState, useEffect } from 'react';
import './App.css';

// Academic Modules Data - 100% compliant with requested features
const modulesData = [
  {
    id: "matricula",
    name: "Matrícula",
    icon: "📝",
    tagline: "Gestión eficiente del ciclo de matrícula estudiantil.",
    roles: [
      { name: "Estudiante", tasks: ["Solicita matrícula en línea", "Descarga ficha de matrícula oficial"] },
      { name: "Administrador", tasks: ["Valida requisitos académicos", "Registra pagos de tasas de matrícula", "Genera la ficha oficial de matrícula"] },
      { name: "Dirección", tasks: ["Supervisa estadísticas generales e indicadores de matrícula"] }
    ]
  },
  {
    id: "cursos",
    name: "Cursos y Docentes",
    icon: "📚",
    tagline: "Programación académica, sílabos y control de carga horaria.",
    roles: [
      { name: "Docente", tasks: ["Visualiza cursos asignados", "Carga y actualiza sílabos", "Registra notas en el sistema"] },
      { name: "Administrador", tasks: ["Asigna docentes a secciones", "Gestiona horarios y asignación de aulas"] },
      { name: "Dirección", tasks: ["Evalúa la carga docente institucional", "Supervisa el cumplimiento del plan de estudios"] }
    ]
  },
  {
    id: "notas",
    name: "Notas",
    icon: "📊",
    tagline: "Registro y control del rendimiento académico estudiantil.",
    roles: [
      { name: "Docente", tasks: ["Registra notas parciales y finales"] },
      { name: "Estudiante", tasks: ["Consulta de forma transparente su hoja de notas por ciclo"] },
      { name: "Administrador", tasks: ["Valida actas promocionales", "Consolida las notas en el registro central"] },
      { name: "Dirección", tasks: ["Supervisa indicadores académicos (promedios, aprobados/desaprobados)"] }
    ]
  },
  {
    id: "record",
    name: "Récord Académico",
    icon: "🎓",
    tagline: "Historial unificado y seguimiento de la trayectoria del alumno.",
    roles: [
      { name: "Estudiante", tasks: ["Accede a su historial académico completo en tiempo real"] },
      { name: "Administrador", tasks: ["Genera reportes consolidados (exportación a formato oficial)"] },
      { name: "Dirección", tasks: ["Analiza desempeño por cohorte, programa o especialidad"] }
    ]
  },
  {
    id: "certificados",
    name: "Certificados y Documentos",
    icon: "📄",
    tagline: "Trámites en línea con firmas digitales y códigos QR de verificación.",
    roles: [
      { name: "Estudiante", tasks: ["Solicita certificados de estudio y constancias en línea"] },
      { name: "Administrador", tasks: ["Emite certificados oficiales con firma digital y código QR"] },
      { name: "Dirección", tasks: ["Autoriza la emisión de documentos oficiales"] }
    ]
  },
  {
    id: "seguridad",
    name: "Administración y Seguridad",
    icon: "🛡️",
    tagline: "Control de accesos y auditoría de operaciones críticas.",
    roles: [
      { name: "Administrador", tasks: ["Define perfiles de acceso y roles (permisos del sistema)"] },
      { name: "Dirección", tasks: ["Controla auditorías y reportes estratégicos (bitácora)"] },
      { name: "Todos", tasks: ["Acceden al sistema según los permisos y roles asignados"] }
    ]
  }
];

// Standalone LandingPage Component to avoid hook nested call warnings
function LandingPage({ activeTab, setActiveTab, navigate }) {
  const activeModule = modulesData.find(m => m.id === activeTab);

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content animate-slide-up">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              Plataforma Digital Académica 2026
            </div>
            <h1 className="hero-title">
              Sistema de Gestión <span>Académica</span>
            </h1>
            <p className="hero-description">
              Gestión integral, segura e interactiva para toda la comunidad académica de la Universidad Nacional del Centro del Perú. Diseñado para optimizar procesos de matrícula, control de notas y certificación.
            </p>
            <div className="hero-actions">
              <button 
                id="btn-hero-login"
                type="button" 
                className="btn-primary" 
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </button>
              <a 
                href="#modulos" 
                className="btn-primary-outline"
                onClick={(e) => { e.preventDefault(); document.getElementById('modulos').scrollIntoView(); }}
              >
                Explorar Módulos
              </a>
            </div>
          </div>
          
          <div className="hero-image-container animate-fade-in">
            <div className="hero-glow-ring"></div>
            <div className="hero-glow-ring-2"></div>
            <div className="hero-shield-wrapper">
              <img src="/Escudo_UNCP.png" alt="Escudo UNCP Animado" className="hero-shield" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">6</div>
            <div className="stat-label">Módulos Core</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">18</div>
            <div className="stat-label">Tablas Integradas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4</div>
            <div className="stat-label">Perfiles de Rol</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Procesos Digitales</div>
          </div>
        </div>
      </section>

      {/* Interactive Modules Explorer */}
      <section id="modulos" className="modules-section">
        <div className="section-header">
          <span className="section-subtitle">Arquitectura Funcional</span>
          <h2 className="section-title">Nuestros Módulos de Gestión Académica</h2>
        </div>

        {/* Tab navigation */}
        <div className="tabs-container" role="tablist">
          {modulesData.map(m => (
            <button
              id={`tab-btn-${m.id}`}
              key={m.id}
              role="tab"
              aria-selected={activeTab === m.id}
              aria-controls={`panel-${m.id}`}
              type="button"
              className={`tab-btn ${activeTab === m.id ? 'active' : ''}`}
              onClick={() => setActiveTab(m.id)}
            >
              <span className="tab-btn-icon">{m.icon}</span>
              {m.name}
            </button>
          ))}
        </div>

        {/* Dynamic tab contents */}
        <div className="module-content-wrapper" id={`panel-${activeModule.id}`} role="tabpanel">
          <div className="module-info-card">
            <div className="module-meta-info">
              <span className="module-badge">Módulo Académico</span>
              <h3 className="module-title">{activeModule.icon} {activeModule.name}</h3>
              <p className="module-description">{activeModule.tagline}</p>
            </div>
            
            <div className="role-features-grid">
              {activeModule.roles.map((r, idx) => (
                <div key={idx} className="role-feature-card">
                  <div className="role-badge-container">
                    <span className={`role-tag ${r.name.toLowerCase().replace(/á/g, 'a').replace(/ó/g, 'o')}`}>
                      {r.name}
                    </span>
                  </div>
                  <div className="feature-list">
                    {r.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="feature-item">
                        <span className="feature-bullet">✓</span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role Highlight / Shortcut Section */}
      <section id="roles" className="roles-showcase-section">
        <div className="section-header">
          <span className="section-subtitle">Accesos Personalizados</span>
          <h2 className="section-title">Un Portal Adaptado a Cada Rol</h2>
        </div>
        <div className="roles-grid">
          <div className="role-box">
            <div className="role-icon-wrapper">👨‍🎓</div>
            <h3 className="role-box-title">Estudiantes</h3>
            <p className="role-box-desc">Gestiona matrículas, consulta notas parciales/finales, récord académico y solicita certificados.</p>
          </div>
          <div className="role-box">
            <div className="role-icon-wrapper">👩‍🏫</div>
            <h3 className="role-box-title">Docentes</h3>
            <p className="role-box-desc">Visualiza cursos asignados, carga de sílabos estructurados y registro de notas oficiales.</p>
          </div>
          <div className="role-box">
            <div className="role-icon-wrapper">🛠️</div>
            <h3 className="role-box-title">Administrativos</h3>
            <p className="role-box-desc">Configuración de accesos, validación de actas, registro de pagos y control de horarios.</p>
          </div>
          <div className="role-box">
            <div className="role-icon-wrapper">💼</div>
            <h3 className="role-box-title">Dirección</h3>
            <p className="role-box-desc">Supervisión estratégica, análisis de cohortes, auditorías generales y métricas de desempeño.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

// Standalone LoginForm Component to avoid hook nested call warnings
function LoginForm({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // Basic input validation
    if (!email.trim() || !password.trim()) {
      setAlertMsg({ type: "error", text: "Por favor complete todos los campos." });
      return;
    }

    if (!email.includes("@")) {
      setAlertMsg({ type: "error", text: "Por favor ingrese un correo institucional válido." });
      return;
    }

    setIsLoading(true);
    setAlertMsg(null);

    // Simulate a network latency login callback
    setTimeout(() => {
      setIsLoading(false);
      setAlertMsg({ 
        type: "success", 
        text: "¡Inicio de sesión exitoso! Redireccionando al portal..." 
      });
      
      // Mock successful login redirection back to Landing
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }, 1500);
  };

  return (
    <main className="login-main-section">
      <div className="login-card animate-slide-up">
        {/* Back to landing button - always visible inside card */}
        <button 
          id="btn-login-back"
          type="button" 
          className="login-back-link" 
          onClick={() => navigate('/')}
        >
          ← Volver al inicio
        </button>

        <div className="login-form-header">
          <h1 className="login-form-title">Iniciar Sesión</h1>
          <p className="login-form-subtitle">Ingresa tus credenciales institucionales para acceder</p>
        </div>

        {/* Alert Message Box */}
        {alertMsg && (
          <div className={`login-alert ${alertMsg.type}`} role="alert">
            <span>{alertMsg.type === "success" ? "✓" : "⚠"}</span>
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} id="sga-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="sga-user-email">Correo Institucional</label>
            <input
              id="sga-user-email"
              type="email"
              className="form-input"
              placeholder="usuario@uncp.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sga-user-password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="sga-user-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me" htmlFor="sga-remember">
              <input type="checkbox" id="sga-remember" className="remember-checkbox" />
              Recordarme
            </label>
            <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert("Contacto de soporte: soporte.sga@uncp.edu.pe"); }}>
              ¿Olvidó su contraseña?
            </a>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn-login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Autenticando...
              </>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

        <div className="login-form-footer">
          ¿No tienes una cuenta activa? <a href="#contacto" onClick={(e) => { e.preventDefault(); alert("Dirígete a la Oficina de Asuntos Académicos de tu facultad."); }}>Solicita acceso</a>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState("matricula");

  // Synchronize state with browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app-container">
      {/* Navigation Bar - Shared by Landing and Login */}
      <header className="main-header">
        <nav className="navbar" aria-label="Navegación Principal">
          <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/Escudo_UNCP.png" alt="Escudo de la UNCP" className="brand-logo" />
            <div className="brand-text">
              <span className="brand-title">SGA - UNCP</span>
              <span className="brand-sub">Universidad Nacional del Centro del Perú</span>
            </div>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#modulos" className="nav-link" onClick={(e) => { 
                e.preventDefault(); 
                if (currentPath !== "/") {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>
                Módulos
              </a>
            </li>
            <li>
              <a href="#roles" className="nav-link" onClick={(e) => { 
                e.preventDefault(); 
                if (currentPath !== "/") {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}>
                Roles
              </a>
            </li>
            <li>
              <a href="https://uncp.edu.pe" target="_blank" rel="noopener noreferrer" className="nav-link">
                Universidad
              </a>
            </li>
          </ul>
          <div>
            {currentPath !== "/login" && (
              <button 
                id="btn-nav-login"
                type="button" 
                className="btn-primary-outline" 
                onClick={() => navigate('/login')}
              >
                Acceder al Portal
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main View Router Switch */}
      {currentPath === "/login" ? (
        <LoginForm navigate={navigate} />
      ) : (
        <LandingPage activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      )}

      {/* Footer - Shared by Landing and Login */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/Escudo_UNCP.png" alt="Logo UNCP Blanco" className="footer-logo-img" />
            <div>
              <h4 className="footer-logo-title">SGA - UNCP</h4>
              <p className="footer-logo-sub">Facultad de Ingeniería de Sistemas</p>
            </div>
          </div>
          <div>
            <p>UNCP 2026. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
