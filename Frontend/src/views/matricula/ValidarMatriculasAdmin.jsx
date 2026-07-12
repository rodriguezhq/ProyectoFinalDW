import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Loader2, 
    FileText, 
    Search, 
    Filter, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { listarMatriculasAdmin } from '../../services/servicioMatriculaAdmin';
import { consultarApi } from '../../services/clienteApi';

export default function ValidarMatriculasAdmin() {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [matriculas, setMatriculas] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    
    // Estados de filtros
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('pendiente');
    const [filtroCiclo, setFiltroCiclo] = useState('');
    const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
    
    const [especialidades, setEspecialidades] = useState([]);

    const inicializarDatos = async () => {
        try {
            setCargando(true);
            
            // Cargar periodos
            const resPeriodos = await consultarApi('/api/admin/periodos/', { method: 'GET' });
            const datosPeriodos = resPeriodos.ok ? await resPeriodos.json() : null;
            const listaPeriodos = datosPeriodos ? (datosPeriodos.periodos || []) : [];
            setPeriodos(listaPeriodos);
            
            // Establecer por defecto el periodo activo para matricularse si existe
            const activo = listaPeriodos.find(p => p.es_matricula_activa);
            if (activo) {
                setFiltroPeriodo(activo.id_periodo);
            } else if (listaPeriodos && listaPeriodos.length > 0) {
                setFiltroPeriodo(listaPeriodos[0].id_periodo);
            }

            // Cargar especialidades
            const resEsp = await consultarApi('/api/courses/especialidades', { method: 'GET' });
            const datosEsp = resEsp.ok ? await resEsp.json() : null;
            const listaEsp = datosEsp ? (datosEsp.especialidades || []) : [];
            setEspecialidades(listaEsp);

        } catch (error) {
            console.error(error);
            toast.error('Error al inicializar filtros de administración.');
        } finally {
            setCargando(false);
        }
    };

    const cargarMatriculas = async () => {
        if (!filtroPeriodo) return;
        try {
            setCargando(true);
            const datos = await listarMatriculasAdmin(filtroPeriodo, filtroEstado);
            setMatriculas(datos.matriculas || []);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar listado de matrículas.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        inicializarDatos();
    }, []);

    useEffect(() => {
        cargarMatriculas();
    }, [filtroPeriodo, filtroEstado]);

    // Aplicar filtros locales de especialidad y ciclo
    const matriculasFiltradas = matriculas.filter(m => {
        if (filtroCiclo && String(m.estudiante_ciclo) !== String(filtroCiclo)) return false;
        if (filtroEspecialidad && m.estudiante_especialidad !== filtroEspecialidad) return false;
        return true;
    });

    const obtenerBadgeEstado = (estado) => {
        switch (estado) {
            case 'pendiente':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'confirmada':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'rechazada':
                return 'bg-rose-50 text-rose-800 border-rose-200';
            default:
                return 'bg-gray-50 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
            
            {/* Header */}
            <div className="bg-bg-alt/50 border border-border p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Módulo de Control</span>
                    <h3 className="font-heading font-extrabold text-xl text-text-heading">Validación de Matrículas Académicas</h3>
                </div>
            </div>

            {/* Panel de Filtros */}
            <div className="bg-white border border-border p-5 rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Filter className="text-primary" size={18} />
                    <h4 className="font-heading font-bold text-text-heading text-sm">Filtros de Búsqueda</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Periodo */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[0.68rem] font-bold text-text-light uppercase">Periodo Académico</label>
                        <select 
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                        >
                            <option value="">Selecciona un periodo</option>
                            {periodos.map(p => (
                                <option key={p.id_periodo} value={p.id_periodo}>
                                    {p.nombre} {p.es_matricula_activa ? '(Activo)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[0.68rem] font-bold text-text-light uppercase">Estado de la Matrícula</label>
                        <select 
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                        >
                            <option value="pendiente">Pendientes de Validación</option>
                            <option value="confirmada">Confirmadas (Con o Sin Pago)</option>
                            <option value="rechazada">Rechazadas</option>
                        </select>
                    </div>

                    {/* Especialidad */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[0.68rem] font-bold text-text-light uppercase">Carrera Profesional</label>
                        <select 
                            value={filtroEspecialidad}
                            onChange={(e) => setFiltroEspecialidad(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                        >
                            <option value="">Todas las Carreras</option>
                            {especialidades.map(esp => (
                                <option key={esp.id_especialidad} value={esp.nombre}>
                                    {esp.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ciclo */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[0.68rem] font-bold text-text-light uppercase">Ciclo Académico</label>
                        <select 
                            value={filtroCiclo}
                            onChange={(e) => setFiltroCiclo(e.target.value)}
                            className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                        >
                            <option value="">Todos los Ciclos</option>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(c => (
                                <option key={c} value={c}>
                                    {c}° Ciclo
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bandeja de Resultados */}
            {cargando ? (
                <div className="flex flex-col items-center justify-center min-h-[250px] gap-2 bg-white border border-border rounded-2xl">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-xs text-text-muted font-bold">Cargando registros de matrícula...</p>
                </div>
            ) : matriculasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[250px] gap-2 bg-white border border-border rounded-2xl p-6 text-center text-text-muted">
                    <AlertCircle size={32} className="text-text-light" />
                    <h5 className="font-heading font-bold text-text-heading text-sm mt-1">Sin registros encontrados</h5>
                    <p className="text-xs max-w-sm">No existen solicitudes de matrícula que coincidan con los filtros seleccionados.</p>
                </div>
            ) : (
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse text-left">
                            <thead>
                                <tr className="border-b border-border text-[0.7rem] font-bold text-text-muted bg-bg-alt/20 uppercase">
                                    <th className="py-3 px-5">Código</th>
                                    <th className="py-3 px-5">Estudiante</th>
                                    <th className="py-3 px-5">Especialidad</th>
                                    <th className="py-3 px-5 text-center">Ciclo</th>
                                    <th className="py-3 px-5 text-center">Fecha Registro</th>
                                    <th className="py-3 px-5 text-center">Estado</th>
                                    <th className="py-3 px-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matriculasFiltradas.map((m) => (
                                    <tr key={m.id_matricula} className="border-b border-border hover:bg-bg-alt/10 last:border-none transition-colors">
                                        <td className="py-4 px-5 font-mono text-xs font-bold text-text-muted">{m.estudiante_codigo}</td>
                                        <td className="py-4 px-5 font-bold text-text-heading">{m.estudiante_apellidos}, {m.estudiante_nombres}</td>
                                        <td className="py-4 px-5 font-semibold text-xs text-text-main">{m.estudiante_especialidad}</td>
                                        <td className="py-4 px-5 text-center font-bold text-text-main">{m.estudiante_ciclo}°</td>
                                        <td className="py-4 px-5 text-center text-xs font-semibold text-text-muted">{m.fecha_matricula.split(' ')[0]}</td>
                                        <td className="py-4 px-5 text-center">
                                            <span className={`px-2.5 py-1 border text-[0.65rem] font-bold uppercase rounded-full ${obtenerBadgeEstado(m.estado)}`}>
                                                {m.estado}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/validar-matriculas/${m.id_matricula}`)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-transparent font-bold text-xs transition-all cursor-pointer"
                                            >
                                                Ver Detalle
                                                <ChevronRight size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
