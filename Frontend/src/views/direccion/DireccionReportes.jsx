import React, { useState, useEffect } from 'react';
import { obtenerEspecialidades } from '../../services/servicioAcademico';
import { obtenerDesempenoCohortes, obtenerConsolidadoEspecialidad } from '../../services/servicioDireccion';
import TablaCohortes from './components/TablaCohortes';
import TablaConsolidado from './components/TablaConsolidado';
import { RefreshCw, BarChart3, Users, Award, AlertCircle, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { exportarConsolidadoCSV, exportarConsolidadoPDF, exportarCohortesCSV, exportarCohortesPDF } from '../../utils/exportUtils';


export default function DireccionReportes() {
    const [activeTab, setActiveTab] = useState('cohortes'); // 'cohortes' | 'consolidado'
    
    // Filtros de Especialidad
    const [especialidades, setEspecialidades] = useState([]);
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
    
    // Datos de los reportes
    const [cohortesData, setCohortesData] = useState([]);
    const [consolidadoData, setConsolidadoData] = useState([]);
    
    // Controladores de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarFiltros();
    }, []);

    useEffect(() => {
        if (selectedEspecialidad) {
            cargarDatosReporte();
        }
    }, [activeTab, selectedEspecialidad]);

    const cargarFiltros = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await obtenerEspecialidades();
            const listEsp = data.especialidades || [];
            setEspecialidades(listEsp);
            if (listEsp.length > 0) {
                setSelectedEspecialidad(listEsp[0].id_especialidad.toString());
            }
        } catch (err) {
            console.error(err);
            setError('Error al inicializar la lista de especialidades/carreras.');
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosReporte = async () => {
        try {
            setError(null);
            setLoading(true);
            if (activeTab === 'cohortes') {
                const data = await obtenerDesempenoCohortes(selectedEspecialidad);
                setCohortesData(data.desempeno || []);
            } else {
                const data = await obtenerConsolidadoEspecialidad(selectedEspecialidad);
                setConsolidadoData(data.reporte || []);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al cargar los datos del reporte académico.');
        } finally {
            setLoading(false);
        }
    };

    // --- ACCIÓN: EXPORTAR A EXCEL (CSV) ---
    const exportarExcel = () => {
        const espNombre = especialidades.find(e => e.id_especialidad.toString() === selectedEspecialidad)?.nombre || 'Reporte';
        if (activeTab === 'cohortes') {
            exportarCohortesCSV(cohortesData, espNombre);
        } else {
            exportarConsolidadoCSV(consolidadoData, espNombre);
        }
    };

    // --- ACCIÓN: EXPORTAR A PDF (IMPRESIÓN) ---
    const exportarPDF = () => {
        const espNombre = especialidades.find(e => e.id_especialidad.toString() === selectedEspecialidad)?.nombre || 'Reporte';
        if (activeTab === 'cohortes') {
            const totalEst = cohortesData.reduce((acc, curr) => acc + (curr.total_estudiantes || 0), 0);
            const promValidos = cohortesData.map(d => d.promedio_ponderado_promedio).filter(p => p !== null && p !== undefined);
            const promGlob = promValidos.length > 0 ? (promValidos.reduce((acc, curr) => acc + curr, 0) / promValidos.length).toFixed(2) : '-';
            const tasValidas = cohortesData.map(d => d.tasa_aprobacion).filter(t => t !== null && t !== undefined);
            const tasAprobGlob = tasValidas.length > 0 ? (tasasValidas.reduce((acc, curr) => acc + curr, 0) / tasValidas.length).toFixed(1) : '-';
            
            exportarCohortesPDF(cohortesData, espNombre, {
                totalEstudiantes: totalEst,
                promedioGlobal: promGlob,
                tasaAprobacionGlobal: tasAprobGlob
            });
        } else {
            const totalAl = consolidadoData.length;
            const ppasVal = consolidadoData.map(a => a.promedio_ponderado_acumulado).filter(p => p !== null && p !== undefined);
            const promPpaG = ppasVal.length > 0 ? (ppasVal.reduce((acc, curr) => acc + curr, 0) / ppasVal.length).toFixed(2) : '0.00';
            const credsApVal = consolidadoData.map(a => a.total_creditos_aprobados).filter(c => c !== null && c !== undefined);
            const promCredsAp = credsApVal.length > 0 ? (credsApVal.reduce((acc, curr) => acc + curr, 0) / credsApVal.length).toFixed(1) : '0.0';

            exportarConsolidadoPDF(consolidadoData, espNombre, {
                totalAlumnos: totalAl,
                promedioPpaGlobal: promPpaG,
                promCreditosAprobados: promCredsAp
            });
        }
    };


    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up">
            {/* Cabecera */}
            <div className="border-b border-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-bold bg-primary-light text-primary uppercase tracking-wider mb-1.5">
                        Monitoreo Académico
                    </span>
                    <h1 className="text-3xl font-extrabold text-text-heading tracking-tight font-heading">
                        Indicadores de Rendimiento
                    </h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Supervise los promedios históricos y la tasa de aprobación de las cohortes y estudiantes de la institución.
                    </p>
                </div>
                <div className="flex gap-2 items-center shrink-0 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={exportarExcel}
                        disabled={loading || (activeTab === 'cohortes' ? cohortesData.length === 0 : consolidadoData.length === 0)}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-[#107C41] hover:bg-[#0e6b37] text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <FileSpreadsheet size={13} />
                        Excel
                    </button>
                    <button
                        type="button"
                        onClick={exportarPDF}
                        disabled={loading || (activeTab === 'cohortes' ? cohortesData.length === 0 : consolidadoData.length === 0)}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-[#E11D48] hover:bg-[#be183d] text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <FileText size={13} />
                        PDF
                    </button>
                    <button
                        type="button"
                        onClick={cargarDatosReporte}
                        disabled={loading}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-bg-alt hover:bg-slate-100 border border-border text-text-heading font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer shadow-sm"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Banner de error */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-none text-red-700 text-sm font-medium flex items-center gap-2 shadow-xs">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Panel de Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-alt border border-border p-4 rounded-none shadow-xs">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="especialidad-select" className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                        <Award size={14} className="text-primary" />
                        Filtrar por Especialidad / Carrera:
                    </label>
                    <select
                        id="especialidad-select"
                        value={selectedEspecialidad}
                        onChange={(e) => setSelectedEspecialidad(e.target.value)}
                        className="w-full bg-white border border-border text-sm p-2.5 rounded-none outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    >
                        {especialidades.map(esp => (
                            <option key={esp.id_especialidad} value={esp.id_especialidad}>
                                {esp.nombre} ({esp.codigo})
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex flex-col justify-end">
                    <p className="text-xs text-text-muted italic leading-relaxed sm:text-right">
                        Selecciona un filtro para que los datos del reporte se actualicen de manera instantánea en la sección activa.
                    </p>
                </div>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex gap-2 border-b border-border bg-slate-50/50 p-1 rounded-none">
                <button
                    type="button"
                    className={`py-2.5 px-4 font-heading text-xs font-extrabold border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'cohortes' 
                            ? 'border-primary text-primary bg-white shadow-xs rounded-none font-black' 
                            : 'border-transparent text-text-muted hover:text-text-heading'
                    }`}
                    onClick={() => setActiveTab('cohortes')}
                >
                    <BarChart3 size={14} />
                    Rendimiento por Cohorte
                </button>
                <button
                    type="button"
                    className={`py-2.5 px-4 font-heading text-xs font-extrabold border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'consolidado' 
                            ? 'border-primary text-primary bg-white shadow-xs rounded-none font-black' 
                            : 'border-transparent text-text-muted hover:text-text-heading'
                    }`}
                    onClick={() => setActiveTab('consolidado')}
                >
                    <Users size={14} />
                    Consolidado de Alumnos
                </button>
            </div>

            {/* Cargando o Contenido */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-primary" size={36} />
                    <p className="text-sm text-text-muted font-semibold">Cargando reporte de indicadores...</p>
                </div>
            ) : (
                <div className="w-full min-w-0 overflow-hidden">
                    {activeTab === 'cohortes' && <TablaCohortes datos={cohortesData} />}
                    {activeTab === 'consolidado' && <TablaConsolidado alumnos={consolidadoData} />}
                </div>
            )}
        </div>
    );
}
