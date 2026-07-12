import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import imageUncp from '../src/assets/Escudo_UNCP.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ROLE_ROUTES } from './constants/roles';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await login(email, password);
            if (user) {
                const route = ROLE_ROUTES[user.rol];
                if (route) {
                    toast.success(`¡Bienvenido al sistema, ${user.nombres || user.username}!`);
                    navigate(route);
                } else {
                    toast.error("Rol de usuario no reconocido en el sistema.");
                }
            } else {
                toast.error("Credenciales incorrectas");
            }
        } catch (error) {
            toast.error("Credenciales incorrectas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-bg-alt relative overflow-hidden font-sans antialiased">
            <div className="w-full max-w-[440px] px-6 z-10">
                <div className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    
                    {/* Encabezado con Logo o Escudo */}
                    <div className="flex flex-col items-center mb-5">
                        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-4 border border-primary/10">
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
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Input de Correo */}
                        <div className="relative">
                            <label
                                htmlFor="email"
                                className="block text-[0.85rem] font-semibold text-text-heading mb-1.5"
                            >
                                Correo Institucional
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-text-muted">
                                    <User size={18} />
                                </span>
                                <input
                                    id="email"
                                    type="text"
                                    required
                                    placeholder="ej. correo@uncp.edu.pe o usuario"
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