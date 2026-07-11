import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GraduationCap, Plus, Pencil, X, AlertTriangle, Map } from 'lucide-react';
import { obtenerFacultades, obtenerEspecialidades, obtenerCursos, guardarEspecialidad, actualizarEspecialidad, eliminarEspecialidad } from '../../services/servicioAcademico';

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados del Formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Estado del Modal de Malla Curricular
  const [mallaModalOpen, setMallaModalOpen] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);

  const cargarDatos = async () => {
    setEstaCargando(true);
    try {
      const datosEsp = await obtenerEspecialidades();
      setEspecialidades(datosEsp.especialidades || []);

      const datosFac = await obtenerFacultades();
      setFacultades(datosFac.facultades || []);

      const datosCursos = await obtenerCursos();
      setTodosLosCursos(datosCursos.cursos || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalAgregar = () => {
    setEditingId(null);
    setNombre('');
    setCodigo('');
    setIdFacultad(facultades[0]?.id_facultad || '');
    setModalOpen(true);
  };

  const abrirModalEditar = (esp) => {
    setEditingId(esp.id_especialidad);
    setNombre(esp.nombre);
    setCodigo(esp.codigo);
    setIdFacultad(esp.id_facultad || '');
    setModalOpen(true);
  };

  const abrirMallaModal = (esp) => {
    setEspecialidadSeleccionada(esp);
    setMallaModalOpen(true);
  };

  const manejarEnvio = async (e) => {
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
      if (editingId) {
        await actualizarEspecialidad(editingId, payload);
        toast.success('Especialidad actualizada con éxito.');
      } else {
        await guardarEspecialidad(payload);
        toast.success('Especialidad creada con éxito.');
      }
      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const manejarEliminar = async (id) => {
    try {
      await eliminarEspecialidad(id);
      toast.success('Especialidad eliminada con éxito.');
      cargarDatos();
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
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1"><GraduationCap size={20} /> Especialidades y Carreras</h3>
            <p className="text-[0.88rem] text-text-muted">Gestión de las carreras profesionales adscritas a cada facultad.</p>
          </div>
          <button
            type="button"
            onClick={abrirModalAgregar}
            className="flex items-center gap-1.5 bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Agregar Especialidad
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
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
                            onClick={() => abrirMallaModal(esp)}
                            className="flex items-center gap-1 bg-accent-light hover:bg-accent/15 text-accent-hover font-bold text-[0.88rem] px-3.5 py-1 rounded transition-all cursor-pointer"
                          >
                            <Map size={14} /> Ver Malla
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(esp)}
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

      {/* Modal de Agregar / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="flex items-center gap-2 font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? <><Pencil size={18} /> Editar Especialidad</> : <><GraduationCap size={18} /> Nueva Especialidad</>}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={manejarEnvio}>
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
                    className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
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

      {/* Modal Malla Curricular */}
      {mallaModalOpen && especialidadSeleccionada && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setMallaModalOpen(false)}>
          <div 
            className="bg-white rounded-2xl border border-border shadow-2xl max-w-[95vw] md:max-w-[1250px] w-full overflow-hidden animate-scale-in text-left flex flex-col h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-heading font-extrabold text-primary text-[1.2rem] flex items-center gap-2">
                  <Map size={20} /> Malla Curricular: <span className="text-text-heading font-bold">{especialidadSeleccionada.nombre}</span>
                </h3>
                <p className="text-[0.8rem] text-text-muted mt-1 uppercase font-semibold tracking-wider">
                  Facultad: {facultades.find(f => f.id_facultad === especialidadSeleccionada.id_facultad)?.nombre || ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMallaModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>

            {/* Diagrama con scroll */}
            <div className="grow overflow-auto p-8 bg-slate-50 select-none">
              {cursosCarrera.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-muted italic gap-2">
                  <span className="flex items-center gap-1.5"><AlertTriangle size={16} /> No hay cursos asociados a esta carrera académica.</span>
                  <span className="text-[0.8rem]">Asocia asignaturas en el catálogo de Cursos para visualizarlas aquí.</span>
                </div>
              ) : (
                <div className="relative flex gap-12 min-w-max pb-16 pt-8 pr-12">
                  {ciclosValores.map(cicloNum => {
                    const cursosDelCiclo = cursosCarrera.filter(c => c.ciclo === cicloNum);
                    
                    return (
                      <div key={cicloNum} className="flex flex-col gap-6 w-[200px] shrink-0 items-center">
                        <div className="bg-primary/5 text-primary text-center py-2.5 px-4 rounded-xl border border-primary/10 w-full font-heading font-extrabold text-[0.88rem] tracking-tight uppercase shadow-sm">
                          {cicloNum}° Ciclo
                        </div>
                        
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

      {/* Confirmar Eliminación Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[400px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
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
                  manejarEliminar(deleteConfirmId);
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
