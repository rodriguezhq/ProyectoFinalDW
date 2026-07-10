import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function Auditoria() {
  const [auditorias, setAuditorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Opciones cargadas dinámicamente para los Dropdowns
  const [accionesDisponibles, setAccionesDisponibles] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);

  // Valores seleccionados de los Filtros (Dropdowns)
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  // Modal para ver detalle
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Carga inicial para popular la tabla y extraer los filtros únicos
  const fetchDatosIniciales = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/admin/auditoria`, { method: 'GET' });
      if (!response.ok) throw new Error('Error al cargar la bitácora de auditoría');
      const data = await response.json();
      const list = data.auditorias || [];
      setAuditorias(list);

      // Extraer acciones únicas para el dropdown
      const accionesUnicas = Array.from(new Set(list.map(a => a.accion).filter(Boolean)));
      setAccionesDisponibles(accionesUnicas);

      // Extraer usuarios únicos para el dropdown
      const usuariosMapa = {};
      list.forEach(a => {
        if (a.id_usuario && !usuariosMapa[a.id_usuario]) {
          usuariosMapa[a.id_usuario] = a.usuario_nombre || `ID: ${a.id_usuario}`;
        }
      });
      const usuariosLista = Object.keys(usuariosMapa).map(id => ({
        id_usuario: parseInt(id),
        nombre: usuariosMapa[id]
      }));
      setUsuariosDisponibles(usuariosLista);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Consulta al backend filtrando por parámetros
  const fetchFiltrado = async (accion, idUsuario) => {
    setIsLoading(true);
    try {
      let url = `/api/admin/auditoria`;
      const params = [];
      if (accion) params.push(`accion=${accion}`);
      if (idUsuario) params.push(`id_usuario=${idUsuario}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await apiFetch(url, { method: 'GET' });
      if (!response.ok) throw new Error('Error al filtrar los registros');
      const data = await response.json();
      setAuditorias(data.auditorias || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosIniciales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invocar consulta al backend cada vez que cambien los dropdowns
  const handleFiltroAccionChange = (e) => {
    const val = e.target.value;
    setFiltroAccion(val);
    fetchFiltrado(val, filtroUsuario);
  };

  const handleFiltroUsuarioChange = (e) => {
    const val = e.target.value;
    setFiltroUsuario(val);
    fetchFiltrado(filtroAccion, val);
  };

  const limpiarFiltros = () => {
    setFiltroAccion('');
    setFiltroUsuario('');
    fetchFiltrado('', '');
  };

  const openDetailModal = (audit) => {
    setSelectedAudit(audit);
    setDetailModalOpen(true);
  };

  const getBadgeColor = (accion) => {
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
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">📜 Bitácora de Auditoría</h3>
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

        {/* Barra de Filtros (Dropdowns conectados al Backend) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filtro-accion" className="text-[0.78rem] font-bold text-text-muted uppercase">Filtrar por Acción</label>
            <select
              id="filtro-accion"
              value={filtroAccion}
              onChange={handleFiltroAccionChange}
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
              onChange={handleFiltroUsuarioChange}
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

        {/* Tabla de Resultados */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
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
                        <span className={`py-1 px-2.5 rounded-full border ${getBadgeColor(audit.accion)}`}>
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
                          onClick={() => openDetailModal(audit)}
                          className="bg-primary/5 hover:bg-primary-light text-primary py-1 px-3.5 rounded text-[0.82rem] font-bold transition-all cursor-pointer border border-primary/10"
                        >
                          🔎 Ver Detalle
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
      {detailModalOpen && selectedAudit && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDetailModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[500px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                🔎 Detalle de Operación Auditada
              </h3>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all text-2xl font-bold cursor-pointer focus:outline-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Acción Realizada</span>
                <div className="text-[0.95rem] font-extrabold">
                  <span className={`py-1 px-3 rounded-full border inline-block ${getBadgeColor(selectedAudit.accion)}`}>
                    {selectedAudit.accion}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Tabla Afectada</span>
                  <span className="text-[0.9rem] font-mono font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded self-start">
                    {selectedAudit.tabla}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">ID de Registro</span>
                  <span className="text-[0.9rem] font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded self-start font-mono">
                    {selectedAudit.registro || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Usuario / Autor</span>
                  <span className="text-[0.9rem] font-semibold text-text-heading">
                    {selectedAudit.usuario_nombre || 'Invitado (Sin Login)'}
                  </span>
                  {selectedAudit.id_usuario && (
                    <span className="text-[0.75rem] text-text-muted font-mono">ID Usuario: {selectedAudit.id_usuario}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">IP de Origen</span>
                  <span className="text-[0.9rem] font-bold text-slate-600 font-mono">
                    {selectedAudit.ip || 'Local/Desconocido'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-1">
                <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Fecha y Hora de la Operación</span>
                <span className="text-[0.9rem] font-semibold text-text-heading">
                  {new Date(selectedAudit.fecha).toLocaleString()}
                </span>
                <span className="text-[0.78rem] text-text-muted font-mono">
                  {selectedAudit.fecha}
                </span>
              </div>
            </div>

            <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
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
