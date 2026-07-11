import React, { useState, useEffect } from 'react';
import { obtenerEspecialidades } from '../../services/servicioAcademico';
import { obtenerConsolidadoEspecialidad } from '../../services/servicioDireccion';
import ConsolidadoAdminTable from '../../components/administrador/ConsolidadoAdminTable';
import { FileSpreadsheet, FileText, Search, RefreshCw, AlertCircle, Loader2, Award, Users, BookOpen } from 'lucide-react';

export default function AdminActasNotas() {
    const [especialidades, setEspecialidades] = useState([]);
    const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
    const [alumnos, setAlumnos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarFiltros();
    }, []);

    useEffect(() => {
        if (selectedEspecialidad) {
            cargarConsolidado();
        }
    }, [selectedEspecialidad]);

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

    // Filtrar alumnos localmente por búsqueda
    const alumnosFiltrados = alumnos.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
            (a.codigo || '').toLowerCase().includes(query) ||
            (a.nombres || '').toLowerCase().includes(query) ||
            (a.apellidos || '').toLowerCase().includes(query)
        );
    });

    // --- CÁLCULOS KPI ---
    const totalAlumnos = alumnosFiltrados.length;
    const ppasValidos = alumnosFiltrados.map(a => a.promedio_ponderado_acumulado).filter(p => p !== null && p !== undefined);
    const promedioPpaGlobal = ppasValidos.length > 0
        ? (ppasValidos.reduce((acc, curr) => acc + curr, 0) / ppasValidos.length).toFixed(2)
        : '0.00';

    const creditosAprobadosValidos = alumnosFiltrados.map(a => a.total_creditos_aprobados).filter(c => c !== null && c !== undefined);
    const promCreditosAprobados = creditosAprobadosValidos.length > 0
        ? (creditosAprobadosValidos.reduce((acc, curr) => acc + curr, 0) / creditosAprobadosValidos.length).toFixed(1)
        : '0.0';

    // --- ACCIÓN: EXPORTAR A EXCEL (CSV) ---
    const exportarExcel = () => {
        if (alumnosFiltrados.length === 0) return;

        const especialidadNombre = especialidades.find(e => e.id_especialidad.toString() === selectedEspecialidad)?.nombre || 'Reporte';

        const headers = ['Codigo', 'Apellidos y Nombres', 'Especialidad', 'Creditos Matriculados', 'Creditos Aprobados', 'Promedio PPA', 'Semestres Cursados'];
        const rows = alumnosFiltrados.map(a => [
            a.codigo,
            `"${a.apellidos}, ${a.nombres}"`,
            `"${a.especialidad_nombre}"`,
            a.total_creditos_matriculados,
            a.total_creditos_aprobados,
            a.promedio_ponderado_acumulado !== null && a.promedio_ponderado_acumulado !== undefined ? a.promedio_ponderado_acumulado.toFixed(2) : '-',
            a.periodos_matriculados
        ]);

        const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_Consolidado_${especialidadNombre.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportarPDF = () => {
        if (alumnosFiltrados.length === 0) return;

        const especialidadNombre = especialidades.find(e => e.id_especialidad.toString() === selectedEspecialidad)?.nombre || 'Reporte';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Reporte Consolidado Académico</title>
                <style>
                    body { font-family: sans-serif; padding: 25px; color: #334155; }
                    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
                    h1 { font-size: 22px; color: #1e293b; margin: 0; }
                    .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
                    th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    .footer { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Reporte Consolidado Académico - UNCP</h1>
                    <div class="meta">
                        <span>Carrera: <strong>${especialidadNombre}</strong></span> | 
                        <span>Alumnos Listados: <strong>${totalAlumnos}</strong></span> | 
                        <span>PPA Promedio: <strong>${promedioPpaGlobal}</strong></span> | 
                        <span>Fecha: <strong>${new Date().toLocaleDateString('es-PE')}</strong></span>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 100px;">Código</th>
                            <th>Estudiante (Apellidos, Nombres)</th>
                            <th style="text-align: center; width: 90px;">Créditos Mat.</th>
                            <th style="text-align: center; width: 90px;">Créditos Aprob.</th>
                            <th style="text-align: center; width: 90px;">Promedio PPA</th>
                            <th style="text-align: center; width: 80px;">Semestres</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alumnosFiltrados.map(a => `
                            <tr>
                                <td>${a.codigo}</td>
                                <td>${a.apellidos}, ${a.nombres}</td>
                                <td class="text-center">${a.total_creditos_matriculados}</td>
                                <td class="text-center">${a.total_creditos_aprobados}</td>
                                <td class="text-center font-bold" style="color: #2563eb;">${a.promedio_ponderado_acumulado !== null && a.promedio_ponderado_acumulado !== undefined ? a.promedio_ponderado_acumulado.toFixed(2) : '-'}</td>
                                <td class="text-center">${a.periodos_matriculados}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="footer">
                    Sistema de Gestión Académica - Universidad Nacional del Centro del Perú (UNCP)
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up">
            {/* Cabecera */}
            <div className="border-b border-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-text-heading font-heading">
                        Reportes Académicos Consolidados
                    </h1>
                    <p className="text-xs text-text-muted mt-0.5 font-normal">
                        Monitoree el rendimiento general de los estudiantes y exporte el consolidado en formatos listos para imprimir o analizar.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={cargarConsolidado}
                    disabled={loading}
                    className="flex items-center gap-2 py-1.5 px-3 bg-bg-alt hover:bg-slate-100 border border-border text-text-heading font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
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

            {/* Panel de Filtro y Buscador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-alt border border-border p-4 rounded-none shadow-xs">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="especialidad-select" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        Seleccionar Carrera Académica:
                    </label>
                    <select
                        id="especialidad-select"
                        value={selectedEspecialidad}
                        onChange={(e) => setSelectedEspecialidad(e.target.value)}
                        className="w-full bg-white border border-border text-sm p-2 rounded-none outline-none focus:border-primary font-medium"
                    >
                        {especialidades.map(esp => (
                            <option key={esp.id_especialidad} value={esp.id_especialidad}>
                                {esp.nombre} ({esp.codigo})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col justify-end text-xs text-text-muted italic leading-relaxed md:text-right">
                    <span>Selecciona una carrera para que el consolidado se actualice automáticamente.</span>
                </div>
            </div>

            {/* Tarjetas KPI Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* KPI 1: Total Alumnos */}
                <div className="bg-white border border-border p-4.5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-blue-500">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-none">
                        <Users size={20} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Estudiantes</span>
                        <span className="text-xl font-black text-text-heading leading-tight">{totalAlumnos}</span>
                    </div>
                </div>

                {/* KPI 2: Promedio de Carrera */}
                <div className="bg-white border border-border p-4.5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-primary">
                    <div className="p-2.5 bg-primary-light text-primary rounded-none">
                        <Award size={20} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Promedio PPA Global</span>
                        <span className="text-xl font-black text-text-heading leading-tight">{promedioPpaGlobal}</span>
                    </div>
                </div>

                {/* KPI 3: Créditos Aprobados Promedio */}
                <div className="bg-white border border-border p-4.5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-emerald-500">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-none">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider font-sans">Créditos Aprobados Prom.</span>
                        <span className="text-xl font-black text-text-heading leading-tight">{promCreditosAprobados}</span>
                    </div>
                </div>
            </div>

            {/* Controles de Búsqueda y Exportación */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por código, nombres o apellidos..."
                        className="w-full bg-white border border-border text-xs py-2 pl-9 pr-4 rounded-none outline-none focus:border-primary font-medium"
                    />
                    <Search className="absolute left-3 top-2.5 text-text-muted" size={14} />
                </div>

                <div className="flex gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={exportarExcel}
                        disabled={alumnosFiltrados.length === 0}
                        className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-[#107C41] hover:bg-[#0e6b37] border-none text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <FileSpreadsheet size={14} />
                        Excel
                    </button>
                    <button
                        type="button"
                        onClick={exportarPDF}
                        disabled={alumnosFiltrados.length === 0}
                        className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-[#E11D48] hover:bg-[#be183d] border-none text-white font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <FileText size={14} />
                        PDF
                    </button>
                </div>
            </div>

            {/* Cargando o Contenido de la Tabla */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-xs text-text-muted font-semibold">Obteniendo reporte consolidado académico...</p>
                </div>
            ) : (
                <div className="w-full min-w-0 overflow-hidden">
                    <ConsolidadoAdminTable alumnos={alumnosFiltrados} />
                </div>
            )}
        </div>
    );
}
