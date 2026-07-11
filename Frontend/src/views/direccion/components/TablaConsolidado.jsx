import React from 'react';

export default function TablaConsolidado({ alumnos = [] }) {
    if (alumnos.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted rounded-xl">
                No se encontraron estudiantes matriculados en esta especialidad.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <h3 className="font-heading font-extrabold text-sm text-text-heading uppercase tracking-wider">
                Consolidado de Calificaciones por Estudiante (Total: {alumnos.length} Alumnos)
            </h3>

            {/* Tabla con scroll horizontal responsivo aislado */}
            <div className="w-full max-w-full overflow-x-auto border border-border bg-white rounded-xl shadow-xs min-w-0">
                <table className="w-full border-collapse text-left text-xs text-text-main min-w-[750px]">
                    <thead>
                        <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                            <th className="p-3 border-r border-border/60 text-center w-28">Código</th>
                            <th className="p-3 border-r border-border/60 text-left min-w-[200px]">Apellidos y Nombres</th>
                            <th className="p-3 border-r border-border/60 text-left">Especialidad</th>
                            <th className="p-3 border-r border-border/60 text-center w-32">Créditos Mat.</th>
                            <th className="p-3 border-r border-border/60 text-center w-32">Créditos Aprob.</th>
                            <th className="p-3 border-r border-border/60 text-center w-32">Promedio PPA</th>
                            <th className="p-3 text-center w-28">Semestres</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const hasPpa = row.promedio_ponderado_acumulado !== null && row.promedio_ponderado_acumulado !== undefined;

                            return (
                                <tr 
                                    key={row.id_estudiante} 
                                    className={`border-b border-border hover:bg-slate-50 transition-colors ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                                >
                                    <td className="p-3 border-r border-border/60 text-center font-mono font-extrabold text-text-heading text-sm">
                                        {row.codigo}
                                    </td>
                                    <td className="p-3 border-r border-border/60 font-bold text-text-heading">
                                        {row.apellidos}, {row.nombres}
                                    </td>
                                    <td className="p-3 border-r border-border/60 font-medium text-text-muted">
                                        {row.especialidad_nombre}
                                    </td>
                                    <td className="p-3 border-r border-border/60 text-center font-semibold text-text-heading font-mono">
                                        {row.total_creditos_matriculados}
                                    </td>
                                    <td className="p-3 border-r border-border/60 text-center font-semibold text-emerald-700 font-mono">
                                        {row.total_creditos_aprobados}
                                    </td>
                                    <td className="p-3 border-r border-border/60 text-center font-black text-primary font-mono text-sm">
                                        {hasPpa ? row.promedio_ponderado_acumulado.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-3 text-center font-medium text-text-muted font-mono">
                                        {row.periodos_matriculados} Sem.
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
