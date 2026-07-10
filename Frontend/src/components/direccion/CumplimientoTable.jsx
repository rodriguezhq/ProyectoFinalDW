import React from 'react';
import { BookOpen, CheckCircle, Percent } from 'lucide-react';

export default function CumplimientoTable({ reporte = null }) {
    if (!reporte || !reporte.detalle || reporte.detalle.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                Seleccione un Plan de Estudios y Periodo para ver el reporte de cumplimiento.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Tarjetas KPI de Cumplimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* KPI 1: Cursos Totales */}
                <div className="bg-slate-50 border border-border p-3 flex items-center gap-3">
                    <div className="p-2.5 bg-primary-light text-primary rounded-xs">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Cursos del Plan</span>
                        <span className="text-base font-extrabold text-text-heading">{reporte.total_cursos}</span>
                    </div>
                </div>

                {/* KPI 2: Con Sección Abierta */}
                <div className="bg-slate-50 border border-border p-3 flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 text-green-700 rounded-xs">
                        <CheckCircle size={18} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Cursos con Sección</span>
                        <span className="text-base font-extrabold text-text-heading">{reporte.cursos_con_seccion}</span>
                    </div>
                </div>

                {/* KPI 3: Porcentaje Cumplimiento */}
                <div className="bg-slate-50 border border-border p-3 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xs">
                        <Percent size={18} />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Cumplimiento</span>
                        <span className="text-base font-extrabold text-text-heading">{reporte.porcentaje_cumplimiento}%</span>
                    </div>
                </div>
            </div>

            {/* Tabla con scroll horizontal responsivo aislado */}
            <div className="w-full max-w-full overflow-x-auto border border-border bg-white min-w-0">
                <table className="w-full border-collapse text-left text-xs text-text-main min-w-[500px]">
                    <thead>
                        <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                            <th className="p-2 border-r border-border/60 text-center w-24">Ciclo</th>
                            <th className="p-2 border-r border-border/60 text-center w-28">ID Curso</th>
                            <th className="p-2 border-r border-border/60 text-left">Asignatura / Curso</th>
                            <th className="p-2 text-center w-40">Sección Abierta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reporte.detalle.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const hasSection = row.tiene_seccion_abierta;

                            return (
                                <tr 
                                    key={row.id_curso} 
                                    className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                                >
                                    <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">
                                        Ciclo {row.ciclo}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-mono text-text-muted">
                                        {row.id_curso}
                                    </td>
                                    <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                                        {row.curso}
                                    </td>
                                    <td className="p-2 text-center font-bold">
                                        {hasSection ? (
                                            <span className="px-2 py-0.5 rounded-xs text-[10px] bg-green-50 border border-green-200 text-green-700">
                                                Sí (Activo)
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-xs text-[10px] bg-red-50 border border-red-200 text-red-700">
                                                No (Inactivo)
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
    );
}
