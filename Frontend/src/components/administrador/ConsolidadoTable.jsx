export default function ConsolidadoTable({ alumnos = [] }) {
    if (alumnos.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                No se encontraron registros de estudiantes para esta especialidad.
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block w-full max-w-full overflow-x-auto border border-border bg-white">
                <table className="w-full border-collapse text-left text-xs text-text-main">
                    <thead>
                        <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                            <th className="p-2 border-r border-border/60 text-center w-24">Código</th>
                            <th className="p-2 border-r border-border/60 text-left">Estudiante</th>
                            <th className="p-2 border-r border-border/60 text-left">Especialidad</th>
                            <th className="p-2 border-r border-border/60 text-center w-28">Créditos Matr.</th>
                            <th className="p-2 border-r border-border/60 text-center w-28">Créditos Aprob.</th>
                            <th className="p-2 border-r border-border/60 text-center w-28">PPA</th>
                            <th className="p-2 text-center w-24">Ciclos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const hasPpa = row.promedio_ponderado_acumulado !== null;

                            return (
                                <tr
                                    key={row.id_estudiante}
                                    className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                                >
                                    <td className="p-2 border-r border-border/60 text-center font-mono font-medium text-text-heading">
                                        {row.codigo}
                                    </td>
                                    <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                                        {row.apellidos}, {row.nombres}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-text-muted font-medium">
                                        {row.especialidad_nombre}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center text-text-heading font-medium">
                                        {row.total_creditos_matriculados}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center text-green-700 font-bold">
                                        {row.total_creditos_aprobados}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">
                                        {hasPpa ? row.promedio_ponderado_acumulado.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-2 text-center font-mono text-text-muted">
                                        {row.periodos_matriculados}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col gap-3">
                {alumnos.map((row) => {
                    const hasPpa = row.promedio_ponderado_acumulado !== null;

                    return (
                        <div
                            key={row.id_estudiante}
                            className="bg-white border border-border p-3.5 flex flex-col gap-3 shadow-xs"
                        >
                            {/* Nombre del alumno y código */}
                            <div className="flex justify-between items-start gap-3 border-b border-border/60 pb-2">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-text-heading text-xs leading-snug break-words">
                                        {row.apellidos}, {row.nombres}
                                    </h4>
                                    <span className="text-[9px] text-text-muted font-mono font-medium mt-0.5 block">
                                        Código: {row.codigo} | {row.especialidad_nombre}
                                    </span>
                                </div>
                            </div>

                            {/* Estadísticas de créditos y ciclos */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Créd. Matr.</span>
                                    <span className="font-semibold text-text-heading">
                                        {row.total_creditos_matriculados}
                                    </span>
                                </div>
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Créd. Aprob.</span>
                                    <span className="font-semibold text-green-700">
                                        {row.total_creditos_aprobados}
                                    </span>
                                </div>
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Ciclos Matr.</span>
                                    <span className="font-semibold text-text-heading">
                                        {row.periodos_matriculados}
                                    </span>
                                </div>
                            </div>

                            {/* Promedio Ponderado Acumulado */}
                            <div className="flex justify-between items-center bg-primary-light/50 border border-primary/10 px-3 py-2 text-xs">
                                <span className="font-bold text-primary uppercase tracking-wider text-[9px]">Promedio Ponderado Acumulado (PPA)</span>
                                <span className="text-xs font-extrabold text-primary bg-white border border-primary/20 px-2 py-0.5 shrink-0">
                                    {hasPpa ? row.promedio_ponderado_acumulado.toFixed(2) : '-'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
