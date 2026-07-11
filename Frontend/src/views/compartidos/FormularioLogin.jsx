import React, { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function FormularioLogin({ navigate, onLoginSuccess }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvioLogin = async (e) => {
    e.preventDefault();
    
    // Validación básica de entradas
    if (!correo.trim() || !contrasena.trim()) {
      toast.error("Por favor complete todos los campos.");
      return;
    }

    setEstaCargando(true);

    // Permitir tanto el nombre de usuario directo como los prefijos de correo institucional
    const username = correo.includes("@") ? correo.split("@")[0] : correo;

    const urlBaseApi = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      const respuesta = await fetch(`${urlBaseApi}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password: contrasena })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        toast.error(datos.msg || "Usuario o contraseña incorrectos.");
        setEstaCargando(false);
        return;
      }

      // Guardar información del usuario (los tokens son manejados de forma segura por cookies HttpOnly)
      localStorage.setItem("user", JSON.stringify(datos.user));
      
      // Actualizar el estado de sesión de la aplicación
      onLoginSuccess(datos.user);

      toast.success("¡Inicio de sesión exitoso! Accediendo al portal...");

      // Retraso de redirección para una mejor experiencia de usuario
      setTimeout(() => {
        setEstaCargando(false);
        const rol = datos.user.rol;
        if (rol === "Estudiante") navigate("/estudiante");
        else if (rol === "Docente") navigate("/docente");
        else if (rol === "Administrador") navigate("/administrador");
        else if (rol === "Direccion") navigate("/direccion");
        else navigate("/");
      }, 1200);

    } catch (error) {
      console.error(error);
      toast.error("No se pudo conectar con el servidor. Por favor, asegúrese de que el backend esté ejecutándose.");
      setEstaCargando(false);
    }
  };

  return (
    <main className="flex-grow flex justify-center items-center py-20 px-6 bg-[radial-gradient(circle_at_10%_20%,var(--color-primary-light)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(239,193,26,0.04)_0%,transparent_40%)] relative min-h-[calc(100vh-76px-146px)] animate-fade-in">
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-border p-8 md:p-10 shadow-xl animate-slide-up z-10">
        {/* Botón para volver a la página de inicio */}
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

        {/* Formulario */}
        <form onSubmit={manejarEnvioLogin} id="sga-login-form">
          <div className="mb-5 relative">
            <label className="block text-[0.85rem] font-semibold text-text-heading mb-1.5" htmlFor="sga-user-email">Usuario / Correo Institucional</label>
            <input
              id="sga-user-email"
              type="text"
              className="w-full py-3 px-4 bg-bg-alt border border-border rounded-md text-text-heading text-[0.95rem] transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              placeholder="usuario@uncp.edu.pe o admin"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={estaCargando}
              required
            />
          </div>

          <div className="mb-5 relative">
            <label className="block text-[0.85rem] font-semibold text-text-heading mb-1.5" htmlFor="sga-user-password">Contraseña</label>
            <div className="relative flex items-center">
              <input
                id="sga-user-password"
                type={mostrarContrasena ? "text" : "password"}
                className="w-full py-3 px-4 bg-bg-alt border border-border rounded-md text-text-heading text-[0.95rem] transition-all duration-300 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                disabled={estaCargando}
                required
              />
              <button
                type="button"
                className="absolute right-3.5 text-text-muted cursor-pointer bg-none border-none flex items-center justify-center hover:text-primary"
                aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
              >
                {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
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
            disabled={estaCargando}
          >
            {estaCargando ? (
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
