import React, { useState, useEffect } from 'react';
import { obtenerEspecialidades } from '../../services/servicioAcademico';
import { obtenerDesempenoCohortes, obtenerConsolidadoEspecialidad } from '../../services/servicioDireccion';
import TablaCohortes from './components/TablaCohortes';
import TablaConsolidado from './components/TablaConsolidado';
import { RefreshCw, BarChart3, Users, Award, AlertCircle, Loader2 } from 'lucide-react';

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

    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up">
            {/* Cabecera */}
            <div className="border-b border-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-primary-light text-primary uppercase tracking-wider mb-1.5">
                        Monitoreo Académico
                    </span>
                    <h1 className="text-3xl font-extrabold text-text-heading tracking-tight font-heading">
                        Indicadores de Rendimiento
                    </h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Supervise los promedios históricos y la tasa de aprobación de las cohortes y estudiantes de la institución.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={cargarDatosReporte}
                    disabled={loading}
                    className="flex items-center gap-2 py-2 px-4 bg-bg-alt hover:bg-slate-100 border border-border text-text-heading font-bold text-xs uppercase tracking-wider transition-colors rounded-lg cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
            </div>

            {/* Banner de error */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm font-medium flex items-center gap-2 shadow-xs">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Panel de Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg-alt border border-border p-4 rounded-xl shadow-xs">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="especialidad-select" className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                        <Award size={14} className="text-primary" />
                        Filtrar por Especialidad / Carrera:
                    </label>
                    <select
                        id="especialidad-select"
                        value={selectedEspecialidad}
                        onChange={(e) => setSelectedEspecialidad(e.target.value)}
                        className="w-full bg-white border border-border text-sm p-2.5 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
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
            <div className="flex gap-2 border-b border-border bg-slate-50/50 p-1 rounded-t-lg">
                <button
                    type="button"
                    className={`py-2.5 px-4 font-heading text-xs font-extrabold border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'cohortes' 
                            ? 'border-primary text-primary bg-white shadow-xs rounded-t-md font-black' 
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
                            ? 'border-primary text-primary bg-white shadow-xs rounded-t-md font-black' 
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
