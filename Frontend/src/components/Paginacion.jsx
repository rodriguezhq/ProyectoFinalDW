import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Paginación numerada reutilizable: "Mostrando X de Y — página P de N" + botones ‹ 1 2 3 ›
export default function Paginacion({ cantidadMostrada, total, pagina, totalPaginas, irAPagina }) {
  if (totalPaginas <= 1) {
    return (
      <div className="p-3 border-t border-border bg-bg-alt/50">
        <span className="text-[0.78rem] text-text-muted font-semibold">
          Mostrando {cantidadMostrada} de {total} registros
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-border bg-bg-alt/50">
      <span className="text-[0.78rem] text-text-muted font-semibold">
        Mostrando {cantidadMostrada} de {total} registros — página {pagina} de {totalPaginas}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => irAPagina(pagina - 1)}
          disabled={pagina === 1}
          className="flex items-center justify-center w-8 h-8 bg-white hover:bg-slate-100 border border-border text-text-heading rounded-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
          <button
            key={numeroPagina}
            type="button"
            onClick={() => irAPagina(numeroPagina)}
            className={`flex items-center justify-center min-w-8 h-8 px-2 border text-[0.8rem] font-bold rounded-none transition-all cursor-pointer ${
              numeroPagina === pagina
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-heading border-border hover:bg-slate-100'
            }`}
          >
            {numeroPagina}
          </button>
        ))}
        <button
          type="button"
          onClick={() => irAPagina(pagina + 1)}
          disabled={pagina === totalPaginas}
          className="flex items-center justify-center w-8 h-8 bg-white hover:bg-slate-100 border border-border text-text-heading rounded-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
