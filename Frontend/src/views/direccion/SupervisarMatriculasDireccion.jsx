import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Download, 
  ListFilter, 
  GraduationCap, 
  Building2, 
  Layers 
} from 'lucide-react';
import { 
  obtenerPeriodos, 
  obtenerFacultades, 
  obtenerEspecialidades, 
  obtenerEstadisticasMatricula 
} from '../../services/servicioAcademico';
import { listarMatriculasAdmin } from '../../services/servicioMatriculaAdmin';

export default function SupervisarMatriculasDireccion() {
  const [activoTab, setActivoTab] = useState('estadisticas');
  const [periodos, setPeriodos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [cargandoPeriodos, setCargandoPeriodos] = useState(false);

  // Datos de Estadísticas
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoEstads, setCargandoEstads] = useState(false);

  // Datos de Listado y Filtros
  const [matriculas, setMatriculas] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [filtroFacultad, setFiltroFacultad] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState('');

  // Cargar catálogos iniciales
  useEffect(() => {
    const inicializarCatalogos = async () => {
      setCargandoPeriodos(true);
      try {
        const [resPeriodos, resFacultades, resEspecialidades] = await Promise.all([
          obtenerPeriodos(),
          obtenerFacultades(),
          obtenerEspecialidades()
        ]);
        
        const listaP = resPeriodos.periodos || [];
        setPeriodos(listaP);
        setFacultades(resFacultades.facultades || []);
        setEspecialidades(resEspecialidades.especialidades || []);

        // Seleccionar el periodo activo o el primero
        const pActivo = listaP.find(p => p.estado === 'activo' || p.es_matricula_activa);
        if (pActivo) {
          setPeriodoSeleccionado(pActivo.id_periodo.toString());
        } else if (listaP.length > 0) {
          setPeriodoSeleccionado(listaP[0].id_periodo.toString());
        }
      } catch (err) {
        toast.error('Error al inicializar datos generales: ' + err.message);
      } finally {
        setCargandoPeriodos(false);
      }
    };

    inicializarCatalogos();
  }, []);

  // Cargar estadísticas cuando cambie el periodo
  useEffect(() => {
    if (!periodoSeleccionado) return;

    const cargarEstadisticas = async () => {
      setCargandoEstads(true);
      try {
        const datos = await obtenerEstadisticasMatricula(periodoSeleccionado);
        setEstadisticas(datos);
      } catch (err) {
        toast.error('Error al cargar estadísticas: ' + err.message);
      } finally {
        setCargandoEstads(false);
      }
    };

    cargarEstadisticas();
  }, [periodoSeleccionado]);

  // Cargar listado de matrículas cuando cambie el periodo
  useEffect(() => {
    if (!periodoSeleccionado) return;

    const cargarListaMatriculas = async () => {
      setCargandoLista(true);
      try {
        const res = await listarMatriculasAdmin(periodoSeleccionado);
        setMatriculas(res.matriculas || []);
      } catch (err) {
        toast.error('Error al cargar listado de matrículas: ' + err.message);
      } finally {
        setCargandoLista(false);
      }
    };

    cargarListaMatriculas();
  }, [periodoSeleccionado]);

  // Filtrar especialidades por facultad seleccionada
  const especialidadesFiltradas = filtroFacultad
    ? especialidades.filter(e => e.id_facultad.toString() === filtroFacultad)
    : especialidades;

  // Filtrar las matrículas del listado
  const matriculasFiltradas = matriculas.filter(m => {
    // Buscar la especialidad por nombre desde el listado
    const espObj = especialidades.find(e => e.nombre === m.estudiante_especialidad);

    // Filtros lógicos
    if (filtroFacultad) {
      if (!espObj || espObj.id_facultad.toString() !== filtroFacultad) {
        return false;
      }
    }

    if (filtroEspecialidad) {
      if (!espObj || espObj.id_especialidad.toString() !== filtroEspecialidad) {
        return false;
      }
    }

    if (filtroCiclo) {
      if (m.estudiante_ciclo?.toString() !== filtroCiclo.toString()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-slide-up w-full">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
            <TrendingUp size={22} className="text-primary" /> Supervisión y Estadísticas de Matrícula
          </h3>
          <p className="text-[0.88rem] text-text-muted">Análisis cuantitativo de avances de matrícula y reporte detallado de solicitudes.</p>
        </div>

        {/* Selector de Periodo */}
        <div className="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-none shadow-xs">
          <Calendar size={16} className="text-text-muted" />
          <select
            value={periodoSeleccionado}
            onChange={(e) => {
              setPeriodoSeleccionado(e.target.value);
              // Limpiar filtros al cambiar de periodo
              setFiltroFacultad('');
              setFiltroEspecialidad('');
              setFiltroCiclo('');
            }}
            disabled={cargandoPeriodos}
            className="text-[0.85rem] font-bold text-text-heading bg-transparent border-none outline-none cursor-pointer focus:ring-0"
          >
            <option value="" disabled>Seleccione Periodo</option>
            {periodos.map(p => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.nombre} {p.es_matricula_activa ? ' (Oficial)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex overflow-x-auto max-w-full whitespace-nowrap bg-bg-alt/50 p-1.5 rounded-none gap-1 border border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setActivoTab('estadisticas')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-none transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'estadisticas' ? 'bg-white text-primary shadow-xs border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <TrendingUp size={16} /> Estadísticas Generales
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('listado')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-none transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'listado' ? 'bg-white text-primary shadow-xs border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <BookOpen size={16} /> Listado de Matrículas
        </button>
      </div>

      {/* Contenido de Pestañas */}
      <div className="w-full">
        {activoTab === 'estadisticas' && (
          <div className="flex flex-col gap-6">
            {cargandoEstads ? (
              <div className="p-12 text-center bg-white border border-border rounded-none">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[0.88rem] text-text-muted">Procesando estadísticas del periodo...</p>
              </div>
            ) : !estadisticas ? (
              <div className="p-12 text-center text-text-muted bg-white border border-border rounded-none">
                No hay información disponible para este periodo académico.
              </div>
            ) : (
              <>
                {/* Panel de Indicadores (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 border border-border rounded-none shadow-none flex items-center justify-between">
                    <div>
                      <span className="text-[0.8rem] font-bold text-text-muted uppercase">Total Solicitudes</span>
                      <h4 className="text-[1.75rem] font-heading font-extrabold text-text-heading mt-1">
                        {estadisticas.total_matriculados}
                      </h4>
                    </div>
                    <div className="w-12 h-12 rounded-none bg-slate-100 flex items-center justify-center text-slate-600">
                      <BookOpen size={24} />
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-border rounded-none shadow-none flex items-center justify-between">
                    <div>
                      <span className="text-[0.8rem] font-bold text-text-muted uppercase">Pendientes</span>
                      <h4 className="text-[1.75rem] font-heading font-extrabold text-blue-600 mt-1">
                        {estadisticas.por_estado.pendiente || 0}
                      </h4>
                    </div>
                    <div className="w-12 h-12 rounded-none bg-blue-50 flex items-center justify-center text-blue-600">
                      <AlertCircle size={24} />
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-border rounded-none shadow-none flex items-center justify-between">
                    <div>
                      <span className="text-[0.8rem] font-bold text-text-muted uppercase">Confirmadas</span>
                      <h4 className="text-[1.75rem] font-heading font-extrabold text-emerald-600 mt-1">
                        {estadisticas.por_estado.confirmada || 0}
                      </h4>
                    </div>
                    <div className="w-12 h-12 rounded-none bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={24} />
                    </div>
                  </div>

                  <div className="bg-white p-5 border border-border rounded-none shadow-none flex items-center justify-between">
                    <div>
                      <span className="text-[0.8rem] font-bold text-text-muted uppercase">Rechazadas</span>
                      <h4 className="text-[1.75rem] font-heading font-extrabold text-red-600 mt-1">
                        {estadisticas.por_estado.rechazada || 0}
                      </h4>
                    </div>
                    <div className="w-12 h-12 rounded-none bg-red-50 flex items-center justify-center text-red-600">
                      <XCircle size={24} />
                    </div>
                  </div>
                </div>

                {/* Gráficas / Barras de Especialidades */}
                <div className="bg-white border border-border rounded-none p-6 shadow-xs">
                  <h4 className="font-heading font-extrabold text-[1rem] text-text-heading mb-4">
                    Distribución de Alumnos Matriculados por Especialidad
                  </h4>
                  {Object.keys(estadisticas.por_especialidad).length === 0 ? (
                    <p className="text-text-muted text-[0.88rem]">No hay matrículas registradas por especialidad.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {Object.entries(estadisticas.por_especialidad).map(([nombreEsp, cantidad]) => {
                        const porcentaje = estadisticas.total_matriculados > 0 
                          ? ((cantidad / estadisticas.total_matriculados) * 100).toFixed(1) 
                          : 0;

                        return (
                          <div key={nombreEsp} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[0.85rem]">
                              <span className="font-bold text-text-heading">{nombreEsp}</span>
                              <span className="text-text-muted">
                                <b>{cantidad}</b> ({porcentaje}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-none overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-none transition-all duration-500" 
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activoTab === 'listado' && (
          <div className="flex flex-col gap-6">
            {/* Panel de Filtros */}
            <div className="bg-white p-5 border border-border rounded-none shadow-none flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ListFilter size={18} className="text-primary" />
                <span className="text-[0.88rem] font-bold text-text-heading">Filtros de Búsqueda Avanzada</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Facultad */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] font-bold text-text-muted uppercase flex items-center gap-1">
                    <Building2 size={12} /> Facultad
                  </label>
                  <select
                    value={filtroFacultad}
                    onChange={(e) => {
                      setFiltroFacultad(e.target.value);
                      setFiltroEspecialidad(''); // Resetear carrera al cambiar facultad
                    }}
                    className="p-2.5 border border-border rounded-none text-[0.85rem] focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">Todas las Facultades</option>
                    {facultades.map(f => (
                      <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Carrera / Especialidad */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] font-bold text-text-muted uppercase flex items-center gap-1">
                    <GraduationCap size={12} /> Carrera / Especialidad
                  </label>
                  <select
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    className="p-2.5 border border-border rounded-none text-[0.85rem] focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">Todas las Especialidades</option>
                    {especialidadesFiltradas.map(e => (
                      <option key={e.id_especialidad} value={e.id_especialidad}>{e.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Ciclo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.78rem] font-bold text-text-muted uppercase flex items-center gap-1">
                    <Layers size={12} /> Ciclo de Estudios
                  </label>
                  <select
                    value={filtroCiclo}
                    onChange={(e) => setFiltroCiclo(e.target.value)}
                    className="p-2.5 border border-border rounded-none text-[0.85rem] focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">Todos los Ciclos</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                      <option key={c} value={c}>Ciclo {c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de Matrículas */}
            <div className="bg-white border border-border rounded-none shadow-xs overflow-hidden">
              {cargandoLista ? (
                <div className="p-12 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[0.88rem] text-text-muted">Cargando listado de matrículas...</p>
                </div>
              ) : matriculasFiltradas.length === 0 ? (
                <div className="p-12 text-center text-text-muted">
                  No se encontraron solicitudes de matrícula con los filtros aplicados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr className="bg-bg-alt border-b border-border">
                        <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                        <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Estudiante</th>
                        <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Especialidad</th>
                        <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Fecha Solicitud</th>
                        <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Estado</th>
                        <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Descarga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {matriculasFiltradas.map((m) => {
                        const esConfirmada = m.estado === 'confirmada' || m.estado === 'pagada' || m.estado === 'validada';
                        const urlFicha = esConfirmada 
                          ? `/api/enrollment/matricula/${m.id_matricula}/pdf`
                          : `/api/enrollment/matricula/${m.id_matricula}/pdf?tipo=pre`;

                        return (
                          <tr key={m.id_matricula} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-[0.82rem] font-mono text-text-muted">
                              {m.estudiante_codigo}
                            </td>
                            <td className="p-4 text-[0.88rem] font-bold text-text-heading">
                              {m.estudiante_nombres} {m.estudiante_apellidos}
                            </td>
                            <td className="p-4 text-[0.88rem] text-text-muted">
                              {m.estudiante_especialidad}
                            </td>
                            <td className="p-4 text-center text-[0.85rem] text-text-muted">
                              {new Date(m.fecha_matricula).toLocaleDateString('es-PE')}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-block py-1 px-3.5 rounded-none text-[0.78rem] font-bold border ${
                                esConfirmada 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : m.estado === 'rechazada'
                                  ? 'bg-red-50 text-red-700 border-red-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>
                                {esConfirmada ? 'Confirmada' : m.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${urlFicha}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-none text-[0.82rem] font-bold border transition-all cursor-pointer ${
                                  esConfirmada 
                                    ? 'bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/10'
                                    : 'bg-primary/5 hover:bg-primary/10 text-primary border-primary/10'
                                }`}
                                title={esConfirmada ? "Descargar Ficha Oficial" : "Descargar Pre-Ficha"}
                              >
                                <Download size={14} /> 
                                {esConfirmada ? 'Ficha Oficial' : 'Pre-Ficha'}
                              </a>
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
        )}
      </div>
    </div>
  );
}
