import React, { useState, useEffect } from 'react';
import CursoService from '../../Services/CursoService';
import GradeService from '../../Services/GradeService';
import { BarChart3, Users, Award, BookOpen, Search, Eye, X, Loader2, RefreshCw, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import CohorteTable from '../../components/direccion/CohorteTable';
import ConsolidadoTable from '../../components/administrador/ConsolidadoTable';
import CumplimientoTable from '../../components/direccion/CumplimientoTable';
import Dialog from '../../components/Ui/Dialog';

export default function DireccionReportes() {
    const [activeTab, setActiveTab] = useState('cohortes'); // 'cohortes' | 'consolidado' | 'secciones' | 'cumplimiento'

    // Filtros y opciones
    const [periodos, setPeriodos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [planes, setPlanes] = useState([]);
    // Estados de datos
    const [cohortesData, setCohortesData] = useState([]);
    const [alumnosConsolidado, setAlumnosConsolidado] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [cumplimientoData, setCumplimientoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Modal de Notas de Sección (Reutilizando Dialog.jsx)
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSeccionInfo, setSelectedSeccionInfo] = useState(null);
    const [seccionNotas, setSeccionNotas] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        initFilters();
    }, []);
    useEffect(() => {
        if (activeTab === 'cohortes') loadCohortes();
        if (activeTab === 'consolidado') loadConsolidado();
        if (activeTab === 'secciones') loadSecciones();
        if (activeTab === 'cumplimiento') loadCumplimiento();
    }, [activeTab, selectedEspecialidad, selectedPeriodo, selectedPlan]);
    const initFilters = async () => {
        try {
            setError(null);
            setLoading(true);
            const [perData, espData, planData] = await Promise.all([
                CursoService.getPeriodos(),
                CursoService.getEspecialidades(),
                CursoService.getPlanesEstudio()
            ]);
            const listPer = perData.periodos || [];
            setPeriodos(listPer);
            if (listPer.length > 0) setSelectedPeriodo(listPer[listPer.length - 1].id_periodo.toString());
            const listEsp = espData.especialidades || [];
            setEspecialidades(listEsp);
            if (listEsp.length > 0) setSelectedEspecialidad(listEsp[0].id_especialidad.toString());
            const listPlan = planData.planes || [];
            setPlanes(listPlan);
            if (listPlan.length > 0) setSelectedPlan(listPlan[0].id_plan.toString());
        } catch (err) {
            setError('Error al inicializar los filtros de búsqueda.');
        } finally {
            setLoading(false);
        }
    };
    const loadCohortes = async () => {
        if (!selectedEspecialidad) return;
        try {
            setLoading(true);
            setError(null);
            const data = await GradeService.getDesempenoCohortes(selectedEspecialidad);
            setCohortesData(data.desempeno || []);
        } catch (err) {
            setError('Error al cargar el desempeño por cohorte.');
        } finally {
            setLoading(false);
        }
    };
    const loadConsolidado = async () => {
        if (!selectedEspecialidad) return;
        try {
            setLoading(true);
            setError(null);
            const data = await GradeService.getConsolidado(selectedEspecialidad);
            setAlumnosConsolidado(data.reporte || []);
        } catch (err) {
            setError('Error al cargar el reporte consolidado.');
        } finally {
            setLoading(false);
        }
    };
    const loadSecciones = async () => {
        if (!selectedPeriodo) return;
        try {
            setLoading(true);
            setError(null);
            const data = await CursoService.getSecciones(selectedPeriodo);
            setSecciones(data.secciones || []);
        } catch (err) {
            setError('Error al cargar las secciones.');
        } finally {
            setLoading(false);
        }
    };
    const loadCumplimiento = async () => {
        if (!selectedPlan || !selectedPeriodo) return;
        try {
            setLoading(true);
            setError(null);
            const data = await CursoService.getCumplimientoPlan(selectedPlan, selectedPeriodo);
            setCumplimientoData(data);
        } catch (err) {
            setError('Error al cargar el cumplimiento del plan.');
        } finally {
            setLoading(false);
        }
    };
    const handleVerDetalleSeccion = async (seccion) => {
        setSelectedSeccionInfo(seccion);
        setShowDetailModal(true);
        setLoadingDetail(true);
        try {
            const data = await GradeService.getNotasSeccion(seccion.id_seccion);
            setSeccionNotas(data.notes || data.notas || []);
        } catch (err) {
            alert("No se pudieron cargar las notas de esta sección.");
            setShowDetailModal(false);
        } finally {
            setLoadingDetail(false);
        }
    };
    const handleReload = () => {
        if (activeTab === 'cohortes') loadCohortes();
        if (activeTab === 'consolidado') loadConsolidado();
        if (activeTab === 'secciones') loadSecciones();
        if (activeTab === 'cumplimiento') loadCumplimiento();
    };
    const filteredSecciones = secciones.filter(sec =>
        (sec.curso_nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sec.docente_nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sec.codigo || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="w-full flex flex-col gap-4">
            {/* Cabecera */}
            <div className="border-b border-border pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-text-heading">Reportes e Indicadores Académicos</h1>
                    <p className="text-xs text-text-muted mt-0.5 font-normal">
                        Monitoree promedios históricos, actas de notas y cumplimiento de planes de estudio.
                    </p>
                </div>
                <button
                    onClick={handleReload}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-xs uppercase tracking-wider cursor-pointer self-start md:self-auto"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>
            {/* Error Banner */}
            {error && (
                <div className="w-full p-3 bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
            )}
            {/* Filtros dinámicos según pestaña */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-border p-3">
                {(activeTab === 'cohortes' || activeTab === 'consolidado') && (
                    <div className="flex flex-col gap-1 col-span-2">
                        <label htmlFor="esp-select" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Especialidad:</label>
                        <select
                            id="esp-select"
                            value={selectedEspecialidad}
                            onChange={(e) => setSelectedEspecialidad(e.target.value)}
                            className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary w-full"
                        >
                            {especialidades.map(esp => (
                                <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}
                {activeTab === 'secciones' && (
                    <div className="flex flex-col gap-1 col-span-2">
                        <label htmlFor="per-select" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Semestre:</label>
                        <select
                            id="per-select"
                            value={selectedPeriodo}
                            onChange={(e) => setSelectedPeriodo(e.target.value)}
                            className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary w-full"
                        >
                            {periodos.map(per => (
                                <option key={per.id_periodo} value={per.id_periodo}>{per.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}
                {activeTab === 'cumplimiento' && (
                    <>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="plan-select" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Plan de Estudios:</label>
                            <select
                                id="plan-select"
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                                className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary w-full"
                            >
                                {planes.map(pl => (
                                    <option key={pl.id_plan} value={pl.id_plan}>{pl.nombre} ({pl.version})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="per-plan-select" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Semestre:</label>
                            <select
                                id="per-plan-select"
                                value={selectedPeriodo}
                                onChange={(e) => setSelectedPeriodo(e.target.value)}
                                className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary w-full"
                            >
                                {periodos.map(per => (
                                    <option key={per.id_periodo} value={per.id_periodo}>{per.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                <div className="flex flex-col justify-end text-[10px] text-text-muted italic sm:text-right col-span-1">
                    Los datos se filtran automáticamente al cambiar las opciones.
                </div>
            </div>
            {/* Pestañas de Reportes */}
            <div className="flex flex-wrap border-b border-border bg-slate-50 gap-1 p-1">
                <button
                    onClick={() => setActiveTab('cohortes')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 ${activeTab === 'cohortes' ? 'bg-white border-primary text-primary font-extrabold shadow-sm' : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                        }`}
                >
                    Rendimiento por Cohorte
                </button>
                <button
                    onClick={() => setActiveTab('consolidado')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 ${activeTab === 'consolidado' ? 'bg-white border-primary text-primary font-extrabold shadow-sm' : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                        }`}
                >
                    Consolidado Especialidad
                </button>
                <button
                    onClick={() => setActiveTab('secciones')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 ${activeTab === 'secciones' ? 'bg-white border-primary text-primary font-extrabold shadow-sm' : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                        }`}
                >
                    Rendimiento Secciones
                </button>
                <button
                    onClick={() => setActiveTab('cumplimiento')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 ${activeTab === 'cumplimiento' ? 'bg-white border-primary text-primary font-extrabold shadow-sm' : 'bg-transparent border-transparent text-text-muted hover:text-text-main'
                        }`}
                >
                    Cumplimiento de Plan
                </button>
            </div>
            {/* Contenido de Pestañas */}
            {loading ? (
                <div className="w-full text-center py-12 text-sm text-text-muted">Cargando reporte estratégico...</div>
            ) : (
                <div className="w-full min-w-0 overflow-hidden">
                    {activeTab === 'cohortes' && <CohorteTable datos={cohortesData} />}
                    {activeTab === 'consolidado' && <ConsolidadoTable alumnos={alumnosConsolidado} />}
                    {activeTab === 'cumplimiento' && <CumplimientoTable reporte={cumplimientoData} />}
                    {activeTab === 'secciones' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-text-heading text-xs uppercase tracking-wider">Secciones del Semestre</h3>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por curso, docente..."
                                    className="bg-white border border-border text-xs p-1.5 outline-none focus:border-primary w-60"
                                />
                            </div>
                            <div className="w-full max-w-full overflow-x-auto border border-border bg-white min-w-0">
                                <table className="w-full border-collapse text-left text-xs text-text-main min-w-[700px]">
                                    <thead>
                                        <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                                            <th className="p-2 border-r border-border/60 text-center w-20">Sección</th>
                                            <th className="p-2 border-r border-border/60 text-left min-w-[200px]">Curso</th>
                                            <th className="p-2 border-r border-border/60 text-left">Docente</th>
                                            <th className="p-2 border-r border-border/60 text-center w-28">Aula</th>
                                            <th className="p-2 border-r border-border/60 text-center w-28">Acta</th>
                                            <th className="p-2 text-center w-28">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSecciones.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="p-6 text-center text-sm text-text-muted">No se encontraron secciones.</td>
                                            </tr>
                                        ) : (
                                            filteredSecciones.map((sec, idx) => (
                                                <tr key={sec.id_seccion} className={`border-b border-border ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                                                    <td className="p-2 border-r border-border/60 text-center font-mono font-bold text-text-heading">{sec.codigo}</td>
                                                    <td className="p-2 border-r border-border/60 font-semibold text-text-heading">{sec.curso_nombre}</td>
                                                    <td className="p-2 border-r border-border/60 text-text-heading font-medium">{sec.docente_nombre || 'No asignado'}</td>
                                                    <td className="p-2 border-r border-border/60 text-center font-mono text-text-muted">{sec.aula || '-'}</td>
                                                    <td className="p-2 border-r border-border/60 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${sec.estado === 'cerrada' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                                                            }`}>{sec.estado === 'cerrada' ? 'Cerrada' : 'Abierta'}</span>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            onClick={() => handleVerDetalleSeccion(sec)}
                                                            className="flex items-center justify-center gap-1 mx-auto py-1 px-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer border-none"
                                                        >
                                                            <Eye size={12} />
                                                            Análisis
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Modal de Detalle de Sección (Reutilizando Dialog) */}
            <Dialog isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} size="3xl">
                <Dialog.Header onClose={() => setShowDetailModal(false)}>
                    Análisis de Rendimiento: {selectedSeccionInfo?.curso_nombre} (Sección {selectedSeccionInfo?.codigo})
                </Dialog.Header>
                <Dialog.Content className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                    {loadingDetail ? (
                        <div className="text-center py-10 text-xs text-text-muted">Cargando datos...</div>
                    ) : (
                        <>
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-border p-3">
                                <div className="text-center">
                                    <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider">Alumnos</span>
                                    <span className="text-sm font-extrabold text-text-heading">{seccionNotas.length}</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[9px] font-bold text-green-700 uppercase tracking-wider">Aprobados</span>
                                    <span className="text-sm font-extrabold text-green-700">
                                        {seccionNotas.filter(n => n.estado === 'aprobada').length}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[9px] font-bold text-red-700 uppercase tracking-wider">Desaprobados</span>
                                    <span className="text-sm font-extrabold text-red-700">
                                        {seccionNotas.filter(n => n.estado === 'desaprobada').length}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider">Sin Nota</span>
                                    <span className="text-sm font-extrabold text-text-heading">
                                        {seccionNotas.filter(n => n.estado === 'sin_nota' || n.promedio === null).length}
                                    </span>
                                </div>
                            </div>
                            {/* Grades detail list */}
                            <div className="w-full max-w-full overflow-x-auto min-w-0 border border-border">
                                <table className="w-full border-collapse text-left text-xs min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-100 text-text-muted font-bold border-b border-border">
                                            <th className="p-2 w-24">Código</th>
                                            <th className="p-2">Estudiante</th>
                                            <th className="p-2 text-center w-12">P1</th>
                                            <th className="p-2 text-center w-12">P2</th>
                                            <th className="p-2 text-center w-12">EF</th>
                                            <th className="p-2 text-center w-12">SU</th>
                                            <th className="p-2 text-center w-16">Prom.</th>
                                            <th className="p-2 text-center w-24">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {seccionNotas.map((n, idx) => (
                                            <tr key={idx} className={`border-b border-border/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                <td className="p-2 font-mono text-[10px] text-text-muted">{n.estudiante_codigo}</td>
                                                <td className="p-2 font-semibold text-text-heading">{n.estudiante_nombre}</td>
                                                <td className="p-2 text-center font-mono text-[10px]">{n.parcial1 !== null ? n.parcial1.toFixed(1) : '-'}</td>
                                                <td className="p-2 text-center font-mono text-[10px]">{n.parcial2 !== null ? n.parcial2.toFixed(1) : '-'}</td>
                                                <td className="p-2 text-center font-mono text-[10px]">{n.final !== null ? n.final.toFixed(1) : '-'}</td>
                                                <td className="p-2 text-center font-mono text-[10px]">{n.sustitutorio !== null ? n.sustitutorio.toFixed(1) : '-'}</td>
                                                <td className="p-2 text-center font-mono font-bold text-primary">{n.promedio !== null ? n.promedio.toFixed(2) : '-'}</td>
                                                <td className="p-2 text-center">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${n.estado === 'aprobada' ? 'bg-emerald-50 text-emerald-700' :
                                                        n.estado === 'desaprobada' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-500'
                                                        }`}>
                                                        {n.estado === 'aprobada' ? 'Aprobado' : n.estado === 'desaprobada' ? 'Desaprobado' : 'Pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Dialog.Content>
                <Dialog.Footer>
                    <button
                        onClick={() => setShowDetailModal(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                        Cerrar
                    </button>
                </Dialog.Footer>
            </Dialog>
        </div>
    );
}