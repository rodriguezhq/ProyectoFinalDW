import React from 'react';

export default function GradesTable({ notas = [] }) {
    if (notas.length === 0) {
        return (
            <div className="w-full bg-[#E8F5E9] border border-border p-6 text-center text-sm text-text-muted">
                No hay calificaciones registradas para este periodo.
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
                            {/* Columna fija de Curso en cabecera */}
                            <th className="p-2 border-r border-border/60 text-left sticky left-0 bg-[#E8F5E9] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)]">
                                Curso
                            </th>
                            <th className="p-2 border-r border-border/60 text-center">Parcial 1</th>
                            <th className="p-2 border-r border-border/60 text-center">Parcial 2</th>
                            <th className="p-2 border-r border-border/60 text-center">Final</th>
                            <th className="p-2 border-r border-border/60 text-center">Susti</th>
                            <th className="p-2 border-r border-border/60 text-center">Promedio</th>
                            <th className="p-2 text-center w-28">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notas.map((row, index) => {
                            const hasAverage = row.promedio !== null;
                            const isEven = index % 2 === 0;
                            // Fondo del renglón para sincronizar con la columna sticky
                            const rowBg = isEven ? 'bg-white' : 'bg-[#F8FAFC]';

                            return (
                                <tr
                                    key={row.id_nota || row.id_matricula_detalle}
                                    className={`border-b border-border ${rowBg}`}
                                >
                                    {/* Celda fija de Curso con Nombre + Código */}
                                    <td className={`p-2 border-r border-border/60 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.12)] ${rowBg}`}>
                                        <div className="font-semibold text-text-heading leading-tight">
                                            {row.curso_nombre || '-'}
                                        </div>
                                        <div className="text-[10px] text-text-muted font-mono font-medium mt-0.5">
                                            {row.curso_codigo || '-'}
                                        </div>
                                    </td>

                                    {/* Parcial 1 */}
                                    <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                        {row.parcial1 !== null ? row.parcial1.toFixed(1) : '-'}
                                    </td>

                                    {/* Parcial 2 */}
                                    <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                        {row.parcial2 !== null ? row.parcial2.toFixed(1) : '-'}
                                    </td>

                                    {/* Final */}
                                    <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                        {row.final !== null ? row.final.toFixed(1) : '-'}
                                    </td>

                                    {/* Sustitutorio */}
                                    <td className="p-2 border-r border-border/60 text-center font-medium text-text-heading">
                                        {row.sustitutorio !== null ? row.sustitutorio.toFixed(1) : '-'}
                                    </td>

                                    {/* Promedio */}
                                    <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">
                                        {hasAverage ? row.promedio.toFixed(2) : '-'}
                                    </td>

                                    {/* Estado */}
                                    <td className="p-2 text-center font-bold">
                                        {row.estado === 'aprobada' && (
                                            <span className="text-green-700">Aprobado</span>
                                        )}
                                        {row.estado === 'desaprobada' && (
                                            <span className="text-red-700">Desaprobado</span>
                                        )}
                                        {row.estado === 'registrada' && (
                                            <span className="text-blue-700">Registrada</span>
                                        )}
                                        {row.estado === 'sin_nota' && (
                                            <span className="text-text-muted font-normal">Sin Nota</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-3">
                {notas.map((row) => {
                    const hasAverage = row.promedio !== null;

                    // Colores de estado
                    let statusBg = "bg-slate-50 text-text-muted border-border";
                    let statusLabel = "Sin Nota";
                    if (row.estado === 'aprobada') {
                        statusBg = "bg-green-50 text-green-700 border-green-200";
                        statusLabel = "Aprobado";
                    } else if (row.estado === 'desaprobada') {
                        statusBg = "bg-red-50 text-red-700 border-red-200";
                        statusLabel = "Desaprobado";
                    } else if (row.estado === 'registrada') {
                        statusBg = "bg-blue-50 text-blue-700 border-blue-200";
                        statusLabel = "Registrada";
                    }

                    return (
                        <div
                            key={row.id_nota || row.id_matricula_detalle}
                            className="bg-white border border-border p-3.5 flex flex-col gap-3 shadow-xs"
                        >
                            {/* Nombre del curso y código */}
                            <div className="flex justify-between items-start gap-3 border-b border-border/60 pb-2">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-text-heading text-xs leading-snug break-words">
                                        {row.curso_nombre || '-'}
                                    </h4>
                                    <span className="text-[10px] text-text-muted font-mono font-medium mt-0.5 block">
                                        {row.curso_codigo || '-'}
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] font-bold border shrink-0 uppercase tracking-wider ${statusBg}`}>
                                    {statusLabel}
                                </span>
                            </div>

                            {/* Notas del curso */}
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Parcial 1</span>
                                    <span className="font-semibold text-text-heading">
                                        {row.parcial1 !== null ? row.parcial1.toFixed(1) : '-'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Parcial 2</span>
                                    <span className="font-semibold text-text-heading">
                                        {row.parcial2 !== null ? row.parcial2.toFixed(1) : '-'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Final</span>
                                    <span className="font-semibold text-text-heading">
                                        {row.final !== null ? row.final.toFixed(1) : '-'}
                                    </span>
                                </div>
                                <div className="bg-slate-50 border border-border/40 p-2 flex flex-col justify-center">
                                    <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider mb-1">Susti</span>
                                    <span className="font-semibold text-text-heading">
                                        {row.sustitutorio !== null ? row.sustitutorio.toFixed(1) : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Promedio Final */}
                            <div className="flex justify-between items-center bg-primary-light/50 border border-primary/10 px-3 py-2 text-xs">
                                <span className="font-bold text-primary uppercase tracking-wider text-[9px]">Promedio del Curso</span>
                                <span className="text-xs font-extrabold text-primary bg-white border border-primary/20 px-2 py-0.5 shrink-0">
                                    {hasAverage ? row.promedio.toFixed(2) : '-'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
