import React from 'react';

export default function FiltrosAuditoria({
  filtroAccion,
  filtroUsuario,
  cambiarFiltroAccion,
  cambiarFiltroUsuario,
  accionesDisponibles = [],
  usuariosDisponibles = []
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-border rounded-none p-4 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filtro-accion" className="text-[0.78rem] font-bold text-text-muted uppercase">Filtrar por Acción</label>
        <select
          id="filtro-accion"
          value={filtroAccion}
          onChange={(e) => cambiarFiltroAccion(e.target.value)}
          className="p-2.5 border border-border rounded-none focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer font-medium"
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
          className="p-2.5 border border-border rounded-none focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer font-medium"
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
  );
}
