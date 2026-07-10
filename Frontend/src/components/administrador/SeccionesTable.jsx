import { Eye, FileCheck2 } from 'lucide-react';

export default function SeccionesTable({ secciones = [], onPreview, onCloseActa }) {
    if (secciones.length === 0) {
        return (
            <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                No se encontraron secciones en este periodo académico.
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
                            <th className="p-2 border-r border-border/60 text-left min-w-[200px]">Curso</th>
                            <th className="p-2 border-r border-border/60 text-left">Docente</th>
                            <th className="p-2 border-r border-border/60 text-center w-28">Horario</th>
                            <th className="p-2 border-r border-border/60 text-center w-24">Aula</th>
                            <th className="p-2 border-r border-border/60 text-center w-24">Estado</th>
                            <th className="p-2 text-center w-40">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {secciones.map((row, idx) => {
                            const isEven = idx % 2 === 0;
                            const isClosed = row.estado === 'cerrada';
                            
                            return (
                                <tr 
                                    key={row.id_seccion} 
                                    className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                                >
                                    <td className="p-2 border-r border-border/60 text-center font-mono font-medium text-text-heading">
                                        {row.codigo}
                                    </td>
                                    <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                                        {row.curso_nombre}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-text-heading font-medium">
                                        {row.docente_nombre || 'No asignado'}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center text-text-muted">
                                        {row.horario || '-'}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-mono text-text-muted">
                                        {row.aula || '-'}
                                    </td>
                                    <td className="p-2 border-r border-border/60 text-center font-bold">
                                        {isClosed ? (
                                            <span className="text-red-700">Cerrada</span>
                                        ) : (
                                            <span className="text-green-700">Abierta</span>
                                        )}
                                    </td>
                                    <td className="p-2 text-center flex items-center justify-center gap-1.5">
                                        <button
                                            onClick={() => onPreview(row.id_seccion, row.curso_nombre)}
                                            title="Ver Notas"
                                            className="flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold uppercase tracking-wider"
                                        >
                                            <Eye size={12} />
                                            Acta
                                        </button>
                                        <button
                                            onClick={() => onCloseActa(row.id_seccion)}
                                            disabled={isClosed}
                                            title={isClosed ? 'Acta ya cerrada' : 'Cerrar Acta y Validar Notas'}
                                            className="flex items-center gap-1 text-[10px] px-2 py-1 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider border-none"
                                        >
                                            <FileCheck2 size={12} />
                                            Cerrar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col gap-3">
                {secciones.map((row) => {
                    const isClosed = row.estado === 'cerrada';
                    
                    return (
                        <div 
                            key={row.id_seccion} 
                            className="bg-white border border-border p-3 flex flex-col gap-2.5 shadow-xs"
                        >
                            <div className="flex justify-between items-start gap-3 border-b border-border/60 pb-1.5">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-text-heading text-xs leading-snug break-words">
                                        {row.curso_nombre}
                                    </h4>
                                    <span className="text-[9px] text-text-muted font-mono font-medium mt-0.5 block">
                                        Sección {row.codigo} | Aula {row.aula || '-'}
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] font-bold border shrink-0 uppercase tracking-wider ${
                                    isClosed ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                    {isClosed ? 'Cerrada' : 'Abierta'}
                                </span>
                            </div>

                            <div className="text-xs flex flex-col gap-1">
                                <div>
                                    <span className="text-text-muted font-medium">Docente:</span>{' '}
                                    <span className="text-text-heading font-semibold">{row.docente_nombre || 'No asignado'}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted font-medium">Horario:</span>{' '}
                                    <span className="text-text-heading font-mono">{row.horario || '-'}</span>
                                </div>
                            </div>

                            {/* Botones de acción móvil */}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button
                                    onClick={() => onPreview(row.id_seccion, row.curso_nombre)}
                                    className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold text-[10px] uppercase tracking-wider"
                                >
                                    <Eye size={12} />
                                    Ver Notas
                                </button>
                                <button
                                    onClick={() => onCloseActa(row.id_seccion)}
                                    disabled={isClosed}
                                    className="flex items-center justify-center gap-1 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-wider border-none"
                                >
                                    <FileCheck2 size={12} />
                                    Cerrar Acta
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
