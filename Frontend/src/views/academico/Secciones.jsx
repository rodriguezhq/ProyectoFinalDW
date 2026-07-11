import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layers, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import {
  obtenerFacultades,
  obtenerEspecialidades,
  obtenerPeriodos,
  obtenerSecciones,
  guardarSeccion,
  actualizarSeccion,
  eliminarSeccion
} from '../../services/servicioAcademico';

export default function Secciones() {
  const [secciones, setSecciones] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  
  const [estaCargando, setEstaCargando] = useState(false);

  // Filtros superiores
  const [idFacultad, setIdFacultad] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [idPeriodo, setIdPeriodo] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState('');

  // Estados del Formulario del Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [codigo, setCodigo] = useState('A');
  const [formEspecialidad, setFormEspecialidad] = useState('');
  const [formCiclo, setFormCiclo] = useState(1);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Cargar catálogos maestros iniciales
  const cargarCatalogos = async () => {
    try {
      const datosFac = await obtenerFacultades();
      setFacultades(datosFac.facultades || []);

      const datosEsp = await obtenerEspecialidades();
      setEspecialidades(datosEsp.especialidades || []);

      const datosPer = await obtenerPeriodos();
      const listaPeriodos = datosPer.periodos || [];
      setPeriodos(listaPeriodos);

      // Pre-seleccionar periodo activo si existe
      const activo = listaPeriodos.find(p => p.estado === 'activo');
      if (activo) {
        setIdPeriodo(activo.id_periodo.toString());
      }
    } catch (err) {
      toast.error('Error al inicializar datos del catálogo: ' + err.message);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // Cargar secciones según periodo y filtros
  const cargarSeccionesData = async () => {
    if (!idPeriodo) {
      setSecciones([]);
      return;
    }
    setEstaCargando(true);
    try {
      // Cargamos todas las secciones del periodo
      const datos = await obtenerSecciones('', '', idPeriodo);
      setSecciones(datos.secciones || []);
    } catch (err) {
      toast.error('Error al cargar secciones: ' + err.message);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarSeccionesData();
  }, [idPeriodo]);

  // Filtrar especialidades/carreras según facultad elegida
  const especialidadesFiltradas = especialidades.filter(
    e => e.id_facultad === parseInt(idFacultad)
  );

  // Filtrar secciones cargadas según filtros locales de Facultad, Especialidad y Ciclo
  const seccionesFiltradas = secciones.filter(sec => {
    // Si la especialidad no está cargada aún
    const esp = especialidades.find(e => e.id_especialidad === sec.id_especialidad);
    if (!esp) return false;

    // Filtro de Facultad
    if (idFacultad && esp.id_facultad !== parseInt(idFacultad)) return false;

    // Filtro de Carrera / Especialidad
    if (idEspecialidad && sec.id_especialidad !== parseInt(idEspecialidad)) return false;

    // Filtro de Ciclo
    if (filtroCiclo && sec.ciclo !== parseInt(filtroCiclo)) return false;

    return true;
  });

  const abrirModalAgregar = () => {
    setEditingId(null);
    setCodigo('A');
    setFormEspecialidad(idEspecialidad || '');
    setFormCiclo(filtroCiclo ? parseInt(filtroCiclo) : 1);
    setModalOpen(true);
  };

  const abrirModalEditar = (sec) => {
    setEditingId(sec.id_seccion);
    setCodigo(sec.codigo);
    setFormEspecialidad(sec.id_especialidad.toString());
    setFormCiclo(sec.ciclo);
    setModalOpen(true);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!codigo.trim() || !formEspecialidad || !formCiclo || !idPeriodo) {
      toast.error('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    const payload = {
      codigo: codigo.trim().toUpperCase(),
      id_especialidad: parseInt(formEspecialidad),
      ciclo: parseInt(formCiclo),
      id_periodo: parseInt(idPeriodo)
    };

    try {
      if (editingId) {
        await actualizarSeccion(editingId, payload);
        toast.success('Sección actualizada con éxito.');
      } else {
        await guardarSeccion(payload);
        toast.success('Sección creada con éxito.');
      }
      setModalOpen(false);
      cargarSeccionesData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const manejarEliminar = async (id) => {
    try {
      await eliminarSeccion(id);
      toast.success('Sección eliminada con éxito.');
      setDeleteConfirmId(null);
      cargarSeccionesData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
              <Layers size={20} className="text-primary" /> Gestión de Secciones por Ciclo
            </h3>
            <p className="text-[0.88rem] text-text-muted">Administra la cantidad de secciones disponibles para cada ciclo académico de las carreras.</p>
          </div>
          <button
            type="button"
            onClick={abrirModalAgregar}
            disabled={!idPeriodo}
            className="flex items-center gap-1.5 bg-primary text-white py-2.5 px-5 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Crear Sección
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sec-periodo" className="text-[0.78rem] font-bold text-text-muted uppercase">Periodo Académico</label>
            <select
              id="sec-periodo"
              value={idPeriodo}
              onChange={(e) => {
                setIdPeriodo(e.target.value);
                setFiltroCiclo('');
              }}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Seleccionar Periodo --</option>
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre} {p.estado === 'activo' ? '(Activo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sec-facultad" className="text-[0.78rem] font-bold text-text-muted uppercase">Facultad</label>
            <select
              id="sec-facultad"
              value={idFacultad}
              onChange={(e) => {
                setIdFacultad(e.target.value);
                setIdEspecialidad('');
                setFiltroCiclo('');
              }}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Todas las Facultades --</option>
              {facultades.map(f => (
                <option key={f.id_facultad} value={f.id_facultad}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sec-carrera" className="text-[0.78rem] font-bold text-text-muted uppercase">Carrera</label>
            <select
              id="sec-carrera"
              value={idEspecialidad}
              disabled={!idFacultad}
              onChange={(e) => {
                setIdEspecialidad(e.target.value);
                setFiltroCiclo('');
              }}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- Todas las Carreras --</option>
              {especialidadesFiltradas.map(e => (
                <option key={e.id_especialidad} value={e.id_especialidad}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sec-ciclo" className="text-[0.78rem] font-bold text-text-muted uppercase">Ciclo Académico</label>
            <select
              id="sec-ciclo"
              value={filtroCiclo}
              onChange={(e) => setFiltroCiclo(e.target.value)}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Todos los Ciclos --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={c}>{c}° Ciclo</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listado / Tabla de Secciones */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando secciones...</p>
            </div>
          ) : seccionesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-text-muted italic">
              {!idPeriodo 
                ? 'Por favor, selecciona un Periodo Académico para ver las secciones.'
                : 'No se encontraron secciones para los filtros seleccionados.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Sección</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Carrera / Especialidad</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Ciclo</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Periodo Académico</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {seccionesFiltradas.map((sec) => (
                    <tr key={sec.id_seccion} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-extrabold text-primary">
                        <span className="bg-primary-light px-2.5 py-1 rounded-md">{sec.codigo}</span>
                      </td>
                      <td className="p-4 text-[0.88rem] font-semibold text-text-heading">
                        {sec.especialidad_nombre || `Carrera #${sec.id_especialidad}`}
                      </td>
                      <td className="p-4 text-center text-[0.88rem] font-semibold text-text-heading">
                        {sec.ciclo}° Ciclo
                      </td>
                      <td className="p-4 text-center text-[0.85rem] font-medium text-text-muted">
                        {periodos.find(p => p.id_periodo === sec.id_periodo)?.nombre || `Periodo #${sec.id_periodo}`}
                      </td>
                      <td className="p-4 text-center flex justify-center items-center gap-1">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(sec)}
                          className="text-primary hover:text-primary-hover hover:bg-primary-light font-bold text-[0.82rem] px-2.5 py-1.5 rounded transition-all cursor-pointer"
                        >
                          <Pencil size={14} className="inline mr-1" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(sec.id_seccion)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-[0.82rem] px-2.5 py-1.5 rounded transition-all cursor-pointer"
                        >
                          <Trash2 size={14} className="inline mr-1" /> Eliminar
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

      {/* Modal de Agregar / Editar Sección */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-bg-alt border-b border-border px-6 py-4 flex justify-between items-center">
              <h4 className="font-heading font-extrabold text-[1rem] text-text-heading flex items-center gap-1.5">
                {editingId ? 'Editar Sección' : 'Crear Nueva Sección'}
              </h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-text-heading transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={manejarEnvio} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="form-carrera" className="text-[0.8rem] font-bold text-text-muted uppercase">Carrera / Especialidad *</label>
                <select
                  id="form-carrera"
                  value={formEspecialidad}
                  onChange={(e) => setFormEspecialidad(e.target.value)}
                  className="p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[0.88rem] bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Seleccionar Carrera --</option>
                  {especialidades.map(e => (
                    <option key={e.id_especialidad} value={e.id_especialidad}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-ciclo" className="text-[0.8rem] font-bold text-text-muted uppercase">Ciclo Académico *</label>
                  <select
                    id="form-ciclo"
                    value={formCiclo}
                    onChange={(e) => setFormCiclo(parseInt(e.target.value))}
                    className="p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[0.88rem] bg-white cursor-pointer"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={c}>{c}° Ciclo</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-codigo" className="text-[0.8rem] font-bold text-text-muted uppercase">Código Sección *</label>
                  <input
                    type="text"
                    id="form-codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. A, B, C"
                    maxLength={5}
                    className="p-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[0.88rem]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-5 border border-border text-[0.88rem] font-bold rounded-lg text-text-main hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-primary hover:bg-primary-hover text-[0.88rem] font-bold rounded-lg text-white shadow-sm transition-all cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Crear Sección'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-sm overflow-hidden animate-scale-in p-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-[1.1rem] text-text-heading mb-1">¿Eliminar Sección?</h4>
              <p className="text-[0.82rem] text-text-muted">Esta acción es irreversible y podría afectar las programaciones y matrículas asociadas.</p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-border text-[0.88rem] font-bold rounded-lg text-text-main hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => manejarEliminar(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-[0.88rem] font-bold rounded-lg text-white shadow-sm transition-all cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
