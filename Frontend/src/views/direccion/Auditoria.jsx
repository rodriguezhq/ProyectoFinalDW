import React, { useState } from 'react';
import { ScrollText, Search, X } from 'lucide-react';
import { useAuditoria } from '../../hooks/direccion/useAuditoria';

export default function Auditoria() {
  const {
    auditorias,
    estaCargando,
    accionesDisponibles,
    usuariosDisponibles,
    filtroAccion,
    filtroUsuario,
    cambiarFiltroAccion,
    cambiarFiltroUsuario,
    limpiarFiltros
  } = useAuditoria();

  // Modal para ver detalles
  const [auditSeleccionado, setAuditSeleccionado] = useState(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);

  const abrirModalDetalle = (audit) => {
    setAuditSeleccionado(audit);
    setModalDetalleOpen(true);
  };

  const obtenerColorInsignia = (accion) => {
    const act = (accion || '').toLowerCase();
    if (act.includes('crear') || act.includes('registrar_pago')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    if (act.includes('actualizar') || act.includes('modificar') || act.includes('seccion')) {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (act.includes('eliminar') || act.includes('rechazar')) {
      return 'bg-rose-50 text-rose-700 border-rose-100';
    }
    if (act.includes('login_exitoso') || act.includes('aprobar')) {
      return 'bg-sky-50 text-sky-700 border-sky-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1"><ScrollText size={20} /> Bitácora de Auditoría</h3>
            <p className="text-[0.88rem] text-text-muted">Registro completo de operaciones, inicios de sesión y modificaciones del sistema.</p>
          </div>
          {(filtroAccion || filtroUsuario) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="border border-border hover:bg-slate-50 text-text-muted py-2 px-4 text-[0.85rem] font-bold rounded-md transition-colors cursor-pointer self-start sm:self-auto"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filtro-accion" className="text-[0.78rem] font-bold text-text-muted uppercase">Filtrar por Acción</label>
            <select
              id="filtro-accion"
              value={filtroAccion}
              onChange={(e) => cambiarFiltroAccion(e.target.value)}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Todas las Acciones --</option>
              {accionesDisponibles.map(accion => (
                <option key={accion} value={accion}>
                  {accion}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filtro-usuario" className="text-[0.78rem] font-bold text-text-muted uppercase">Filtrar por Usuario</label>
            <select
              id="filtro-usuario"
              value={filtroUsuario}
              onChange={(e) => cambiarFiltroUsuario(e.target.value)}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Todos los Usuarios --</option>
              {usuariosDisponibles.map(user => (
                <option key={user.id_usuario} value={user.id_usuario}>
                  {user.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Consultando servidor...</p>
            </div>
          ) : auditorias.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No se encontraron registros de auditoría en la base de datos para este filtro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Acción</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Tabla Afectada</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">ID Registro</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Usuario</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">IP de Origen</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Fecha y Hora</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditorias.map((audit) => (
                    <tr key={audit.id_auditoria} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.82rem] font-bold">
                        <span className={`py-1 px-2.5 rounded-full border ${obtenerColorInsignia(audit.accion)}`}>
                          {audit.accion}
                        </span>
                      </td>
                      <td className="p-4 text-[0.88rem] font-medium text-text-muted font-mono">{audit.tabla}</td>
                      <td className="p-4 text-[0.88rem] font-semibold text-slate-600">{audit.registro || '-'}</td>
                      <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{audit.usuario_nombre || 'Invitado/Anónimo'}</td>
                      <td className="p-4 text-[0.88rem] font-medium text-slate-500 font-mono">{audit.ip || '-'}</td>
                      <td className="p-4 text-[0.82rem] font-semibold text-text-muted">
                        {new Date(audit.fecha).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => abrirModalDetalle(audit)}
                          className="flex items-center gap-1 bg-primary/5 hover:bg-primary-light text-primary py-1 px-3.5 rounded text-[0.82rem] font-bold transition-all cursor-pointer border border-primary/10"
                        >
                          <Search size={14} /> Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {modalDetalleOpen && auditSeleccionado && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalDetalleOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[500px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="flex items-center gap-2 font-heading font-extrabold text-primary text-[1.1rem]">
                <Search size={18} /> Detalle de Operación Auditada
              </h3>
              <button
                type="button"
                onClick={() => setModalDetalleOpen(false)}
                className="text-text-muted hover:text-primary transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Acción Realizada</span>
                <div className="text-[0.95rem] font-extrabold">
                  <span className={`py-1 px-3 rounded-full border inline-block ${obtenerColorInsignia(auditSeleccionado.accion)}`}>
                    {auditSeleccionado.accion}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Tabla Afectada</span>
                  <span className="text-[0.9rem] font-mono font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded self-start">
                    {auditSeleccionado.tabla}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">ID de Registro</span>
                  <span className="text-[0.9rem] font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded self-start font-mono">
                    {auditSeleccionado.registro || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Usuario / Autor</span>
                  <span className="text-[0.9rem] font-semibold text-text-heading">
                    {auditSeleccionado.usuario_nombre || 'Invitado (Sin Login)'}
                  </span>
                  {auditSeleccionado.id_usuario && (
                    <span className="text-[0.75rem] text-text-muted font-mono">ID Usuario: {auditSeleccionado.id_usuario}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">IP de Origen</span>
                  <span className="text-[0.9rem] font-bold text-slate-600 font-mono">
                    {auditSeleccionado.ip || 'Local/Desconocido'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-1">
                <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Fecha y Hora de la Operación</span>
                <span className="text-[0.9rem] font-semibold text-text-heading">
                  {new Date(auditSeleccionado.fecha).toLocaleString()}
                </span>
                <span className="text-[0.78rem] text-text-muted font-mono">
                  {auditSeleccionado.fecha}
                </span>
              </div>
            </div>

            <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalDetalleOpen(false)}
                className="bg-primary text-white py-2 px-6 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
