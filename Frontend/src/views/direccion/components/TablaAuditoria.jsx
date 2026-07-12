import React from 'react';
import { Search } from 'lucide-react';

export default function TablaAuditoria({
  auditorias = [],
  estaCargando,
  abrirModalDetalle,
  obtenerColorInsignia
}) {
  if (estaCargando) {
    return (
      <div className="p-12 text-center border border-border bg-white rounded-none shadow-sm flex flex-col items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-[0.88rem] text-text-muted font-bold">Consultando servidor...</p>
      </div>
    );
  }

  if (auditorias.length === 0) {
    return (
      <div className="p-12 text-center text-text-muted border border-border bg-white rounded-none shadow-sm font-semibold">
        No se encontraron registros de auditoría en la base de datos para este filtro.
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-none shadow-xs overflow-hidden w-full min-w-0">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="bg-primary-light text-primary border-b border-border font-bold uppercase tracking-wide">
              <th className="p-3 text-[0.8rem] border-r border-border/50">Acción</th>
              <th className="p-3 text-[0.8rem] border-r border-border/50">Tabla Afectada</th>
              <th className="p-3 text-[0.8rem] border-r border-border/50 w-24 text-center">ID Registro</th>
              <th className="p-3 text-[0.8rem] border-r border-border/50">Usuario Autor</th>
              <th className="p-3 text-[0.8rem] border-r border-border/50 w-32 font-mono">IP Origen</th>
              <th className="p-3 text-[0.8rem] border-r border-border/50">Fecha y Hora</th>
              <th className="p-3 text-center w-36">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditorias.map((audit) => (
              <tr key={audit.id_auditoria} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-[0.82rem] font-bold border-r border-border/40">
                  <span className={`py-1 px-2.5 rounded-none border text-[10px] font-black uppercase tracking-wider inline-block ${obtenerColorInsignia(audit.accion)}`}>
                    {audit.accion}
                  </span>
                </td>
                <td className="p-3 text-[0.88rem] font-semibold text-text-heading font-mono border-r border-border/40">
                  {audit.tabla}
                </td>
                <td className="p-3 text-[0.88rem] font-bold text-slate-600 text-center border-r border-border/40 font-mono">
                  {audit.registro || '-'}
                </td>
                <td className="p-3 text-[0.88rem] font-bold text-text-heading border-r border-border/40">
                  {audit.usuario_nombre || 'Invitado/Anónimo'}
                </td>
                <td className="p-3 text-[0.88rem] font-bold text-slate-500 font-mono border-r border-border/40">
                  {audit.ip || '-'}
                </td>
                <td className="p-3 text-[0.82rem] font-semibold text-text-muted border-r border-border/40">
                  {new Date(audit.fecha).toLocaleString('es-PE')}
                </td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => abrirModalDetalle(audit)}
                    className="flex items-center justify-center gap-1.5 bg-bg-alt hover:bg-slate-100 border border-border text-text-heading py-1 px-3.5 rounded-none text-[0.82rem] font-bold transition-all cursor-pointer shadow-sm mx-auto"
                  >
                    <Search size={12} />
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
