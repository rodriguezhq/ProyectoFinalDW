import React from 'react';
import { Search } from 'lucide-react';

export default function FiltrosActas({
    periodos = [],
    selectedPeriodo,
    setSelectedPeriodo,
    filtroTextoActas,
    setFiltroTextoActas
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-alt border border-border p-4 rounded-none shadow-xs">
            <div className="flex flex-col gap-1.5">
                <label htmlFor="periodo-select" className="text-xs font-bold uppercase tracking-wider text-text-muted font-heading">
                    Periodo Académico (Semestre):
                </label>
                <select
                    id="periodo-select"
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                    className="w-full bg-white border border-border text-sm p-2 rounded-none outline-none focus:border-primary font-bold cursor-pointer"
                >
                    {periodos.map(p => (
                        <option key={p.id_periodo} value={p.id_periodo}>
                            {p.nombre} {p.estado === 'activo' ? '(Activo)' : ''}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1.5 justify-end">
                <div className="relative">
                    <input
                        type="text"
                        value={filtroTextoActas}
                        onChange={(e) => setFiltroTextoActas(e.target.value)}
                        placeholder="Filtrar por carrera, curso o docente..."
                        className="w-full bg-white border border-border text-xs py-2 pl-9 pr-4 rounded-none outline-none focus:border-primary font-bold"
                    />
                    <Search className="absolute left-3 top-2.5 text-text-muted" size={14} />
                </div>
            </div>
        </div>
    );
}
