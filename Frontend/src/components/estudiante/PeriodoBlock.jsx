import React from 'react';

export default function PeriodoBlock({ periodo }) {
    if (!periodo) return null;
    
    const semAvg = periodo.promedio_ponderado_periodo;

    return (
        <div className="bg-white border border-border rounded-xl p-4 md:p-5 shadow-xs space-y-4">
            {/* Cabecera del Semestre */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border pb-3 gap-2">
                <div>
                    <h3 className="font-heading font-black text-text-heading text-base">
                        Ciclo Académico {periodo.periodo_nombre}
                    </h3>
                    <div className="flex gap-4 text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                        <span>Matriculados: <strong className="text-text-heading">{periodo.creditos_matriculados_periodo} Cr.</strong></span>
                        <span>Aprobados: <strong className="text-emerald-600">{periodo.creditos_aprobados_periodo} Cr.</strong></span>
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <span className="text-lg font-extrabold text-primary font-mono block">
                        {semAvg !== null && semAvg !== undefined ? semAvg.toFixed(2) : '-'}
                    </span>
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Promedio del Ciclo</span>
                </div>
            </div>

            {/* Tabla de Asignaturas del Semestre (Scroll horizontal responsivo aislado) */}
            <div className="w-full max-w-full overflow-x-auto border border-border bg-white rounded-lg min-w-0">
                <table className="w-full border-collapse text-left text-xs min-w-[650px]">
                    <thead>
                        <tr className="bg-slate-50 text-text-muted font-bold border-b border-border">
                            <th className="p-2.5 w-24">Código</th>
                            <th className="p-2.5 min-w-[200px]">Asignatura / Curso</th>
                            <th className="p-2.5 text-center w-20">Créditos</th>
                            <th className="p-2.5 text-center w-12">P1</th>
                            <th className="p-2.5 text-center w-12">P2</th>
                            <th className="p-2.5 text-center w-12">EF</th>
                            <th className="p-2.5 text-center w-12">SU</th>
                            <th className="p-2.5 text-center w-16">Promedio</th>
                            <th className="p-2.5 text-center w-28">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {periodo.cursos.map((c, idx) => {
                            const isAprobado = c.promedio !== null && c.promedio !== undefined && c.promedio >= 10.5;
                            const isRetirado = c.estado_detalle === 'retirado';

                            let badgeClass = "bg-slate-50 text-slate-500 border border-slate-200";
                            let estadoStr = "Pendiente";

                            if (isRetirado) {
                                badgeClass = "bg-slate-100 text-slate-600 border border-slate-300";
                                estadoStr = "Retirado";
                            } else if (c.promedio !== null && c.promedio !== undefined) {
                                if (isAprobado) {
                                    badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-150";
                                    estadoStr = "Aprobado";
                                } else {
                                    badgeClass = "bg-red-50 text-red-700 border border-red-150";
                                    estadoStr = "Desaprobado";
                                }
                            }

                            return (
                                <tr 
                                    key={c.curso_codigo} 
                                    className={`border-b border-border/50 hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}
                                >
                                    <td className="p-2.5 font-mono text-[10px] text-text-muted">{c.curso_codigo}</td>
                                    <td className="p-2.5 font-semibold text-text-heading">{c.curso_nombre}</td>
                                    <td className="p-2.5 text-center font-medium text-text-muted">{c.creditos}</td>
                                    <td className="p-2.5 text-center font-mono text-[10px]">{c.parcial1 !== null && c.parcial1 !== undefined ? c.parcial1.toFixed(1) : '-'}</td>
                                    <td className="p-2.5 text-center font-mono text-[10px]">{c.parcial2 !== null && c.parcial2 !== undefined ? c.parcial2.toFixed(1) : '-'}</td>
                                    <td className="p-2.5 text-center font-mono text-[10px]">{c.final !== null && c.final !== undefined ? c.final.toFixed(1) : '-'}</td>
                                    <td className="p-2.5 text-center font-mono text-[10px]">{c.sustitutorio !== null && c.sustitutorio !== undefined ? c.sustitutorio.toFixed(1) : '-'}</td>
                                    <td className="p-2.5 text-center font-mono font-bold text-primary text-sm">
                                        {c.promedio !== null && c.promedio !== undefined ? c.promedio.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${badgeClass}`}>
                                            {estadoStr}
                                        </span>
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
