import React from 'react';
import { Users, GraduationCap, Percent } from 'lucide-react';

export default function CohorteTable({ datos = [] }) {
    if (datos.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                No se encontraron registros de desempeño por cohorte para esta especialidad.
            </div>
        );
    }

    // --- CÁLCULO DE INDICADORES GLOBALES (KPIs) ---
    const totalEstudiantes = datos.reduce((acc, curr) => acc + (curr.total_estudiantes || 0), 0);
    
    const promediosValidos = datos.map(d => d.promedio_ponderado_promedio).filter(p => p !== null);
    const promedioGlobal = promediosValidos.length > 0
        ? (promediosValidos.reduce((acc, curr) => acc + curr, 0) / promediosValidos.length).toFixed(2)
        : '-';

    const tasasValidas = datos.map(d => d.tasa_aprobacion).filter(t => t !== null);
    const tasaAprobacionGlobal = tasasValidas.length > 0
        ? (tasasValidas.reduce((acc, curr) => acc + curr, 0) / tasasValidas.length).toFixed(1)
        : '-';

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Tarjetas de Indicadores Académicos (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* KPI 1: Promedio General */}
                <div className="bg-slate-50 border border-border p-3 flex items-center gap-3">
                    <div className="p-2.5 bg-primary-light text-primary rounded-xs">
                        <GraduationCap size={18} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Promedio PPA</span>
                        <span className="text-base font-extrabold text-text-heading">{promedioGlobal}</span>
                    </div>
                </div>

                {/* KPI 2: Tasa de Aprobación */}
                <div className="bg-slate-50 border border-border p-3 flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 text-green-700 rounded-xs">
                        <Percent size={18} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Tasa Aprobación</span>
                        <span className="text-base font-extrabold text-text-heading">
                            {tasaAprobacionGlobal !== '-' ? `${tasaAprobacionGlobal}%` : '-'}
                        </span>
                    </div>
                </div>

                {/* KPI 3: Total Estudiantes */}
                <div className="bg-slate-50 border border-border p-3 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xs">
                        <Users size={18} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Alumnos Totales</span>
                        <span className="text-base font-extrabold text-text-heading">{totalEstudiantes}</span>
                    </div>
                </div>
            </div>

            {/* Tabla con scroll horizontal responsivo aislado */}
            <div className="w-full max-w-full overflow-x-auto border border-border bg-white min-w-0">
                <table className="w-full border-collapse text-left text-xs text-text-main min-w-[650px]">
                    <thead>
                        <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                            <th className="p-2 border-r border-border/60 text-center w-24">Cohorte</th>
                            <th className="p-2 border-r border-border/60 text-left">Especialidad / Carrera</th>
                            <th className="p-2 border-r border-border/60 text-center w-36">Estudiantes Evaluados</th>
                            <th className="p-2 border-r border-border/60 text-center w-32">Promedio Notas (PPA)</th>
                            <th className="p-2 border-r border-border/60 text-center w-36">Créditos Prom. Aprobados</th>
                            <th className="p-2 text-center w-32">Tasa Aprobación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const hasPpa = row.promedio_ponderado_promedio !== null;
                            const hasTasa = row.tasa_aprobacion !== null;

                            return (
                                <tr 
                                    key={`${row.cohorte}-${row.especialidad_nombre}`} 
                                    className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                                >
                                    <td className="p-2 border-r border-border/60 text-center font-mono font-bold text-text-heading">
                                        {row.cohorte}
                                    </td>
                                    <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                                        {row.especialidad_nombre}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-medium text-text-muted">
                                        {row.total_estudiantes}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">
                                        {hasPpa ? row.promedio_ponderado_promedio.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                        {row.total_creditos_aprobados_promedio !== null ? row.total_creditos_aprobados_promedio.toFixed(1) : '-'}
                                    </td>
                                    <td className="p-2 text-center font-bold">
                                        {hasTasa ? (
                                            <span className={row.tasa_aprobacion >= 70 ? 'text-green-700' : 'text-orange-700'}>
                                                {row.tasa_aprobacion.toFixed(1)}%
                                            </span>
                                        ) : '-'}
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
