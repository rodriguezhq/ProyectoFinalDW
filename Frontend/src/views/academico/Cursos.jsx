import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { obtenerCursos, obtenerFacultades, obtenerEspecialidades, guardarCurso, actualizarCurso, eliminarCurso } from '../../services/servicioAcademico';

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estado del formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [creditos, setCreditos] = useState('');
  const [ciclo, setCiclo] = useState('1');
  const [idFacultad, setIdFacultad] = useState('');
  const [prerrequisitosSeleccionados, setPrerrequisitosSeleccionados] = useState([]);
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const cargarDatos = async () => {
    setEstaCargando(true);
    try {
      const datosCursos = await obtenerCursos();
      setCursos(datosCursos.cursos || []);

      const datosFac = await obtenerFacultades();
      setFacultades(datosFac.facultades || []);

      const datosEsp = await obtenerEspecialidades();
      setEspecialidades(datosEsp.especialidades || []);
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
    setCreditos('');
    setCiclo('1');
    setIdFacultad('');
    setPrerrequisitosSeleccionados([]);
    setEspecialidadesSeleccionadas([]);
    setModalOpen(true);
  };

  const abrirModalEditar = (cur) => {
    setEditingId(cur.id_curso);
    setNombre(cur.nombre);
    setCodigo(cur.codigo);
    setCreditos(cur.creditos);
    setCiclo(String(cur.ciclo || 1));
    setIdFacultad(String(cur.id_facultad || ''));
    setPrerrequisitosSeleccionados(cur.id_prerrequisitos || []);
    setEspecialidadesSeleccionadas(cur.id_especialidades || []);
    setModalOpen(true);
  };

  const manejarCambioFacultad = (e) => {
    const nuevaFacId = e.target.value;
    setIdFacultad(nuevaFacId);
    
    // Filtrar prerrequisitos que ya no pertenecen a la nueva facultad
    const nuevaFacIdInt = parseInt(nuevaFacId);
    const filtradosPrerreqs = prerrequisitosSeleccionados.filter(preId => {
      const prerreqCurso = cursos.find(c => c.id_curso === preId);
      return prerreqCurso && prerreqCurso.id_facultad === nuevaFacIdInt;
    });
    setPrerrequisitosSeleccionados(filtradosPrerreqs);

    // Filtrar carreras que ya no pertenecen a la nueva facultad
    const filtradasEspecialidades = especialidadesSeleccionadas.filter(espId => {
      const espObj = especialidades.find(e => e.id_especialidad === espId);
      return espObj && espObj.id_facultad === nuevaFacIdInt;
    });
    setEspecialidadesSeleccionadas(filtradasEspecialidades);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const creditosNum = parseInt(creditos);
    const cicloNum = parseInt(ciclo);
    const facIdNum = parseInt(idFacultad);
    
    if (!nombre.trim() || !codigo.trim() || isNaN(creditosNum) || creditosNum <= 0 || isNaN(cicloNum) || cicloNum <= 0 || isNaN(facIdNum) || facIdNum <= 0) {
      toast.error('Todos los campos son obligatorios. Créditos, Ciclo y Facultad deben ser válidos.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase(),
      creditos: creditosNum,
      ciclo: cicloNum,
      id_facultad: facIdNum,
      id_prerrequisitos: prerrequisitosSeleccionados,
      id_especialidades: especialidadesSeleccionadas,
    };

    try {
      if (editingId) {
        await actualizarCurso(editingId, payload);
        toast.success('Curso actualizado con éxito.');
      } else {
        await guardarCurso(payload);
        toast.success('Curso creado con éxito.');
      }
      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const manejarEliminar = async (id) => {
    try {
      await eliminarCurso(id);
      toast.success('Curso eliminado con éxito.');
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Filtrar los prerrequisitos elegibles: de la misma facultad y diferente al curso actual
  const prerrequisitosElegibles = cursos.filter(
    c => c.id_curso !== editingId && c.id_facultad === parseInt(idFacultad)
  );

  // Filtrar especialidades elegibles: de la misma facultad del curso
  const especialidadesElegibles = especialidades.filter(
    e => e.id_facultad === parseInt(idFacultad)
  );

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">📚 Catálogo de Cursos</h3>
            <p className="text-[0.88rem] text-text-muted">Gestión de las asignaturas académicas, ciclo, facultad, carreras y prerrequisitos asociados.</p>
          </div>
          <button
            type="button"
            onClick={abrirModalAgregar}
            className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            + Agregar Curso
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
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
              <table className="w-full min-w-[850px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre del Curso</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Carreras / Especialidades</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Ciclo</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Créditos</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Prerrequisitos</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cursos.map((cur) => {
                    const nombresPrerrequisitos = (cur.id_prerrequisitos || [])
                      .map(id => cursos.find(c => c.id_curso === id)?.codigo || `ID: ${id}`)
                      .join(', ');

                    const nombresEspecialidades = (cur.especialidades_nombres || []).join(', ');

                    return (
                      <tr key={cur.id_curso} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-[0.88rem] font-bold text-primary">{cur.codigo}</td>
                        <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{cur.nombre}</td>
                        <td className="p-4 text-[0.88rem] font-semibold text-text-muted">{cur.facultad_nombre || 'Sin facultad'}</td>
                        <td className="p-4 text-[0.82rem] font-medium text-text-muted max-w-[200px] truncate" title={nombresEspecialidades}>
                          {nombresEspecialidades ? (
                            <span className="bg-primary-light text-primary py-0.5 px-2.5 rounded-full text-[0.78rem] font-bold block truncate">
                              {nombresEspecialidades}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No asignado</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-[0.88rem] font-bold text-text-heading">
                          <span className="inline-block bg-slate-100 text-slate-700 py-0.5 px-2 rounded font-mono">
                            {cur.ciclo}
                          </span>
                        </td>
                        <td className="p-4 text-center text-[0.88rem] font-bold text-text-heading">
                          <span className="inline-block bg-primary-light text-primary py-0.5 px-2.5 rounded font-mono">
                            {cur.creditos} CR
                          </span>
                        </td>
                        <td className="p-4 text-[0.82rem] font-medium text-text-muted max-w-[150px] truncate" title={nombresPrerrequisitos}>
                          {nombresPrerrequisitos ? (
                            <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[0.78rem] font-bold block truncate">
                              {nombresPrerrequisitos}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Ninguno</span>
                          )}
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(cur)}
                            className="text-primary hover:text-primary-hover font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-primary-light transition-all cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(cur.id_curso)}
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
            <form onSubmit={manejarEnvio}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="codigo-curso" className="text-[0.82rem] font-bold text-text-muted uppercase">Código de Curso</label>
                  <input
                    id="codigo-curso"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    disabled={!!editingId}
                    placeholder="Ej. CUR01"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase disabled:bg-slate-100 disabled:text-slate-500"
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
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="facultad-curso" className="text-[0.82rem] font-bold text-text-muted uppercase">Facultad</label>
                  <select
                    id="facultad-curso"
                    value={idFacultad}
                    onChange={manejarCambioFacultad}
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] bg-white cursor-pointer"
                  >
                    <option value="">-- Seleccionar Facultad --</option>
                    {facultades.map(fac => (
                      <option key={fac.id_facultad} value={fac.id_facultad}>
                        {fac.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.82rem] font-bold text-text-muted uppercase">Carreras / Especialidades (Misma Facultad)</label>
                  <div className="border border-border rounded-md p-3 max-h-[120px] overflow-y-auto flex flex-col gap-2 bg-white">
                    {!idFacultad ? (
                      <span className="text-[0.85rem] text-text-muted italic">Selecciona una facultad primero para cargar las carreras correspondientes.</span>
                    ) : especialidadesElegibles.length === 0 ? (
                      <span className="text-[0.85rem] text-text-muted italic">No hay carreras registradas en esta facultad.</span>
                    ) : (
                      especialidadesElegibles.map(esp => (
                        <label key={esp.id_especialidad} className="flex items-center gap-2 text-[0.88rem] text-text-heading font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={especialidadesSeleccionadas.includes(esp.id_especialidad)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                  setEspecialidadesSeleccionadas([...especialidadesSeleccionadas, esp.id_especialidad]);
                              } else {
                                  setEspecialidadesSeleccionadas(especialidadesSeleccionadas.filter(id => id !== esp.id_especialidad));
                              }
                            }}
                            className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          {esp.codigo} - {esp.nombre}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ciclo-curso" className="text-[0.82rem] font-bold text-text-muted uppercase">Ciclo Académico</label>
                  <input
                    id="ciclo-curso"
                    type="number"
                    value={ciclo}
                    onChange={(e) => setCiclo(e.target.value)}
                    placeholder="Ej. 1"
                    min="1"
                    max="10"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.82rem] font-bold text-text-muted uppercase">Prerrequisitos (Misma Facultad)</label>
                  <div className="border border-border rounded-md p-3 max-h-[120px] overflow-y-auto flex flex-col gap-2 bg-white">
                    {!idFacultad ? (
                      <span className="text-[0.85rem] text-text-muted italic">Selecciona una facultad primero para cargar los prerrequisitos elegibles.</span>
                    ) : prerrequisitosElegibles.length === 0 ? (
                      <span className="text-[0.85rem] text-text-muted italic">No hay otros cursos registrados en esta facultad.</span>
                    ) : (
                      prerrequisitosElegibles.map(c => (
                        <label key={c.id_curso} className="flex items-center gap-2 text-[0.88rem] text-text-heading font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prerrequisitosSeleccionados.includes(c.id_curso)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                  setPrerrequisitosSeleccionados([...prerrequisitosSeleccionados, c.id_curso]);
                              } else {
                                  setPrerrequisitosSeleccionados(prerrequisitosSeleccionados.filter(id => id !== c.id_curso));
                              }
                            }}
                            className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          {c.codigo} - {c.nombre}
                        </label>
                      ))
                    )}
                  </div>
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

      {/* Confirmar Eliminación Modal */}
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
              Esta acción es irreversible y podría fallar si el curso tiene secciones asociadas.
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
