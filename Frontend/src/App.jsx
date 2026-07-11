import { useState, useEffect } from 'react';
import DisenoPanel from './components/compartidos/DisenoPanel';
import VistaHorario from './views/horarios/VistaHorario';
import VistaPanel from './views/estadisticas/VistaPanel';
import MantenimientoAcademico from './views/academico/MantenimientoAcademico';
import UsuariosRoles from './views/usuarios/UsuariosRoles';
import Auditoria from './views/direccion/Auditoria';
import DisenoHorario from './views/academico/DisenoHorario';
import PaginaInicio from './views/compartidos/PaginaInicio';
import FormularioLogin from './views/compartidos/FormularioLogin';
import { rutasPorRol } from './constants/autenticacion';
import { Toaster } from 'sonner';

function App() {
  const [rutaActual, setRutaActual] = useState(window.location.pathname);
  const [pestanaActiva, setPestanaActiva] = useState("matricula");
  
  // Restauración síncrona de sesión para evitar parpadeos de pantalla
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("user");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const [indiceMenuActivo, setIndiceMenuActivo] = useState(0);

  const navegar = (ruta) => {
    window.history.pushState({}, '', ruta);
    setRutaActual(ruta);
    window.scrollTo(0, 0);
  };

  const manejarNavegacionPestana = (indice) => {
    if (!usuario) return;
    const rutas = rutasPorRol[usuario.rol];
    if (rutas && rutas[indice]) {
      navegar(rutas[indice]);
    }
  };

  // Sincronizar el estado con los botones de atrás/adelante del navegador
  useEffect(() => {
    const manejarCambioUbicacion = () => {
      setRutaActual(window.location.pathname);
    };
    window.addEventListener('popstate', manejarCambioUbicacion);
    return () => window.removeEventListener('popstate', manejarCambioUbicacion);
  }, []);

  const redireccionarAlPanel = (rol) => {
    if (rol === "Estudiante") navegar("/estudiante/horario");
    else if (rol === "Docente") navegar("/docente/horario");
    else if (rol === "Administrador") navegar("/administrador/dashboard");
    else if (rol === "Direccion") navegar("/direccion/dashboard");
    else navegar("/");
  };

  const esRutaPanel =
    rutaActual.startsWith("/estudiante") ||
    rutaActual.startsWith("/docente") ||
    rutaActual.startsWith("/administrador") ||
    rutaActual.startsWith("/direccion");

  // Sincronizar el índice desde la ruta URL al cargar o por popstate
  useEffect(() => {
    if (!usuario) return;
    const rol = usuario.rol;
    const rutas = rutasPorRol[rol];
    if (!rutas) return;

    const rutaBase = `/${rol.toLowerCase()}`;
    if (rutaActual === rutaBase) {
      navegar(rutas[0]);
      return;
    }

    const indice = rutas.indexOf(rutaActual);
    if (indice !== -1) {
      setIndiceMenuActivo(indice);
    }
  }, [rutaActual, usuario]);

  // Guardia Centralizada de Protección de Rutas
  useEffect(() => {
    const esPanel =
      rutaActual.startsWith("/estudiante") ||
      rutaActual.startsWith("/docente") ||
      rutaActual.startsWith("/administrador") ||
      rutaActual.startsWith("/direccion");

    if (usuario) {
      // 1. Si el usuario autenticado intenta acceder a login, redirigir a su panel
      if (rutaActual === "/login") {
        redireccionarAlPanel(usuario.rol);
      }
      
      // 2. Prevenir acceso cruzado de roles
      if (rutaActual.startsWith("/estudiante") && usuario.rol !== "Estudiante") {
        redireccionarAlPanel(usuario.rol);
      } else if (rutaActual.startsWith("/docente") && usuario.rol !== "Docente") {
        redireccionarAlPanel(usuario.rol);
      } else if (rutaActual.startsWith("/administrador") && usuario.rol !== "Administrador") {
        redireccionarAlPanel(usuario.rol);
      } else if (rutaActual.startsWith("/direccion") && usuario.rol !== "Direccion") {
        redireccionarAlPanel(usuario.rol);
      }
    } else {
      // 3. Si el usuario no está autenticado e intenta entrar al panel, redirigir a login
      if (esPanel) {
        navegar("/login");
      }
    }
  }, [rutaActual, usuario]);

  const manejarCerrarSesion = async () => {
    const urlBaseApi = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      await fetch(`${urlBaseApi}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Error al llamar al endpoint de cierre de sesión:", error);
    }
    localStorage.removeItem("user");
    setUsuario(null);
    navegar("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base animate-fade-in">
      {/* Barra de Navegación - Compartida por Inicio y Login, oculta en el Panel */}
      {!esRutaPanel && (
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-border transition-all duration-300">
          <nav className="max-w-[1200px] mx-auto px-6 h-[76px] flex items-center justify-between" aria-label="Navegación Principal">
            <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navegar('/')}>
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
                onClick={() => navegar('/')}
                className={`py-2.5 px-4 font-bold rounded-md transition-all text-[0.9rem] border cursor-pointer hover:bg-slate-100 hover:text-primary ${rutaActual === "/" ? "bg-primary-light text-primary border-primary/20" : "bg-transparent text-text-muted border-transparent"}`}
              >
                Inicio
              </button>
              
              {usuario ? (
                <button
                  id="btn-nav-dashboard"
                  type="button"
                  onClick={() => redireccionarAlPanel(usuario.rol)}
                  className="bg-primary text-white py-2.5 px-4.5 font-bold rounded-md hover:bg-primary-hover transition-colors shadow-sm text-[0.9rem] flex items-center gap-2 cursor-pointer"
                >
                  Ir al Portal <span>→</span>
                </button>
              ) : (
                <button
                  id="btn-nav-login"
                  type="button"
                  onClick={() => navegar('/login')}
                  className={`py-2.5 px-4.5 font-bold rounded-md transition-colors text-[0.9rem] cursor-pointer ${rutaActual === "/login" ? "bg-primary text-white hover:bg-primary-hover shadow-sm" : "bg-primary-light text-primary border border-primary/20 hover:bg-primary/10"}`}
                >
                  Acceder
                </button>
              )}
            </div>
          </nav>
        </header>
      )}

      {/* Ruteador e Interruptor de Vistas Principal */}
      {rutaActual === "/login" ? (
        usuario ? null : <FormularioLogin navigate={navegar} onLoginSuccess={setUsuario} />
      ) : rutaActual.startsWith("/estudiante") ? (
        usuario && usuario.rol === "Estudiante" ? (
          <DisenoPanel user={usuario} onLogout={manejarCerrarSesion} activeMenuIndex={indiceMenuActivo} setActiveMenuIndex={manejarNavegacionPestana}>
            {indiceMenuActivo === 0 ? (
              <VistaHorario isTeacher={false} />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección del portal de Estudiante estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : rutaActual.startsWith("/docente") ? (
        usuario && usuario.rol === "Docente" ? (
          <DisenoPanel user={usuario} onLogout={manejarCerrarSesion} activeMenuIndex={indiceMenuActivo} setActiveMenuIndex={manejarNavegacionPestana}>
            {indiceMenuActivo === 0 ? (
              <VistaHorario isTeacher={true} />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección del portal de Docente estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : rutaActual.startsWith("/administrador") ? (
        usuario && usuario.rol === "Administrador" ? (
          <DisenoPanel user={usuario} onLogout={manejarCerrarSesion} activeMenuIndex={indiceMenuActivo} setActiveMenuIndex={manejarNavegacionPestana}>
            {indiceMenuActivo === 0 ? (
              <VistaPanel isDirection={false} />
            ) : indiceMenuActivo === 1 ? (
              <MantenimientoAcademico />
            ) : indiceMenuActivo === 4 ? (
              <DisenoHorario />
            ) : indiceMenuActivo === 7 ? (
              <UsuariosRoles />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección de Administración estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : rutaActual.startsWith("/direccion") ? (
        usuario && usuario.rol === "Direccion" ? (
          <DisenoPanel user={usuario} onLogout={manejarCerrarSesion} activeMenuIndex={indiceMenuActivo} setActiveMenuIndex={manejarNavegacionPestana}>
            {indiceMenuActivo === 0 ? (
              <VistaPanel isDirection={true} />
            ) : indiceMenuActivo === 5 ? (
              <Auditoria />
            ) : (
              <div className="p-8 text-center text-text-muted font-medium bg-white rounded-2xl border border-border shadow-md">
                Esta sección de Dirección estará disponible próximamente.
              </div>
            )}
          </DisenoPanel>
        ) : null
      ) : (
        <PaginaInicio activeTab={pestanaActiva} setActiveTab={setPestanaActiva} navigate={navegar} />
      )}

      {/* Pie de Página - Compartido por Inicio y Login, oculto en el Panel */}
      {!esRutaPanel && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-auto">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-8 mb-6 gap-5 md:gap-0 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start cursor-pointer" onClick={() => navegar('/')}>
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
