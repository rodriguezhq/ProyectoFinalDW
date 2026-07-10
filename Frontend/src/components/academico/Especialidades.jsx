import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Malla Curricular Modal State
  const [mallaModalOpen, setMallaModalOpen] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Especialidades
      const espRes = await apiFetch(`/api/courses/especialidades`, {
        method: 'GET'
      });
      if (!espRes.ok) throw new Error('Error al cargar las especialidades');
      const espData = await espRes.json();
      setEspecialidades(espData.especialidades || []);

      // Fetch Facultades for dropdown
      const facRes = await apiFetch(`/api/courses/facultades`, {
        method: 'GET'
      });
      if (facRes.ok) {
        const facData = await facRes.json();
        setFacultades(facData.facultades || []);
      }

      // Fetch todos los cursos para la malla curricular
      const cursoRes = await apiFetch(`/api/courses/cursos`, { method: 'GET' });
      if (cursoRes.ok) {
        const cursoData = await cursoRes.json();
        setTodosLosCursos(cursoData.cursos || []);
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
    setIdFacultad(facultades[0]?.id_facultad || '');
    setModalOpen(true);
  };

  const openEditModal = (esp) => {
    setEditingId(esp.id_especialidad);
    setNombre(esp.nombre);
    setCodigo(esp.codigo);
    setIdFacultad(esp.id_facultad || '');
    setModalOpen(true);
  };

  const openMallaModal = (esp) => {
    setEspecialidadSeleccionada(esp);
    setMallaModalOpen(true);
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
      const endpoint = editingId 
        ? `/api/courses/especialidades/${editingId}`
        : `/api/courses/especialidades`;
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
        throw new Error(errData.msg || 'Error al guardar la especialidad.');
      }

      toast.success(editingId ? 'Especialidad actualizada con éxito.' : 'Especialidad creada con éxito.');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await apiFetch(`/api/courses/especialidades/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Error al eliminar la especialidad.');
      }
      toast.success('Especialidad eliminada con éxito.');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Cursos filtrados para la carrera seleccionada
  const cursosCarrera = especialidadSeleccionada
    ? todosLosCursos.filter(c => c.id_especialidades?.includes(especialidadSeleccionada.id_especialidad))
    : [];

  const ciclosValores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">🎓 Especialidades y Carreras</h3>
            <p className="text-[0.88rem] text-text-muted">Gestión de las carreras profesionales adscritas a cada facultad.</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
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
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre Especialidad</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad Perteneciente</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {especialidades.map((esp) => {
                    const fac = facultades.find(f => f.id_facultad === esp.id_facultad);
                    const nombreFacultad = fac ? fac.nombre : `Facultad ID: ${esp.id_facultad}`;
                    return (
                      <tr key={esp.id_especialidad} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-[0.88rem] font-bold text-primary">{esp.codigo}</td>
                        <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{esp.nombre}</td>
                        <td className="p-4 text-[0.88rem] font-medium text-text-muted">
                          <span className="bg-primary-light text-primary py-0.5 px-2 rounded-full text-[0.78rem] font-bold">
                            {nombreFacultad}
                          </span>
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openMallaModal(esp)}
                            className="bg-accent-light hover:bg-accent/15 text-accent-hover font-bold text-[0.88rem] px-3.5 py-1 rounded transition-all cursor-pointer"
                          >
                            🗺️ Ver Malla
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(esp)}
                            className="text-primary hover:text-primary-hover font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-primary-light transition-all cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(esp.id_especialidad)}
                            className="text-red-600 hover:text-red-700 font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                          >
                            Eliminar
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
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
                      <option key={fac.id_facultad} value={fac.id_facultad}>{fac.nombre}</option>
                    ))}
                  </select>
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Malla Curricular Diagram Modal (No arrows) */}
      {mallaModalOpen && especialidadSeleccionada && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setMallaModalOpen(false)}>
          <div 
            className="bg-white rounded-2xl border border-border shadow-2xl max-w-[95vw] md:max-w-[1250px] w-full overflow-hidden animate-scale-in text-left flex flex-col h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-heading font-extrabold text-primary text-[1.2rem] flex items-center gap-2">
                  🗺️ Malla Curricular: <span className="text-text-heading font-bold">{especialidadSeleccionada.nombre}</span>
                </h3>
                <p className="text-[0.8rem] text-text-muted mt-1 uppercase font-semibold tracking-wider">
                  Facultad: {facultades.find(f => f.id_facultad === especialidadSeleccionada.id_facultad)?.nombre || ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMallaModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all text-2xl font-bold cursor-pointer focus:outline-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable Diagram Area */}
            <div className="grow overflow-auto p-8 bg-slate-50 select-none">
              {cursosCarrera.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted italic gap-2">
                  <span>⚠️ No hay cursos asociados a esta carrera académica.</span>
                  <span className="text-[0.8rem]">Asocia asignaturas en el catálogo de Cursos para visualizarlas aquí.</span>
                </div>
              ) : (
                <div className="relative flex gap-12 min-w-max pb-16 pt-8 pr-12">
                  {/* Flow chart columns grouped by cycle */}
                  {ciclosValores.map(cicloNum => {
                    const cursosDelCiclo = cursosCarrera.filter(c => c.ciclo === cicloNum);
                    
                    return (
                      <div key={cicloNum} className="flex flex-col gap-6 w-[200px] shrink-0 items-center">
                        {/* Header Column */}
                        <div className="bg-primary/5 text-primary text-center py-2.5 px-4 rounded-xl border border-primary/10 w-full font-heading font-extrabold text-[0.88rem] tracking-tight uppercase shadow-sm">
                          {cicloNum}° Ciclo
                        </div>
                        
                        {/* Courses Column Stack */}
                        <div className="flex flex-col gap-5 w-full grow justify-start">
                          {cursosDelCiclo.map(cur => {
                            const nombresPrerrequisitos = (cur.id_prerrequisitos || [])
                              .map(id => todosLosCursos.find(c => c.id_curso === id)?.codigo || `ID: ${id}`)
                              .join(', ');

                            return (
                              <div
                                key={cur.id_curso}
                                className="bg-white border border-border rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 flex flex-col gap-2 relative z-10 w-full"
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-mono text-[0.72rem] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                                    {cur.codigo}
                                  </span>
                                  <span className="text-[0.72rem] font-extrabold text-slate-500 font-mono shrink-0">
                                    {cur.creditos} CR
                                  </span>
                                </div>
                                <h4 className="text-[0.82rem] font-bold text-text-heading leading-snug">
                                  {cur.nombre}
                                </h4>
                                {nombresPrerrequisitos && (
                                  <div className="text-[0.72rem] text-slate-500 mt-1 border-t border-slate-100 pt-1.5 font-medium">
                                    <span className="text-slate-400 font-bold block text-[0.68rem] uppercase">Prereq:</span>
                                    <span className="text-primary truncate block" title={nombresPrerrequisitos}>
                                      {nombresPrerrequisitos}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {cursosDelCiclo.length === 0 && (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center text-[0.78rem] text-slate-400 italic">
                              Sin cursos
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 bg-bg-alt border-t border-border flex justify-end shrink-0">
              <button 
                type="button"
                className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md transition-all hover:bg-primary-hover shadow-sm cursor-pointer"
                onClick={() => setMallaModalOpen(false)}
              >
                Cerrar Visualización
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[400px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="font-heading font-extrabold text-[1.1rem] text-text-heading mb-2">
              ¿Confirmar eliminación?
            </h3>
            <p className="text-[0.88rem] text-text-muted mb-6">
              Esta acción es irreversible y podría fallar si el elemento tiene otros registros asociados.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 font-bold text-[0.88rem] rounded-md transition-colors shadow-sm cursor-pointer"
              >
                Confirmar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
