import React, { useState, useEffect } from 'react';
import { obtenerEspecialidades, obtenerPeriodos } from '../../services/servicioAcademico';
import { obtenerConsolidadoEspecialidad, exportarConsolidadoEspecialidadApi } from '../../services/servicioDireccion';
import { obtenerActasPeriodo, obtenerDetalleActa, validarActa } from '../../services/servicioActas';
import ConsolidadoAdminTable from '../../components/administrador/ConsolidadoAdminTable';
import { 
    RefreshCw, 
    AlertCircle, 
    Loader2, 
    Users, 
    CheckCircle, 
    FolderCheck
} from 'lucide-react';
import { descargarBlob } from '../../utils/exportUtils';

import FiltrosActas from './components/FiltrosActas';
import TablaActas from './components/TablaActas';
import ModalDetalleActa from './components/ModalDetalleActa';
import FiltrosConsolidado from './components/FiltrosConsolidado';
import TarjetasResumenConsolidado from './components/TarjetasResumenConsolidado';

export default function AdminActasNotas() {
    const [activeTab, setActiveTab] = useState('actas'); // 'actas' | 'consolidado'

    // --- ESTADO GENERAL ---
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // --- ESTADO TAB 1: VALIDACIÓN DE ACTAS ---
    const [actas, setActas] = useState([]);
    const [filtroTextoActas, setFiltroTextoActas] = useState('');
    const [modalActa, setModalActa] = useState(null); // { id_seccion, id_curso, seccion_codigo, curso_nombre, ... }
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);

    // --- ESTADO TAB 2: CONSOLIDADO ---
    const [especialidades, setEspecialidades] = useState([]);
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
    const [alumnos, setAlumnos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // --- CARGAR PERIODOS ---
    useEffect(() => {
        cargarPeriodosIniciales();
    }, []);

    // --- CARGAR DATOS AL CAMBIAR PERIODO (TAB 1) ---
    useEffect(() => {
        if (selectedPeriodo && activeTab === 'actas') {
            cargarActas();
        }
    }, [selectedPeriodo, activeTab]);

    // --- CARGAR FILTROS AL ENTRAR AL CONSOLIDADO (TAB 2) ---
    useEffect(() => {
        if (activeTab === 'consolidado' && especialidades.length === 0) {
            cargarEspecialidadesIniciales();
        } else if (activeTab === 'consolidado' && selectedEspecialidad) {
            cargarConsolidado();
        }
    }, [activeTab, selectedEspecialidad]);

    const cargarPeriodosIniciales = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await obtenerPeriodos();
            const list = data.periodos || [];
            setPeriodos(list);
            
            // Seleccionar por defecto el periodo activo, o el primero de la lista
            const activo = list.find(p => p.estado === 'activo');
            if (activo) {
                setSelectedPeriodo(activo.id_periodo.toString());
            } else if (list.length > 0) {
                setSelectedPeriodo(list[0].id_periodo.toString());
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar la lista de periodos académicos.');
        } finally {
            setLoading(false);
        }
    };

    const cargarActas = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await obtenerActasPeriodo(selectedPeriodo);
            setActas(data.actas || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al obtener el listado de actas.');
        } finally {
            setLoading(false);
        }
    };

    const cargarEspecialidadesIniciales = async () => {
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
            setError('Error al inicializar la lista de carreras.');
        } finally {
            setLoading(false);
        }
    };

    const cargarConsolidado = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await obtenerConsolidadoEspecialidad(selectedEspecialidad);
            setAlumnos(data.reporte || []);
        } catch (err) {
            console.error(err);
            setError('Error al obtener el reporte consolidado académico.');
        } finally {
            setLoading(false);
        }
    };

    // --- ACCIÓN: MOSTRAR DETALLE DEL ACTA EN MODAL ---
    const verDetalleActa = async (actaItem) => {
        try {
            setModalError(null);
            setModalLoading(true);
            setModalActa({
                id_seccion: actaItem.id_seccion,
                id_curso: actaItem.id_curso,
                seccion_codigo: actaItem.seccion_codigo,
                curso_codigo: actaItem.curso_codigo,
                curso_nombre: actaItem.curso_nombre,
                docente_nombre: actaItem.docente_nombre,
                especialidad_nombre: actaItem.especialidad_nombre,
                ciclo: actaItem.ciclo,
                estado_acta: actaItem.estado_acta,
                total_estudiantes: actaItem.total_estudiantes,
                alumnos: []
            });

            const data = await obtenerDetalleActa(actaItem.id_seccion, actaItem.id_curso);
            setModalActa(prev => prev ? { ...prev, alumnos: data.detalle || [] } : null);
        } catch (err) {
            console.error(err);
            setModalError(err.message || 'Error al obtener las notas de los estudiantes.');
        } finally {
            setModalLoading(false);
        }
    };

    // --- ACCIÓN: VALIDAR / CERRAR ACTA DE NOTAS ---
    const ejecutarValidarActa = async (idSeccion, idCurso) => {
        try {
            setError(null);
            setSuccessMessage(null);
            setLoading(true);
            await validarActa(idSeccion, idCurso);
            
            setSuccessMessage('El acta de notas ha sido validada y consolidada exitosamente.');
            setModalActa(null); // Cerrar modal si estaba abierto
            cargarActas(); // Recargar listado principal
            
            // Borrar mensaje de éxito después de 4 segundos
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err) {
            console.error(err);
            if (modalActa) {
                setModalError(err.message || 'Faltan registrar notas en esta sección.');
            } else {
                setError(err.message || 'Error al consolidar el acta.');
            }
        } finally {
            setLoading(false);
        }
    };

    // --- FILTRADOS LOCALES ---
    const actasFiltradas = actas.filter(a => {
        const query = filtroTextoActas.toLowerCase();
        return (
            (a.curso_nombre || '').toLowerCase().includes(query) ||
            (a.curso_codigo || '').toLowerCase().includes(query) ||
            (a.docente_nombre || '').toLowerCase().includes(query) ||
            (a.especialidad_nombre || '').toLowerCase().includes(query)
        );
    });

    const alumnosFiltrados = alumnos.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
            (a.codigo || '').toLowerCase().includes(query) ||
            (a.nombres || '').toLowerCase().includes(query) ||
            (a.apellidos || '').toLowerCase().includes(query)
        );
    });

    // --- CÁLCULOS KPI (TAB CONSOLIDADO) ---
    const totalAlumnos = alumnosFiltrados.length;
    const ppasValidos = alumnosFiltrados.map(a => a.promedio_ponderado_acumulado).filter(p => p !== null && p !== undefined);
    const promedioPpaGlobal = ppasValidos.length > 0
        ? (ppasValidos.reduce((acc, curr) => acc + curr, 0) / ppasValidos.length).toFixed(2)
        : '0.00';

    const creditosAprobadosValidos = alumnosFiltrados.map(a => a.total_creditos_aprobados).filter(c => c !== null && c !== undefined);
    const promCreditosAprobados = creditosAprobadosValidos.length > 0
        ? (creditosAprobadosValidos.reduce((acc, curr) => acc + curr, 0) / creditosAprobadosValidos.length).toFixed(1)
        : '0.0';

    // --- EXPORTACIONES ---
    const exportarExcel = async () => {
        try {
            setError(null);
            setLoading(true);
            const espNombre = especialidades.find(e => e.id_especialidad.toString() === selectedEspecialidad)?.nombre || 'Reporte';
            const blob = await exportarConsolidadoEspecialidadApi(selectedEspecialidad, 'csv');
            descargarBlob(blob, `Consolidado_${espNombre.replace(/\s+/g, '_')}.csv`);
        } catch (err) {
            console.error(err);
            setError('Error al exportar consolidado a Excel.');
        } finally {
            setLoading(false);
        }
    };

    const exportarPDF = async () => {
        try {
            setError(null);
            setLoading(true);
            const espNombre = especialidades.find(e => e.id_especialidad.toString() === selectedEspecialidad)?.nombre || 'Reporte';
            const blob = await exportarConsolidadoEspecialidadApi(selectedEspecialidad, 'pdf');
            descargarBlob(blob, `Consolidado_${espNombre.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error(err);
            setError('Error al exportar consolidado a PDF.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="w-full flex flex-col gap-6 animate-slide-up">
            {/* Cabecera Principal */}
            <div className="border-b border-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-text-heading font-heading font-black">
                        Consolidación de Actas y Notas
                    </h1>
                    <p className="text-xs text-text-muted mt-0.5 font-bold">
                        Valide los registros de calificaciones de los docentes, cierre actas de manera oficial y exporte consolidados académicos.
                    </p>
                </div>
                {activeTab === 'actas' && (
                    <button
                        type="button"
                        onClick={cargarActas}
                        disabled={loading}
                        className="flex items-center gap-2 py-1.5 px-3 bg-bg-alt hover:bg-slate-100 border border-border text-text-heading font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                )}
            </div>

            {/* Banners de Notificaciones */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-none text-red-700 text-sm font-bold flex items-center gap-2 shadow-xs">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-none text-emerald-700 text-sm font-bold flex items-center gap-2 shadow-xs">
                    <CheckCircle size={18} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Pestañas de Navegación del Módulo */}
            <div className="flex gap-2 border-b border-border bg-slate-50/50 p-1 rounded-none">
                <button
                    type="button"
                    onClick={() => setActiveTab('actas')}
                    className={`py-2 px-4 font-heading text-xs font-extrabold border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'actas' 
                            ? 'border-primary text-primary bg-white shadow-xs rounded-none font-black' 
                            : 'border-transparent text-text-muted hover:text-text-heading'
                    }`}
                >
                    <FolderCheck size={14} />
                    Validación de Actas
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('consolidado')}
                    className={`py-2 px-4 font-heading text-xs font-extrabold border-b-2 transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                        activeTab === 'consolidado' 
                            ? 'border-primary text-primary bg-white shadow-xs rounded-none font-black' 
                            : 'border-transparent text-text-muted hover:text-text-heading'
                    }`}
                >
                    <Users size={14} />
                    Consolidado por Carrera
                </button>
            </div>

            {/* ---------------- PESTAÑA 1: VALIDACIÓN DE ACTAS ---------------- */}
            {activeTab === 'actas' && (
                <div className="w-full flex flex-col gap-5">
                    <FiltrosActas
                        periodos={periodos}
                        selectedPeriodo={selectedPeriodo}
                        setSelectedPeriodo={setSelectedPeriodo}
                        filtroTextoActas={filtroTextoActas}
                        setFiltroTextoActas={setFiltroTextoActas}
                    />

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-primary" size={36} />
                            <p className="text-sm text-text-muted font-bold">Cargando actas de calificaciones...</p>
                        </div>
                    ) : (
                        <TablaActas
                            actas={actasFiltradas}
                            verDetalleActa={verDetalleActa}
                            ejecutarValidarActa={ejecutarValidarActa}
                        />
                    )}
                </div>
            )}

            {/* ---------------- PESTAÑA 2: CONSOLIDADO POR CARRERA ---------------- */}
            {activeTab === 'consolidado' && (
                <div className="w-full flex flex-col gap-6">
                    <FiltrosConsolidado
                        especialidades={especialidades}
                        selectedEspecialidad={selectedEspecialidad}
                        setSelectedEspecialidad={setSelectedEspecialidad}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        exportarExcel={exportarExcel}
                        exportarPDF={exportarPDF}
                        alumnosFiltrados={alumnosFiltrados}
                    />

                    <TarjetasResumenConsolidado
                        totalAlumnos={totalAlumnos}
                        promedioPpaGlobal={promedioPpaGlobal}
                        promCreditosAprobados={promCreditosAprobados}
                    />

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-xs text-text-muted font-bold">Cargando reporte consolidado...</p>
                        </div>
                    ) : (
                        <div className="w-full min-w-0 overflow-hidden">
                            <ConsolidadoAdminTable alumnos={alumnosFiltrados} />
                        </div>
                    )}
                </div>
            )}

            </div>

            {/* Modal Detalle de Acta */}
            <ModalDetalleActa
                modalActa={modalActa}
                setModalActa={setModalActa}
                modalLoading={modalLoading}
                modalError={modalError}
                ejecutarValidarActa={ejecutarValidarActa}
                loading={loading}
            />
        </>
    );
}
