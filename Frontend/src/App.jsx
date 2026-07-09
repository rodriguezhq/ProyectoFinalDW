import { useState, useEffect } from 'react';
import DisenoPanel from './components/DisenoPanel';
import VistaHorario from './components/horarios/VistaHorario';
import VistaPanel from './components/estadisticas/VistaPanel';
import MantenimientoAcademico from './components/academico/MantenimientoAcademico';
import { Toaster, toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

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
      <section className="relative bg-[radial-gradient(circle_at_80%_20%,var(--color-primary-light)_0%,transparent_45%)] py-20 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-slide-up text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-[0.85rem] font-semibold py-1.5 px-3.5 rounded-full mb-5 border border-primary/12">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-gold"></span>
              Plataforma Digital Académica 2026
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-text-heading mb-5 leading-[1.15]">
              Sistema de Gestión <span className="text-primary relative after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-accent/25 after:-z-10">Académica</span>
            </h1>
            <p className="text-[1.125rem] text-text-main mb-9 max-w-[580px] mx-auto md:mx-0 leading-relaxed">
              Gestión integral, segura e interactiva para toda la comunidad académica de la Universidad Nacional del Centro del Perú. Diseñado para optimizar procesos de matrícula, control de notas y certificación.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button 
                id="btn-hero-login"
                type="button" 
                className="bg-primary text-white py-2.5 px-6 font-semibold rounded-md transition-all duration-300 inline-flex items-center gap-2 shadow-[0_4px_14px_rgba(13,82,44,0.18)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(13,82,44,0.25)]" 
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </button>
              <a 
                href="#modulos" 
                className="text-primary border-2 border-primary py-2 px-5 font-semibold rounded-md transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_4px_12px_rgba(13,82,44,0.15)]"
                onClick={(e) => { e.preventDefault(); document.getElementById('modulos').scrollIntoView(); }}
              >
                Explorar Módulos
              </a>
            </div>
          </div>
          
          <div className="relative flex justify-center items-center animate-fade-in">
            <div className="absolute w-[380px] h-[380px] rounded-full border-2 border-dashed border-primary/15 animate-spin-slow z-0"></div>
            <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-accent/25 animate-spin-slow-reverse z-0"></div>
            <div className="relative z-10 animate-float">
              <img src="/Escudo_UNCP.png" alt="Escudo UNCP Animado" className="max-w-[320px] w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 px-6 bg-bg-alt border-t border-b border-border">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">6</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Módulos Core</div>
          </div>
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">18</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Tablas Integradas</div>
          </div>
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">4</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Perfiles de Rol</div>
          </div>
          <div className="text-center p-4 relative after:hidden md:after:block after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-[1px] after:bg-border last:after:hidden">
            <div className="font-heading text-[2.5rem] font-extrabold text-primary leading-none mb-1.5">100%</div>
            <div className="text-[0.9rem] font-semibold text-text-muted uppercase tracking-wider">Procesos Digitales</div>
          </div>
        </div>
      </section>

      {/* Interactive Modules Explorer */}
      <section id="modulos" className="py-24 px-6 max-w-[1200px] mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-primary block text-[0.9rem] font-bold uppercase tracking-[1.5px] mb-3">Arquitectura Funcional</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-heading tracking-tight max-w-[600px] mx-auto">Nuestros Módulos de Gestión Académica</h2>
        </div>

        {/* Tab navigation */}
        <div className="bg-bg-alt p-2 rounded-xl border border-border mb-10 flex gap-1 overflow-x-auto scrollbar-none" role="tablist">
          {modulesData.map(m => (
            <button
              id={`tab-btn-${m.id}`}
              key={m.id}
              role="tab"
              aria-selected={activeTab === m.id}
              aria-controls={`panel-${m.id}`}
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-md text-[0.95rem] font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === m.id ? 'text-white bg-primary shadow-[0_4px_12px_rgba(13,82,44,0.15)]' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
              onClick={() => setActiveTab(m.id)}
            >
              <span className="text-[1.1rem]">{m.icon}</span>
              {m.name}
            </button>
          ))}
        </div>

        {/* Dynamic tab contents */}
        <div className="animate-slide-up" id={`panel-${activeModule.id}`} role="tabpanel">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-10 items-start">
            <div className="flex flex-col gap-4">
              <span className="self-start text-[0.75rem] font-bold uppercase tracking-wider py-1 px-2.5 rounded bg-primary-light text-primary">Módulo Académico</span>
              <h3 className="text-2xl md:text-[1.85rem] font-bold text-text-heading">{activeModule.icon} {activeModule.name}</h3>
              <p className="text-text-muted text-base leading-relaxed">{activeModule.tagline}</p>
            </div>
            
            <div className="flex flex-col gap-5">
              {activeModule.roles.map((r, idx) => (
                <div key={idx} className="bg-bg-alt rounded-md p-5 border border-border transition-all duration-300 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-5 items-center hover:translate-x-1.5 hover:border-primary/20 hover:bg-white hover:shadow-md">
                  <div className="flex flex-col items-center">
                    <span className={`text-[0.75rem] font-bold uppercase tracking-wider py-1 px-3 rounded-full text-center w-full ${r.name === 'Estudiante' ? 'bg-blue-500/10 text-blue-600' : r.name === 'Docente' ? 'bg-purple-500/10 text-purple-600' : r.name === 'Administrador' ? 'bg-amber-500/10 text-amber-600' : r.name === 'Dirección' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-600'}`}>
                      {r.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {r.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2.5 text-[0.95rem] text-text-main justify-center md:justify-start">
                        <span className="text-primary font-bold text-base leading-none mt-0.5">✓</span>
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
      <section id="roles" className="py-20 px-6 bg-bg-alt border-t border-b border-border">
        <div className="text-center mb-14">
          <span className="text-primary block text-[0.9rem] font-bold uppercase tracking-[1.5px] mb-3">Accesos Personalizados</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-heading tracking-tight max-w-[600px] mx-auto">Un Portal Adaptado a Cada Rol</h2>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">👨‍🎓</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Estudiantes</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Gestiona matrículas, consulta notas parciales/finales, récord académico y solicita certificados.</p>
          </div>
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">👩‍🏫</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Docentes</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Visualiza cursos asignados, carga de sílabos estructurados y registro de notas oficiales.</p>
          </div>
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">🛠️</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Administrativos</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Configuración de accesos, validación de actas, registro de pagos y control de horarios.</p>
          </div>
          <div className="group bg-white rounded-xl p-8 px-6 border border-border transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg hover:border-primary">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5 bg-primary-light text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white">💼</div>
            <h3 className="text-lg font-bold mb-2 text-text-heading">Dirección</h3>
            <p className="text-[0.88rem] text-text-muted leading-relaxed">Supervisión estratégica, análisis de cohortes, auditorías generales y métricas de desempeño.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

// Standalone LoginForm Component to avoid hook nested call warnings
function LoginForm({ navigate, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Basic input validation
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor complete todos los campos.");
      return;
    }

    setIsLoading(true);

    // Support both direct username and institutional email prefixes
    const username = email.includes("@") ? email.split("@")[0] : email;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.msg || "Usuario o contraseña incorrectos.");
        setIsLoading(false);
        return;
      }

      // Save user information (tokens are securely handled by HttpOnly cookies)
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Update app session state
      onLoginSuccess(data.user);

      toast.success("¡Inicio de sesión exitoso! Accediendo al portal...");

      // Redirection delay for user experience
      setTimeout(() => {
        setIsLoading(false);
        const role = data.user.rol;
        if (role === "Estudiante") navigate("/estudiante");
        else if (role === "Docente") navigate("/docente");
        else if (role === "Administrador") navigate("/administrador");
        else if (role === "Direccion") navigate("/direccion");
        else navigate("/");
      }, 1200);

    } catch (err) {
      console.error(err);
      toast.error("No se pudo conectar con el servidor. Por favor, asegúrese de que el backend esté ejecutándose.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex justify-center items-center py-20 px-6 bg-[radial-gradient(circle_at_10%_20%,var(--color-primary-light)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(239,193,26,0.04)_0%,transparent_40%)] relative min-h-[calc(100vh-76px-146px)] animate-fade-in">
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-border p-8 md:p-10 shadow-xl animate-slide-up z-10">
        {/* Back to landing button - always visible inside card */}
        <button 
          id="btn-login-back"
          type="button" 
          className="inline-flex items-center gap-2 text-primary font-semibold text-[0.9rem] mb-6 transition-all duration-300 hover:text-primary-hover hover:-translate-x-1" 
          onClick={() => navigate('/')}
        >
          ← Volver al inicio
        </button>

        <div className="mb-6">
          <h1 className="text-[1.85rem] font-bold text-text-heading mb-2 tracking-tight">Iniciar Sesión</h1>
          <p className="text-text-muted text-[0.95rem]">Ingresa tus credenciales institucionales para acceder</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} id="sga-login-form">
          <div className="mb-5 relative">
            <label className="block text-[0.85rem] font-semibold text-text-heading mb-1.5" htmlFor="sga-user-email">Usuario / Correo Institucional</label>
            <input
              id="sga-user-email"
              type="text"
              className="w-full py-3 px-4 bg-bg-alt border border-border rounded-md text-text-heading text-[0.95rem] transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              placeholder="usuario@uncp.edu.pe o admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-5 relative">
            <label className="block text-[0.85rem] font-semibold text-text-heading mb-1.5" htmlFor="sga-user-password">Contraseña</label>
            <div className="relative flex items-center">
              <input
                id="sga-user-password"
                type={showPassword ? "text" : "password"}
                className="w-full py-3 px-4 bg-bg-alt border border-border rounded-md text-text-heading text-[0.95rem] transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="absolute right-3.5 text-text-muted cursor-pointer bg-none border-none flex items-center justify-center hover:text-primary"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6 text-[0.85rem]">
            <a href="#forgot" className="text-primary font-semibold hover:text-primary-hover hover:underline" onClick={(e) => { e.preventDefault(); toast.info("Contacto de soporte: soporte.sga@uncp.edu.pe"); }}>
              ¿Olvidó su contraseña?
            </a>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="w-full bg-primary text-white py-3.5 font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(13,82,44,0.15)] hover:bg-primary-hover hover:shadow-[0_6px_20px_rgba(13,82,44,0.22)] disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
                Autenticando...
              </>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[0.85rem] text-text-muted">
          ¿No tienes una cuenta activa? <a href="#contacto" className="text-primary font-semibold hover:underline" onClick={(e) => { e.preventDefault(); toast.info("Dirígete a la Oficina de Asuntos Académicos de tu facultad."); }}>Solicita acceso</a>
        </div>
      </div>
    </main>
  );
}

const pathsPorRol = {
  Estudiante: [
    "/estudiante/horario",
    "/estudiante/matricula",
    "/estudiante/ficha",
    "/estudiante/notas",
    "/estudiante/record",
    "/estudiante/certificados"
  ],
  Docente: [
    "/docente/horario",
    "/docente/cursos",
    "/docente/notas-registrar",
    "/docente/notas-estudiante",
    "/docente/notas-seccion"
  ],
  Administrador: [
    "/administrador/dashboard",
    "/administrador/mantenimiento",
    "/administrador/matriculas",
    "/administrador/pagos",
    "/administrador/docentes",
    "/administrador/actas",
    "/administrador/certificados",
    "/administrador/usuarios"
  ],
  Direccion: [
    "/direccion/dashboard",
    "/direccion/matriculas",
    "/direccion/docentes",
    "/direccion/cohortes",
    "/direccion/certificados",
    "/direccion/auditoria"
  ]
};

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState("matricula");
  
  // Synchronous session restore to avoid screen flashes
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeMenuIndex, setActiveMenuIndex] = useState(0);

  const handleTabNavigation = (index) => {
    if (!user) return;
    const paths = pathsPorRol[user.rol];
    if (paths && paths[index]) {
      navigate(paths[index]);
    }
  };

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

  const redirectToDashboard = (role) => {
    if (role === "Estudiante") navigate("/estudiante/horario");
    else if (role === "Docente") navigate("/docente/horario");
    else if (role === "Administrador") navigate("/administrador/dashboard");
    else if (role === "Direccion") navigate("/direccion/dashboard");
    else navigate("/");
  };

  const isDashboardRoute =
    currentPath.startsWith("/estudiante") ||
    currentPath.startsWith("/docente") ||
    currentPath.startsWith("/administrador") ||
    currentPath.startsWith("/direccion");

  // Sync index from URL path on load or popstate
  useEffect(() => {
    if (!user) return;
    const role = user.rol;
    const paths = pathsPorRol[role];
    if (!paths) return;

    const baseRoute = `/${role.toLowerCase()}`;
    if (currentPath === baseRoute) {
      navigate(paths[0]);
      return;
    }

    const index = paths.indexOf(currentPath);
    if (index !== -1) {
      setActiveMenuIndex(index);
    }
  }, [currentPath, user]);

  // Centralized Route Protection Guard
  useEffect(() => {
    const isDashboard =
      currentPath.startsWith("/estudiante") ||
      currentPath.startsWith("/docente") ||
      currentPath.startsWith("/administrador") ||
      currentPath.startsWith("/direccion");

    if (user) {
      // 1. If authenticated user attempts to access login, redirect to their dashboard
      if (currentPath === "/login") {
        redirectToDashboard(user.rol);
      }
      
      // 2. Prevent role-mismatch access
      if (currentPath.startsWith("/estudiante") && user.rol !== "Estudiante") {
        redirectToDashboard(user.rol);
      } else if (currentPath.startsWith("/docente") && user.rol !== "Docente") {
        redirectToDashboard(user.rol);
      } else if (currentPath.startsWith("/administrador") && user.rol !== "Administrador") {
        redirectToDashboard(user.rol);
      } else if (currentPath.startsWith("/direccion") && user.rol !== "Direccion") {
        redirectToDashboard(user.rol);
      }
    } else {
      // 3. If unauthenticated user attempts to access any dashboard path, redirect to login
      if (isDashboard) {
        navigate("/login");
      }
    }
  }, [currentPath, user]);

  const handleLogout = async () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Error calling logout endpoint:", err);
    }
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base animate-fade-in">
      {/* Navigation Bar - Shared by Landing and Login, hidden in Dashboard */}
      {!isDashboardRoute && (
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-border transition-all duration-300">
          <nav className="max-w-[1200px] mx-auto px-6 h-[76px] flex items-center justify-between" aria-label="Navegación Principal">
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
              <img src="/Escudo_UNCP.png" alt="Escudo de la UNCP" className="h-12 w-auto drop-shadow-sm" />
              <div className="flex flex-col">
                <span className="font-heading text-[1.15rem] font-bold text-primary tracking-tight leading-none">
                  <span className="sm:hidden">UNCP</span>
                  <span className="hidden sm:inline">SGA - UNCP</span>
                </span>
                <span className="hidden sm:block text-[0.72rem] text-text-muted font-medium tracking-wider uppercase">Universidad Nacional del Centro del Perú</span>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <button 
                id="btn-nav-landing"
                type="button"
                onClick={() => navigate('/')}
                className={`py-2.5 px-4 font-bold rounded-md transition-all text-[0.9rem] border cursor-pointer hover:bg-slate-100 hover:text-primary ${currentPath === "/" ? "bg-primary-light text-primary border-primary/20" : "bg-transparent text-text-muted border-transparent"}`}
              >
                Inicio
              </button>
              
              {user ? (
                <button
                  id="btn-nav-dashboard"
                  type="button"
                  onClick={() => redirectToDashboard(user.rol)}
                  className="bg-primary text-white py-2.5 px-4.5 font-bold rounded-md hover:bg-primary-hover transition-colors shadow-sm text-[0.9rem] flex items-center gap-2 cursor-pointer"
                >
                  Ir al Portal <span>→</span>
                </button>
              ) : (
                <button
                  id="btn-nav-login"
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`py-2.5 px-4.5 font-bold rounded-md transition-colors text-[0.9rem] cursor-pointer ${currentPath === "/login" ? "bg-primary text-white hover:bg-primary-hover shadow-sm" : "bg-primary-light text-primary border border-primary/20 hover:bg-primary/10"}`}
                >
                  Acceder
                </button>
              )}
            </div>
          </nav>
        </header>
      )}

      {/* Main View Router Switch */}
      {currentPath === "/login" ? (
        user ? null : <LoginForm navigate={navigate} onLoginSuccess={setUser} />
      ) : currentPath.startsWith("/estudiante") ? (
        user && user.rol === "Estudiante" ? (
          <DisenoPanel user={user} onLogout={handleLogout} activeMenuIndex={activeMenuIndex} setActiveMenuIndex={handleTabNavigation}>
            {activeMenuIndex === 0 ? (
              <VistaHorario isTeacher={false} onSessionExpired={handleLogout} />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección del portal de Estudiante estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : currentPath.startsWith("/docente") ? (
        user && user.rol === "Docente" ? (
          <DisenoPanel user={user} onLogout={handleLogout} activeMenuIndex={activeMenuIndex} setActiveMenuIndex={handleTabNavigation}>
            {activeMenuIndex === 0 ? (
              <VistaHorario isTeacher={true} onSessionExpired={handleLogout} />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección del portal de Docente estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : currentPath.startsWith("/administrador") ? (
        user && user.rol === "Administrador" ? (
          <DisenoPanel user={user} onLogout={handleLogout} activeMenuIndex={activeMenuIndex} setActiveMenuIndex={handleTabNavigation}>
            {activeMenuIndex === 0 ? (
              <VistaPanel isDirection={false} />
            ) : activeMenuIndex === 1 ? (
              <MantenimientoAcademico />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección de Administración estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : currentPath.startsWith("/direccion") ? (
        user && user.rol === "Direccion" ? (
          <DisenoPanel user={user} onLogout={handleLogout} activeMenuIndex={activeMenuIndex} setActiveMenuIndex={handleTabNavigation}>
            {activeMenuIndex === 0 ? (
              <VistaPanel isDirection={true} />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección de Dirección estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : (
        <LandingPage activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />
      )}

      {/* Footer - Shared by Landing and Login, hidden in Dashboard */}
      {!isDashboardRoute && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-auto">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-8 mb-6 gap-5 md:gap-0 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start cursor-pointer" onClick={() => navigate('/')}>
              <img src="/Escudo_UNCP.png" alt="Logo UNCP Blanco" className="h-10 w-auto brightness-0 invert" />
              <div>
                <h4 className="font-heading text-white text-[1.1rem]">SGA - UNCP</h4>
                <p className="text-[0.72rem] text-slate-500">Facultad de Ingeniería de Sistemas</p>
              </div>
            </div>
            <div>
              <p>UNCP 2026. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      )}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
