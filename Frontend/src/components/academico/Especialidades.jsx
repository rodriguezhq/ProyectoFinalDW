import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [idFacultad, setIdFacultad] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Especialidades
      const espRes = await fetch(`${apiBaseUrl}/api/courses/especialidades`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!espRes.ok) throw new Error('Error al cargar las especialidades');
      const espData = await espRes.json();
      setEspecialidades(espData.especialidades || []);

      // Fetch Facultades for dropdown
      const facRes = await fetch(`${apiBaseUrl}/api/courses/facultades`, {
        method: 'GET',
        credentials: 'include'
      });
      if (facRes.ok) {
        const facData = await facRes.json();
        setFacultades(facData.facultades || []);
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
    setIdFacultad(facultades[0]?.id || '');
    setModalOpen(true);
  };

  const openEditModal = (esp) => {
    setEditingId(esp.id);
    setNombre(esp.nombre);
    setCodigo(esp.codigo);
    setIdFacultad(esp.id_facultad || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !codigo.trim() || !idFacultad) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      id_facultad: parseInt(idFacultad)
    };

    try {
      const url = editingId 
        ? `${apiBaseUrl}/api/courses/especialidades/${editingId}`
        : `${apiBaseUrl}/api/courses/especialidades`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Error al guardar la especialidad.');
      }

      toast.success(editingId ? 'Especialidad actualizada con éxito.' : 'Especialidad creada con éxito.');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
        <div>
          <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">🎓 Especialidades y Carreras</h3>
          <p className="text-[0.88rem] text-text-muted">Gestión de las carreras profesionales adscritas a cada facultad.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto"
        >
          + Agregar Especialidad
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[0.88rem] text-text-muted">Cargando especialidades...</p>
          </div>
        ) : especialidades.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            No hay especialidades registradas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg-alt border-b border-border">
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">ID</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre Especialidad</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad Perteneciente</th>
                  <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {especialidades.map((esp) => (
                  <tr key={esp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-[0.88rem] font-mono text-text-muted">{esp.id}</td>
                    <td className="p-4 text-[0.88rem] font-bold text-primary">{esp.codigo}</td>
                    <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{esp.nombre}</td>
                    <td className="p-4 text-[0.88rem] font-medium text-text-muted">
                      <span className="bg-primary-light text-primary py-0.5 px-2 rounded-full text-[0.78rem] font-bold">
                        {esp.facultad_nombre || `Facultad ID: ${esp.id_facultad}`}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(esp)}
                        className="text-primary hover:text-primary-hover font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-primary-light transition-all"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left">
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? '📝 Editar Especialidad' : '🎓 Nueva Especialidad'}
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
                  <label htmlFor="codigo-especialidad" className="text-[0.82rem] font-bold text-text-muted uppercase">Código de Especialidad</label>
                  <input
                    id="codigo-especialidad"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. EPIS"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-especialidad" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre de Especialidad</label>
                  <input
                    id="nombre-especialidad"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Ingeniería de Sistemas"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="facultad-asociada" className="text-[0.82rem] font-bold text-text-muted uppercase">Facultad Perteneciente</label>
                  <select
                    id="facultad-asociada"
                    value={idFacultad}
                    onChange={(e) => setIdFacultad(e.target.value)}
                    className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  >
                    <option value="" disabled>Seleccione una Facultad</option>
                    {facultades.map(fac => (
                      <option key={fac.id} value={fac.id}>{fac.nombre}</option>
                    ))}
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
    </div>
  );
}
