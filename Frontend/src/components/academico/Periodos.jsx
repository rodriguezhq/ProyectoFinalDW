import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Confirmar activación
  const [confirmActivarId, setConfirmActivarId] = useState(null);

  const fetchPeriodos = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/admin/periodos`, { method: 'GET' });
      if (!response.ok) throw new Error('Error al cargar los periodos académicos');
      const data = await response.json();
      setPeriodos(data.periodos || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const openAddModal = () => {
    setNombre('');
    setFechaInicio('');
    setFechaFin('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !fechaInicio || !fechaFin) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    if (new Date(fechaInicio) >= new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin.');
      return;
    }

    const payload = {
      nombre: nombre.trim().toUpperCase(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    };

    try {
      const response = await apiFetch(`/api/admin/periodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Error al crear el periodo académico.');
      }

      toast.success('Periodo académico creado y activado con éxito. Se cerraron los anteriores.');
      setModalOpen(false);
      fetchPeriodos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleActivar = async (id) => {
    try {
      const response = await apiFetch(`/api/admin/periodos/${id}/activar`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Error al activar el periodo académico.');
      }

      toast.success('Periodo académico reabierto con éxito. Se habilitaron sus clases asociadas.');
      fetchPeriodos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">📅 Periodos Académicos</h3>
            <p className="text-[0.88rem] text-text-muted">Administración y control de inicio/cierre de semestres académicos.</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            + Crear Periodo
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando periodos académicos...</p>
            </div>
          ) : periodos.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No hay periodos académicos registrados en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre del Periodo</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Fecha de Inicio</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Fecha de Término</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Estado</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {periodos.map((p) => (
                    <tr key={p.id_periodo} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-bold text-text-heading">{p.nombre}</td>
                      <td className="p-4 text-[0.88rem] font-medium text-text-muted">{p.fecha_inicio}</td>
                      <td className="p-4 text-[0.88rem] font-medium text-text-muted">{p.fecha_fin}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block py-1 px-3.5 rounded-full text-[0.78rem] font-bold border ${
                          p.estado === 'activo' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {p.estado === 'activo' ? 'Activo' : 'Cerrado'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {p.estado === 'cerrado' ? (
                          <button
                            type="button"
                            onClick={() => setConfirmActivarId(p.id_periodo)}
                            className="bg-primary/5 hover:bg-primary-light text-primary py-1 px-3 rounded text-[0.82rem] font-bold border border-primary/10 transition-all cursor-pointer"
                          >
                            ⚡ Reabrir
                          </button>
                        ) : (
                          <span className="text-[0.82rem] text-emerald-600 font-bold">Vigente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Crear Periodo */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                📅 Nuevo Periodo Académico
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all text-2xl font-bold cursor-pointer focus:outline-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-periodo" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre del Periodo</label>
                  <input
                    id="nombre-periodo"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. 2026-I"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fecha-inicio" className="text-[0.82rem] font-bold text-text-muted uppercase">Fecha de Inicio</label>
                  <input
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fecha-fin" className="text-[0.82rem] font-bold text-text-muted uppercase">Fecha de Término</label>
                  <input
                    id="fecha-fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
              </div>
              <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                >
                  Guardar y Activar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmar Activación Modal */}
      {confirmActivarId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmActivarId(null)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[400px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚡
            </div>
            <h3 className="font-heading font-extrabold text-[1.1rem] text-text-heading mb-2">
              ¿Confirmar reapertura del periodo?
            </h3>
            <p className="text-[0.88rem] text-text-muted mb-6">
              Esto reabrirá las actas y clases vinculadas a este semestre para modificaciones. Los demás periodos activos permanecerán abiertos.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmActivarId(null)}
                className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleActivar(confirmActivarId);
                  setConfirmActivarId(null);
                }}
                className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
              >
                Confirmar y Reabrir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
