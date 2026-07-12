import React from 'react';
import { Search, FileSpreadsheet, FileText } from 'lucide-react';

export default function FiltrosConsolidado({
    especialidades = [],
    selectedEspecialidad,
    setSelectedEspecialidad,
    searchQuery,
    setSearchQuery,
    exportarExcel,
    exportarPDF,
    alumnosFiltrados = []
}) {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-alt border border-border p-4 rounded-none shadow-xs">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="especialidad-select" className="text-xs font-bold uppercase tracking-wider text-text-muted font-heading">
                        Seleccionar Carrera Académica:
                    </label>
                    <select
                        id="especialidad-select"
                        value={selectedEspecialidad}
                        onChange={(e) => setSelectedEspecialidad(e.target.value)}
                        className="w-full bg-white border border-border text-sm p-2 rounded-none outline-none focus:border-primary font-bold cursor-pointer"
                    >
                        {especialidades.map(esp => (
                            <option key={esp.id_especialidad} value={esp.id_especialidad}>
                                {esp.nombre} ({esp.codigo})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col justify-end text-xs text-text-muted italic leading-relaxed md:text-right font-semibold">
                    <span>Filtre los consolidados de notas oficiales para emitir reportes firmados.</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por código, nombres o apellidos..."
                        className="w-full bg-white border border-border text-xs py-2 pl-9 pr-4 rounded-none outline-none focus:border-primary font-bold"
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
        </div>
    );
}
