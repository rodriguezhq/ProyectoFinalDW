import { useState } from 'react';
import { Eye, EyeOff, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import imageUncp from '../src/assets/Escudo_UNCP.png';
export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-alt relative overflow-hidden font-sans antialiased ">

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,var(--color-primary-light)_0%,transparent_70%)] opacity-70 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(239,193,26,0.08)_0%,transparent_70%)] opacity-70 z-0"></div>

      <div className="w-full max-w-[440px] px-6 z-10">

        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">

          {/* Encabezado con Logo o Escudo */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-4 border border-primary/10 animate-float">
              <img
                src={imageUncp}
                alt="Escudo de la UNCP"
                className="w-14 h-auto drop-shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-heading text-center tracking-tight">
              SGA <span className="text-primary font-bold">UNCP</span>
            </h1>
            <p className="text-text-muted text-[0.88rem] mt-1.5 text-center">
              Sistema de Gestión Académica institucional
            </p>
          </div>
          {/* Formulario */}
          <form onSubmit={() => { }} className="space-y-4">

            {/* Input de Correo */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-[0.85rem] font-semibold text-text-heading mb-1.5"
              >
                Correo Institucional
              </label>
              <div className="relative flex items-center ">
                <span className="absolute left-3 text-text-muted">
                  <User size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="ej. correo@uncp.edu.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full py-2.5 pl-11 pr-4 bg-bg-alt border border-border rounded-lg text-text-heading text-[0.95rem] transition-all duration-300 placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Input de Contraseña */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[0.85rem] font-semibold text-text-heading"
                >
                  Contraseña
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert("Contacto de soporte: soporte.sga@uncp.edu.pe"); }}
                  className="text-[0.8rem] font-semibold text-primary hover:text-primary-hover hover:underline"
                >
                  ¿La olvidaste?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-text-muted">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full py-2.5 pl-11 pr-12 bg-bg-alt border border-border rounded-lg text-text-heading text-[0.95rem] transition-all duration-300 placeholder:text-text-muted/65 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 text-text-muted cursor-pointer bg-none border-none p-1 flex items-center justify-center hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2.5 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(13,82,44,0.15)] hover:bg-primary-hover hover:shadow-[0_6px_20px_rgba(13,82,44,0.22)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
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
          {/* Caja de Notificaciones */}
          {notification && (
            <div className={`p-4 rounded-lg text-[0.88rem] font-medium mb-6 flex items-start gap-3 border ${notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
              } animate-scale-in`}>
              <span className="mt-0.5 shrink-0">
                {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </span>
              <span>{notification.message}</span>
            </div>
          )}
          {/* Footer de la tarjeta */}
          <div className="mt-5 text-center text-[0.85rem] text-text-muted">
            ¿No tienes cuenta activa?{" "}
            <a
              href="#contacto"
              onClick={(e) => { e.preventDefault(); alert("Dirígete a la Oficina de Asuntos Académicos de tu facultad."); }}
              className="text-primary font-semibold hover:underline"
            >
              Solicita acceso
            </a>
          </div>

        </div>

        {/* Créditos institucionales */}
        <p className="mt-6 text-center text-text-muted/60 text-[0.75rem]">
          © 2026 Universidad Nacional del Centro del Perú. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}