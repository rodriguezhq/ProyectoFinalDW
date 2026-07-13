import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PerfilService from '../../services/PerfilService';
import { obtenerNotasEstudiante } from '../../services/servicioNotas';
import { FileSpreadsheet, Loader2, Award, BookOpen, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function GradesView() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        cargarInformacionNotas();
    }, []);

    const cargarInformacionNotas = async () => {
        try {
            setIsLoading(true);
            
            // 1. Obtener perfil completo para asegurar que tenemos el id_estudiante
            const profileData = await PerfilService.getProfilePropio();
            setProfile(profileData);

            if (!profileData.id_estudiante) {
                toast.error('Este usuario no tiene un registro de estudiante vinculado.');
                setIsLoading(false);
                return;
            }

            // 2. Cargar notas del estudiante
            const listadoNotas = await obtenerNotasEstudiante(profileData.id_estudiante);
            setNotes(listadoNotas);

            // 3. Extraer los periodos académicos únicos disponibles en sus notas
            const periodosUnicos = [...new Set(listadoNotas.map(n => n.periodo_nombre))].sort().reverse();
            setPeriods(periodosUnicos);
            
            if (periodosUnicos.length > 0) {
                setSelectedPeriod(periodosUnicos[0]); // Seleccionar el periodo más reciente por defecto
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'No se pudo cargar la información de calificaciones.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar notas por el periodo seleccionado
    const notasFiltradas = notes.filter(n => n.periodo_nombre === selectedPeriod);

    // Calcular estadísticas simples del periodo actual
    const numCursos = notasFiltradas.length;
    const notasValidas = notasFiltradas.filter(n => n.promedio !== null);
    const promedioSimple = notasValidas.length > 0
        ? (notasValidas.reduce((sum, n) => sum + n.promedio, 0) / notasValidas.length).toFixed(2)
        : '0.00';
    const aprobados = notasFiltradas.filter(n => n.estado === 'aprobada').length;
    const desaprobados = notasFiltradas.filter(n => n.estado === 'desaprobada').length;

    const renderEstadoBadge = (estado) => {
        switch (estado) {
            case 'aprobada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aprobado
                    </span>
                );
            case 'desaprobada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        Desaprobado
                    </span>
                );
            case 'registrada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Registrada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold bg-slate-50 text-text-muted border border-border">
                        Sin Notas
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-text-muted text-sm font-semibold">Cargando libreta de calificaciones...</p>
            </div>
        );
    }

    if (!profile?.id_estudiante) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center">
                <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
                <p className="font-bold text-red-800">Acceso No Autorizado</p>
                <p className="text-sm text-red-700 mt-1">Este panel de calificaciones solo está disponible para usuarios con perfil de Estudiante.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto py-1 px-0.5 lg:px-2 space-y-3 animate-fade-in">
            {/* Cabecera */}
            <div className="pb-2 border-b border-border">
                <h1 className="font-heading text-2xl font-extrabold text-text-heading leading-tight">
                    Boleta de Calificaciones
                </h1>
                <p className="text-text-muted text-sm mt-1">
                    Consulta tus notas parciales, exámenes finales y promedios finales organizados por ciclo académico.
                </p>
            </div>

            {notes.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-none text-center">
                    <p className="font-bold text-amber-800">No se encontraron notas registradas</p>
                    <p className="text-sm text-amber-700 mt-1">Aún no cuentas con historial de calificaciones en el sistema.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Selector de Periodo y Resumen del Estudiante */}
                    <div className="bg-bg-alt p-3 border border-border rounded-none flex flex-col md:flex-row justify-between items-center gap-2">
                        <div className="flex flex-col text-left w-full md:w-auto">
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Estudiante</span>
                            <span className="font-bold text-text-heading text-base mt-0.5">
                                {profile.nombres} {profile.apellidos}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <span className="font-heading font-extrabold text-text-heading text-sm uppercase tracking-wider shrink-0">
                                Ciclo Académico:
                            </span>
                            <select
                                className="w-48 py-2 px-3 bg-white border border-border rounded-lg text-text-heading text-[0.88rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm cursor-pointer transition-colors"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                            >
                                {periods.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Fichas de Estadísticas Rápidas del Ciclo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div className="bg-white border border-border p-3 rounded-none shadow-none flex items-center gap-2">
                            <div className="w-10 h-10 rounded-none bg-primary-light text-primary flex items-center justify-center shrink-0">
                                <BookOpen size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Cursos del Ciclo</span>
                                <span className="font-heading font-extrabold text-[1.38rem] text-text-heading leading-tight">{numCursos}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-border p-3 rounded-none shadow-none flex items-center gap-2">
                            <div className="w-10 h-10 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                <Award size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Promedio Simple</span>
                                <span className="font-heading font-extrabold text-[1.38rem] text-emerald-600 leading-tight">{promedioSimple}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-border p-3 rounded-none shadow-none flex items-center gap-2">
                            <div className="w-10 h-10 rounded-none bg-emerald-50/50 text-emerald-600 flex items-center justify-center shrink-0">
                                <span className="text-lg font-bold">✓</span>
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Aprobados</span>
                                <span className="font-heading font-extrabold text-[1.38rem] text-emerald-600 leading-tight">{aprobados}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-border p-3 rounded-none shadow-none flex items-center gap-2">
                            <div className="w-10 h-10 rounded-none bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
                                <span className="text-lg font-bold">✗</span>
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Desaprobados</span>
                                <span className="font-heading font-extrabold text-[1.38rem] text-red-500 leading-tight">{desaprobados}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Calificaciones con Scroll Aislado */}
                    <div className="bg-white border border-border p-3 rounded-none shadow-none space-y-2">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <FileSpreadsheet className="text-primary" size={20} />
                            <h3 className="font-heading font-extrabold text-text-heading text-base">
                                Calificaciones Detalladas — {selectedPeriod}
                            </h3>
                        </div>

                        <div className="w-full overflow-x-auto border border-border rounded-none shadow-none">
                            <div 
                                className="overflow-y-auto max-h-[380px] min-w-[900px]" 
                                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(13,82,44,0.2) transparent' }}
                            >
                                <table className="w-full text-left border-collapse text-[0.88rem]">
                                    <thead className="bg-bg-alt text-text-heading font-extrabold sticky top-0 z-10 border-b border-border shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                        <tr>
                                            <th className="p-4 bg-bg-alt">Código</th>
                                            <th className="p-4 bg-bg-alt">Asignatura</th>
                                            <th className="p-4 bg-bg-alt">Docente</th>
                                            <th className="p-4 text-center bg-bg-alt w-[90px]">Parcial 1</th>
                                            <th className="p-4 text-center bg-bg-alt w-[90px]">Parcial 2</th>
                                            <th className="p-4 text-center bg-bg-alt w-[90px]">Ex. Final</th>
                                            <th className="p-4 text-center bg-bg-alt w-[90px]">Ex. Sust.</th>
                                            <th className="p-4 text-center bg-bg-alt w-[90px]">Promedio</th>
                                            <th className="p-4 text-center bg-bg-alt w-[110px]">Estado</th>
                                            <th className="p-4 text-center bg-bg-alt w-[120px]">Sílabo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-white">
                                        {notasFiltradas.map((item) => {
                                            const esAprobado = item.promedio !== null && item.promedio >= 10.5;
                                            const colorPromedio = item.promedio === null 
                                                ? 'text-text-muted font-mono' 
                                                : (esAprobado ? 'text-emerald-600 font-extrabold font-mono' : 'text-red-600 font-extrabold font-mono');

                                            return (
                                                <tr key={item.id_matricula_detalle} className="hover:bg-bg-alt/45 transition-colors">
                                                    <td className="p-4 font-mono text-xs font-semibold text-text-muted">
                                                        {item.curso_codigo || 'CURSO'}
                                                    </td>
                                                    <td className="p-4 font-bold text-text-heading">
                                                        {item.curso_nombre}
                                                    </td>
                                                    <td className="p-4 text-text-main">
                                                        {item.docente_nombre || 'Docente sin asignar'}
                                                    </td>
                                                    <td className="p-4 text-center font-mono">
                                                        {item.parcial1 !== null ? item.parcial1.toFixed(1) : '-'}
                                                    </td>
                                                    <td className="p-4 text-center font-mono">
                                                        {item.parcial2 !== null ? item.parcial2.toFixed(1) : '-'}
                                                    </td>
                                                    <td className="p-4 text-center font-mono">
                                                        {item.final !== null ? item.final.toFixed(1) : '-'}
                                                    </td>
                                                    <td className="p-4 text-center font-mono">
                                                        {item.sustitutorio !== null ? item.sustitutorio.toFixed(1) : '-'}
                                                    </td>
                                                    <td className={`p-4 text-center ${colorPromedio}`}>
                                                        {item.promedio !== null ? item.promedio.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {renderEstadoBadge(item.estado)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {item.silabo_archivo ? (
                                                            <a
                                                                href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${item.silabo_archivo}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <Download size={13} />
                                                                Descargar
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-text-light italic font-normal">
                                                                No disponible
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
