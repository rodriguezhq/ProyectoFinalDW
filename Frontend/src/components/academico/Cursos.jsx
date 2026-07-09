import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [creditos, setCreditos] = useState('');

  const fetchCursos = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/courses/cursos`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Error al cargar los cursos');
      const data = await response.json();
      setCursos(data.cursos || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNombre('');
    setCodigo('');
    setCreditos('');
    setModalOpen(true);
  };

  const openEditModal = (cur) => {
    setEditingId(cur.id_curso);
    setNombre(cur.nombre);
    setCodigo(cur.codigo);
    setCreditos(cur.creditos);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const creditsNum = parseInt(creditos);
    if (!nombre.trim() || !codigo.trim() || isNaN(creditsNum) || creditsNum <= 0) {
      toast.error('Todos los campos son obligatorios y los créditos deben ser mayores que cero.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      creditos: creditsNum
    };

    try {
      const endpoint = editingId 
        ? `/api/courses/cursos/${editingId}`
        : `/api/courses/cursos`;
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
        throw new Error(errData.msg || 'Error al guardar el curso.');
      }

      toast.success(editingId ? 'Curso actualizado con éxito.' : 'Curso creado con éxito.');
      setModalOpen(false);
      fetchCursos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
        <div>
          <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">📚 Catálogo de Cursos</h3>
          <p className="text-[0.88rem] text-text-muted">Gestión de las asignaturas académicas y créditos de la universidad.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto"
        >
          + Agregar Curso
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[0.88rem] text-text-muted">Cargando cursos...</p>
          </div>
        ) : cursos.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            No hay cursos registrados en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="bg-bg-alt border-b border-border">
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">ID</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                  <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre del Curso</th>
                  <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Créditos</th>
                  <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cursos.map((cur) => (
                  <tr key={cur.id_curso} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-[0.88rem] font-mono text-text-muted">{cur.id_curso}</td>
                    <td className="p-4 text-[0.88rem] font-bold text-primary">{cur.codigo}</td>
                    <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{cur.nombre}</td>
                    <td className="p-4 text-center text-[0.88rem] font-bold text-text-heading">
                      <span className="inline-block bg-slate-100 text-slate-700 py-0.5 px-2.5 rounded font-mono">
                        {cur.creditos} CR
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(cur)}
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
    </div>

    {/* Add/Edit Modal */}
    {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left">
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? '📝 Editar Curso' : '📚 Nuevo Curso'}
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
                  <label htmlFor="codigo-curso" className="text-[0.82rem] font-bold text-text-muted uppercase">Código de Curso</label>
                  <input
                    id="codigo-curso"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. CUR01"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-curso" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre del Curso</label>
                  <input
                    id="nombre-curso"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Desarrollo Web y Móvil"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.95rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="creditos-curso" className="text-[0.82rem] font-bold text-text-muted uppercase">Créditos</label>
                  <input
                    id="creditos-curso"
                    type="number"
                    value={creditos}
                    onChange={(e) => setCreditos(e.target.value)}
                    placeholder="Ej. 4"
                    min="1"
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
    </>
  );
}
