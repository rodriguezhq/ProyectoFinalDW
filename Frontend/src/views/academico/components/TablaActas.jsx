import React from 'react';
import { Eye, Lock } from 'lucide-react';

export default function TablaActas({
    actas = [],
    verDetalleActa,
    ejecutarValidarActa
}) {
    if (actas.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-8 text-center text-sm text-text-muted rounded-none font-bold">
                No se encontraron actas registradas para este periodo.
            </div>
        );
    }

    return (
        <div className="w-full max-w-full overflow-x-auto border border-border bg-white rounded-none shadow-xs min-w-0">
            <table className="w-full border-collapse text-left text-xs text-text-main min-w-[800px]">
                <thead>
                    <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                        <th className="p-3 border-r border-border/60 text-left min-w-[200px]">Carrera</th>
                        <th className="p-3 border-r border-border/60 text-center w-16">Ciclo</th>
                        <th className="p-3 border-r border-border/60 text-center w-28">Código</th>
                        <th className="p-3 border-r border-border/60 text-left min-w-[200px]">Asignatura</th>
                        <th className="p-3 border-r border-border/60 text-center w-16">Secc.</th>
                        <th className="p-3 border-r border-border/60 text-left">Docente</th>
                        <th className="p-3 border-r border-border/60 text-center w-20">Alumnos</th>
                        <th className="p-3 border-r border-border/60 text-center w-36">Estado Acta</th>
                        <th className="p-3 text-center w-40">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {actas.map((acta, idx) => {
                        const isEven = idx % 2 === 0;
                        const isCerrada = acta.estado_acta === 'cerrada';

                        return (
                            <tr key={`${acta.id_seccion}-${acta.id_curso}`} className={`border-b border-border hover:bg-slate-50 transition-colors ${isEven ? 'bg-white' : 'bg-slate-50/30'}`}>
                                <td className="p-3 border-r border-border/60 font-black text-text-heading">
                                    {acta.especialidad_nombre}
                                </td>
                                <td className="p-3 border-r border-border/60 text-center font-bold">
                                    {acta.ciclo}
                                </td>
                                <td className="p-3 border-r border-border/60 text-center font-mono font-bold text-text-muted">
                                    {acta.curso_codigo}
                                </td>
                                <td className="p-3 border-r border-border/60 font-black text-text-heading">
                                    {acta.curso_nombre}
                                </td>
                                <td className="p-3 border-r border-border/60 text-center font-mono font-extrabold text-sm">
                                    {acta.seccion_codigo}
                                </td>
                                <td className="p-3 border-r border-border/60 font-bold text-text-muted">
                                    {acta.docente_nombre}
                                </td>
                                <td className="p-3 border-r border-border/60 text-center font-bold text-slate-700">
                                    {acta.total_estudiantes}
                                </td>
                                <td className="p-3 border-r border-border/60 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider ${
                                        isCerrada 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                        {isCerrada ? 'Validada' : 'Abierta'}
                                    </span>
                                </td>
                                <td className="p-2 text-center">
                                    <div className="flex gap-1 justify-center items-center">
                                        <button
                                            type="button"
                                            onClick={() => verDetalleActa(acta)}
                                            className="flex items-center justify-center gap-1.5 py-1 px-2.5 bg-bg-alt hover:bg-slate-100 border border-border text-text-heading font-bold text-[10px] uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                                        >
                                            <Eye size={12} />
                                            Ver
                                        </button>
                                        {!isCerrada && (
                                            <button
                                                type="button"
                                                onClick={() => ejecutarValidarActa(acta.id_seccion, acta.id_curso)}
                                                disabled={acta.total_estudiantes === 0}
                                                className="flex items-center justify-center gap-1.5 py-1 px-2.5 bg-primary text-white border-none hover:bg-primary-dark font-bold text-[10px] uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={acta.total_estudiantes === 0 ? 'Sin alumnos inscritos' : 'Consolidar y cerrar notas'}
                                            >
                                                <Lock size={12} />
                                                Cerrar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
