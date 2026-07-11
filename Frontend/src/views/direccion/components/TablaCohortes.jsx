import React from 'react';
import { GraduationCap, Users, Percent, Award } from 'lucide-react';

export default function TablaCohortes({ datos = [] }) {
    if (datos.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted rounded-none">
                No se encontraron registros de desempeño por cohorte para esta especialidad.
            </div>
        );
    }

    // --- CÁLCULOS DE KPI GLOBALES ---
    const totalEstudiantes = datos.reduce((acc, curr) => acc + (curr.total_estudiantes || 0), 0);
    
    const promediosValidos = datos.map(d => d.promedio_ponderado_promedio).filter(p => p !== null && p !== undefined);
    const promedioGlobal = promediosValidos.length > 0
        ? (promediosValidos.reduce((acc, curr) => acc + curr, 0) / promediosValidos.length).toFixed(2)
        : '-';

    const tasasValidas = datos.map(d => d.tasa_aprobacion).filter(t => t !== null && t !== undefined);
    const tasaAprobacionGlobal = tasasValidas.length > 0
        ? (tasasValidas.reduce((acc, curr) => acc + curr, 0) / tasasValidas.length).toFixed(1)
        : '-';

    return (
        <div className="w-full flex flex-col gap-5">
            {/* Tarjetas KPI de Indicadores Académicos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* KPI 1: Promedio General */}
                <div className="bg-white border border-border p-5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-primary">
                    <div className="p-3 bg-primary-light text-primary rounded-none">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Promedio PPA Carrera</span>
                        <span className="text-2xl font-black text-text-heading leading-tight">{promedioGlobal}</span>
                    </div>
                </div>

                {/* KPI 2: Tasa de Aprobación */}
                <div className="bg-white border border-border p-5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-emerald-500">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-none">
                        <Percent size={24} />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">Tasa Aprobación Global</span>
                        <span className="text-2xl font-black text-emerald-700 leading-tight">
                            {tasaAprobacionGlobal !== '-' ? `${tasaAprobacionGlobal}%` : '-'}
                        </span>
                    </div>
                </div>

                {/* KPI 3: Total Estudiantes */}
                <div className="bg-white border border-border p-5 rounded-none shadow-xs flex items-center gap-4 border-t-4 border-t-blue-500">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-none">
                        <Users size={24} />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-text-muted uppercase tracking-wider font-sans">Alumnos Totales</span>
                        <span className="text-2xl font-black text-text-heading leading-tight">{totalEstudiantes}</span>
                    </div>
                </div>
            </div>

            {/* Tabla con scroll horizontal responsivo aislado */}
            <div className="w-full max-w-full overflow-x-auto border border-border bg-white rounded-none shadow-xs min-w-0 overflow-hidden">
                <table className="w-full border-collapse text-left text-xs text-text-main min-w-[750px]">
                    <thead>
                        <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                            <th className="p-3 border-r border-border/60 text-center w-24">Cohorte</th>
                            <th className="p-3 border-r border-border/60 text-left min-w-[200px]">Especialidad / Programa</th>
                            <th className="p-3 border-r border-border/60 text-center w-36">Estudiantes</th>
                            <th className="p-3 border-r border-border/60 text-center w-32">Promedio (PPA)</th>
                            <th className="p-3 border-r border-border/60 text-center w-36">Créditos Prom.</th>
                            <th className="p-3 text-center min-w-[220px]">Distribución Aprobados / Desaprobados</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const hasPpa = row.promedio_ponderado_promedio !== null && row.promedio_ponderado_promedio !== undefined;
                            const hasTasa = row.tasa_aprobacion !== null && row.tasa_aprobacion !== undefined;
                            
                            const aprobadosPct = hasTasa ? row.tasa_aprobacion : 0;
                            const desaprobadosPct = hasTasa ? (100 - row.tasa_aprobacion) : 0;

                            return (
                                <tr 
                                    key={`${row.cohorte}-${row.especialidad_nombre}`} 
                                    className={`border-b border-border hover:bg-slate-50 transition-colors ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                                >
                                    <td className="p-3 border-r border-border/60 text-center font-mono font-bold text-text-heading text-sm">
                                        {row.cohorte}
                                    </td>
                                    <td className="p-3 border-r border-border/60 font-semibold text-text-heading">
                                        {row.especialidad_nombre}
                                    </td>
                                    <td className="p-3 border-r border-border/60 text-center font-medium text-text-muted">
                                        {row.total_estudiantes} Alumnos
                                    </td>
                                    <td className="p-3 border-r border-border/60 text-center font-black text-text-heading font-mono text-sm">
                                        {hasPpa ? row.promedio_ponderado_promedio.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-3 border-r border-border/60 text-center font-medium text-text-heading font-mono">
                                        {row.total_creditos_aprobados_promedio !== null && row.total_creditos_aprobados_promedio !== undefined 
                                            ? row.total_creditos_aprobados_promedio.toFixed(1) 
                                            : '-'}
                                    </td>
                                    <td className="p-3 space-y-2">
                                        {hasTasa ? (
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-emerald-600">Aprobados: {aprobadosPct.toFixed(1)}%</span>
                                                    <span className="text-red-500">Desaprobados: {desaprobadosPct.toFixed(1)}%</span>
                                                </div>
                                                {/* Barra de progreso bicolor */}
                                                <div className="w-full h-3.5 bg-red-100 rounded-full overflow-hidden flex shadow-inner border border-border/20">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                                                        style={{ width: `${aprobadosPct}%` }}
                                                    />
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                                                        style={{ width: `${desaprobadosPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-text-muted block text-center italic">Sin calificaciones registradas</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
