import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PerfilService from '../../services/PerfilService';
import { Phone, Lock, Eye, EyeOff, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileView() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Form states
    const [telefono, setTelefono] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('view'); // 'view' or 'edit'

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await PerfilService.getProfilePropio();
            setProfile(data);
            setTelefono(data.telefono || '');
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar la información del perfil.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        if (password && password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password && !currentPassword) {
            setError('Ingresa tu contraseña actual para poder cambiarla.');
            return;
        }

        try {
            setIsSaving(true);
            const updated = await PerfilService.updateProfile(telefono, password || null, currentPassword || null);
            setProfile(updated);
            setSuccessMessage('Perfil actualizado correctamente.');
            setCurrentPassword('');
            setPassword('');
            setConfirmPassword('');
            setActiveTab('view');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-text-muted text-sm font-semibold">Cargando perfil...</p>
            </div>
        );
    }

    const role = profile?.rol || authUser?.rol || 'Estudiante';
    const userCode = profile?.codigo || `2026${1000 + (profile?.id_usuario || authUser?.id_usuario || 1)}`;

    return (
        <div className="mx-auto py-1 px-0.5 animate-fade-in">
            {/* Header Badge/Title */}
            <div className="mb-3">
                <p className="text-text-muted mt-1">
                    Gestiona tu información personal y configuración de seguridad.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-none text-red-700 text-sm font-medium">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-none text-emerald-700 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    {successMessage}
                </div>
            )}

            {/* Profile Content Layout (Flat) */}
            <div className="space-y-6">
                {/* Header Information Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
                    <div className="w-20 h-20 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center shadow-sm shrink-0 border border-primary/10">
                        {profile?.nombres ? profile.nombres.charAt(0) : 'U'}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="font-heading text-2xl font-extrabold text-text-heading leading-tight">
                            {profile?.nombres || ''} {profile?.apellidos || 'Usuario'}
                        </h2>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-1.5">
                            <span className="font-mono text-xs font-semibold bg-bg-alt text-text-muted px-2.5 py-0.5 rounded-md border border-border">
                                @{profile?.username || 'username'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Activo
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-border">
                    <button
                        type="button"
                        className={`py-2.5 px-4 font-heading text-sm font-bold border-b-2 -mb-px transition-all duration-150 ${activeTab === 'view' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-heading'}`}
                        onClick={() => { setActiveTab('view'); setError(null); setSuccessMessage(''); }}
                    >
                        Información General
                    </button>
                    <button
                        type="button"
                        className={`py-2.5 px-4 font-heading text-sm font-bold border-b-2 -mb-px transition-all duration-150 ${activeTab === 'edit' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-heading'}`}
                        onClick={() => { setActiveTab('edit'); setError(null); setSuccessMessage(''); }}
                    >
                        Editar Cuenta
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="pt-2">
                    {activeTab === 'view' ? (
                        /* View Mode */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Código Universitario</span>
                                <span className="font-mono font-semibold text-text-heading text-base bg-bg-alt px-3 py-2.5 rounded-none border border-border block">
                                    {userCode}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Rol de Sistema</span>
                                <span className="font-semibold text-text-heading text-base bg-bg-alt px-3 py-2.5 rounded-none border border-border block">
                                    {role}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Correo Electrónico</span>
                                <span className="font-medium text-text-heading text-base bg-bg-alt px-3 py-2.5 rounded-none border border-border block truncate">
                                    {profile?.correo || `${profile?.username || 'usuario'}@uncp.edu.pe`}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Teléfono / Celular</span>
                                <span className="font-semibold text-text-heading text-base bg-bg-alt px-3 py-2.5 rounded-none border border-border block">
                                    {profile?.telefono || 'No registrado'}
                                </span>
                            </div>

                            {role === 'Estudiante' && (
                                <div>
                                    <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Ciclo Académico</span>
                                    <span className="font-semibold text-text-heading text-base bg-bg-alt px-3 py-2.5 rounded-none border border-border block">
                                        {profile?.ciclo ? `${profile.ciclo}° Ciclo` : '-'}
                                    </span>
                                </div>
                            )}

                            <div className={role === 'Estudiante' ? "" : "md:col-span-2"}>
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Institución</span>
                                <span className="font-semibold text-text-heading text-base bg-bg-alt px-3 py-2.5 rounded-none border border-border block truncate">
                                    Universidad Nacional del Centro del Perú
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* Edit Mode Form */
                        <form onSubmit={handleUpdate} className="space-y-6 max-w-xl">
                            {/* Input Teléfono */}
                            <div>
                                <label htmlFor="telefono" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                    Teléfono / Celular
                                </label>
                                <div className="relative rounded-none shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        maxLength={9}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-border rounded-none bg-bg-input text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.92rem] transition-colors"
                                        placeholder="Ej: 964111222"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-1.5">Solo disponible para roles de Estudiante o Docente.</p>
                            </div>

                            <div className="bg-bg-alt p-5 rounded-none border border-border space-y-4">
                                <h3 className="font-heading font-bold text-sm text-text-heading flex items-center gap-1.5 border-b border-border pb-3">
                                    <Lock size={16} className="text-primary" />
                                    Cambiar Contraseña
                                </h3>

                                <div className="space-y-4">
                                    {/* Contraseña Actual */}
                                    <div>
                                        <label htmlFor="current-pass" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                            Contraseña Actual
                                        </label>
                                        <div className="relative rounded-none shadow-sm">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="current-pass"
                                                className="block w-full px-3 py-2.5 border border-border rounded-none bg-bg-input text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.92rem] transition-colors"
                                                placeholder="Necesaria solo si vas a cambiar la contraseña"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Nueva Contraseña */}
                                    <div>
                                        <label htmlFor="new-pass" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative rounded-none shadow-sm">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="new-pass"
                                                className="block w-full px-3 py-2.5 border border-border rounded-none bg-bg-input text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.92rem] transition-colors"
                                                placeholder="Dejar en blanco para no cambiar"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-heading transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div>
                                        <label htmlFor="confirm-pass" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                                            Confirmar Nueva Contraseña
                                        </label>
                                        <div className="relative rounded-none shadow-sm">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="confirm-pass"
                                                className="block w-full px-3 py-2.5 border border-border rounded-none bg-bg-input text-text-heading placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.92rem] transition-colors"
                                                placeholder="Confirmar nueva contraseña"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold py-2 px-5 rounded-none text-sm shadow-sm transition-all duration-150 cursor-pointer focus:outline-none"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    className="bg-bg-alt border border-border hover:bg-slate-100 disabled:opacity-50 text-text-main font-semibold py-2 px-5 rounded-none text-sm transition-all duration-150 cursor-pointer focus:outline-none"
                                    onClick={() => { setActiveTab('view'); setError(null); setSuccessMessage(''); }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
