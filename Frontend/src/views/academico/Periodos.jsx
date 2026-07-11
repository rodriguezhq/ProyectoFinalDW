import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Plus, X, Zap } from 'lucide-react';
import { obtenerPeriodos, guardarPeriodo, activarPeriodo } from '../../services/servicioAcademico';

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados del Formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');

  // Confirmar activación
  const [confirmActivarId, setConfirmActivarId] = useState(null);

  const cargarPeriodos = async () => {
    setEstaCargando(true);
    try {
      const datos = await obtenerPeriodos();
      setPeriodos(datos.periodos || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const abrirModalAgregar = () => {
    setNombre('');
    setModalOpen(true);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre del periodo es obligatorio.');
      return;
    }

    const payload = {
      nombre: nombre.trim().toUpperCase()
    };

    try {
      await guardarPeriodo(payload);
      toast.success('Periodo académico creado y activado con éxito. Se cerraron los anteriores.');
      setModalOpen(false);
      cargarPeriodos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const manejarActivar = async (id) => {
    try {
      await activarPeriodo(id);
      toast.success('Periodo académico reabierto con éxito. Se habilitaron sus clases asociadas.');
      cargarPeriodos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
              <Calendar size={20} className="text-primary" /> Periodos Académicos
            </h3>
            <p className="text-[0.88rem] text-text-muted">Administración y control de inicio/cierre de semestres académicos.</p>
          </div>
          <button
            type="button"
            onClick={abrirModalAgregar}
            className="flex items-center gap-1.5 bg-primary text-white py-2.5 px-5 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Crear Periodo
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
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
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre del Periodo</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Estado</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {periodos.map((p) => (
                    <tr key={p.id_periodo} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-bold text-text-heading">{p.nombre}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block py-1 px-3.5 rounded-full text-[0.78rem] font-bold border ${
                          p.estado === 'activo' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {p.estado === 'activo' ? 'Activo' : 'Cerrado'}
                        </span>
                      </td>
                      <td className="p-4 text-center flex justify-center items-center">
                        {p.estado === 'cerrado' ? (
                          <button
                            type="button"
                            onClick={() => setConfirmActivarId(p.id_periodo)}
                            className="flex items-center gap-1 bg-primary/5 hover:bg-primary-light text-primary py-1.5 px-3.5 rounded text-[0.82rem] font-bold border border-primary/10 transition-all cursor-pointer"
                          >
                            <Zap size={14} /> Reabrir
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[400px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-bg-alt border-b border-border flex justify-between items-center">
              <h3 className="flex items-center gap-2 font-heading font-extrabold text-text-heading text-[1.1rem]">
                <Calendar size={18} className="text-primary" /> Nuevo Periodo Académico
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-text-heading transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={manejarEnvio}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-periodo" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre del Periodo *</label>
                  <input
                    id="nombre-periodo"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. 2026-I"
                    className="p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[0.88rem] uppercase"
                    required
                  />
                </div>
              </div>
              <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 text-[0.88rem] font-semibold border border-border rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white py-2.5 px-6 font-bold text-[0.88rem] rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmActivarId(null)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[400px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={28} />
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
                className="py-2.5 px-4 text-[0.88rem] font-semibold border border-border rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  manejarActivar(confirmActivarId);
                  setConfirmActivarId(null);
                }}
                className="bg-primary text-white py-2.5 px-6 font-bold text-[0.88rem] rounded-lg hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
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
