import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Facultades() {
  const [facultades, setFacultades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchFacultades = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/courses/facultades`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar las facultades');
      const data = await response.json();
      setFacultades(data.facultades || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNombre('');
    setCodigo('');
    setModalOpen(true);
  };

  const openEditModal = (fac) => {
    setEditingId(fac.id);
    setNombre(fac.nombre);
    setCodigo(fac.codigo);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !codigo.trim()) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase()
    };

    try {
      const url = editingId 
        ? `${apiBaseUrl}/api/courses/facultades/${editingId}`
        : `${apiBaseUrl}/api/courses/facultades`;
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
        throw new Error(errData.msg || 'Error al guardar la facultad.');
      }

      toast.success(editingId ? 'Facultad actualizada con éxito.' : 'Facultad creada con éxito.');
      setModalOpen(false);
      fetchFacultades();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
        <div>
          <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">🏫 Facultades Universitarias</h3>
          <p className="text-[0.88rem] text-text-muted">Gestión de las unidades académicas administrativas de la UNCP.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto"
        >
          + Agregar Facultad
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[0.88rem] text-text-muted">Cargando facultades...</p>
          </div>
        ) : facultades.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            No hay facultades registradas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-bg-alt border-b border-border">
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">ID</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre de Facultad</th>
                  <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {facultades.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-[0.88rem] font-mono text-text-muted">{fac.id}</td>
                    <td className="p-4 text-[0.88rem] font-bold text-primary">{fac.codigo}</td>
                    <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{fac.nombre}</td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(fac)}
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
                {editingId ? '📝 Editar Facultad' : '🏫 Nueva Facultad'}
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
                  <label htmlFor="codigo-facultad" className="text-[0.82rem] font-bold text-text-muted uppercase">Código de Facultad</label>
                  <input
                    id="codigo-facultad"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. FIM"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-facultad" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre de Facultad</label>
                  <input
                    id="nombre-facultad"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Facultad de Ingeniería Mecánica"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
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
