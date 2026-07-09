import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function PlanesEstudio() {
  const [planes, setPlanes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [estado, setEstado] = useState('Vigente');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Planes de Estudio
      const planRes = await apiFetch(`/api/courses/planes-estudio`, {
        method: 'GET'
      });
      if (!planRes.ok) throw new Error('Error al cargar los planes de estudio');
      const planData = await planRes.json();
      setPlanes(planData.planes_estudio || []);

      // Fetch Especialidades for dropdown
      const espRes = await apiFetch(`/api/courses/especialidades`, {
        method: 'GET'
      });
      if (espRes.ok) {
        const espData = await espRes.json();
        setEspecialidades(espData.especialidades || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNombre('');
    setCodigo('');
    setIdEspecialidad(especialidades[0]?.id_especialidad || '');
    setEstado('Vigente');
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingId(plan.id_plan);
    setNombre(plan.nombre);
    setCodigo(plan.codigo);
    setIdEspecialidad(plan.id_especialidad || '');
    setEstado(plan.estado || 'Vigente');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !codigo.trim() || !idEspecialidad) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      id_especialidad: parseInt(idEspecialidad),
      estado: estado
    };

    try {
      const endpoint = editingId 
        ? `/api/courses/planes-estudio/${editingId}`
        : `/api/courses/planes-estudio`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await apiFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Error al guardar el plan de estudio.');
      }

      toast.success(editingId ? 'Plan de estudio actualizado con éxito.' : 'Plan de estudio creado con éxito.');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
        <div>
          <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">📋 Planes de Estudio</h3>
          <p className="text-[0.88rem] text-text-muted">Gestión de las mallas curriculares y planes lectivos oficiales.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto"
        >
          + Agregar Plan
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[0.88rem] text-text-muted">Cargando planes de estudio...</p>
          </div>
        ) : planes.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            No hay planes de estudio registrados en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] border-collapse">
              <thead>
                <tr className="bg-bg-alt border-b border-border">
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">ID</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre del Plan</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Especialidad / Carrera</th>
                  <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Estado</th>
                  <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {planes.map((plan) => {
                  const esp = especialidades.find(e => e.id_especialidad === plan.id_especialidad);
                  const nombreEspecialidad = esp ? esp.nombre : `Esp ID: ${plan.id_especialidad}`;
                  return (
                    <tr key={plan.id_plan} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-mono text-text-muted">{plan.id_plan}</td>
                      <td className="p-4 text-[0.88rem] font-bold text-primary">{plan.codigo}</td>
                      <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{plan.nombre}</td>
                      <td className="p-4 text-[0.88rem] font-medium text-text-muted">{nombreEspecialidad}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.75rem] font-bold ${plan.estado === 'Vigente' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {plan.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => openEditModal(plan)}
                          className="text-primary hover:text-primary-hover font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-primary-light transition-all"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Add/Edit Modal */}
    {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left">
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? '📝 Editar Plan de Estudio' : '📋 Nuevo Plan de Estudio'}
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
                  <label htmlFor="codigo-plan" className="text-[0.82rem] font-bold text-text-muted uppercase">Código de Plan</label>
                  <input
                    id="codigo-plan"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. PLAN2026"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-plan" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre del Plan</label>
                  <input
                    id="nombre-plan"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Plan de Estudios 2026-I"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="especialidad-plan" className="text-[0.82rem] font-bold text-text-muted uppercase">Especialidad / Carrera</label>
                  <select
                    id="especialidad-plan"
                    value={idEspecialidad}
                    onChange={(e) => setIdEspecialidad(e.target.value)}
                    className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  >
                    <option value="" disabled>Seleccione una Especialidad</option>
                    {especialidades.map(esp => (
                      <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="estado-plan" className="text-[0.82rem] font-bold text-text-muted uppercase">Estado del Plan</label>
                  <select
                    id="estado-plan"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
