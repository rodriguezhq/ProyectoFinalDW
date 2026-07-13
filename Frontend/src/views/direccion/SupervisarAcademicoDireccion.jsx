import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Building2, 
  ListFilter, 
  Clock, 
  X, 
  Map, 
  AlertTriangle,
  ArrowLeft,
  Coffee,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { 
  obtenerPeriodos, 
  obtenerFacultades, 
  obtenerEspecialidades, 
  obtenerCursos, 
  obtenerCargaDocente,
  obtenerCursosAperturados
} from '../../services/servicioAcademico';
import { diasSemana, franjasHorarias, clasesColor } from '../../constants/horarios';

export default function SupervisarAcademicoDireccion() {
  const [activoTab, setActivoTab] = useState('cargaDocente');
  const [periodos, setPeriodos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [cargandoPeriodos, setCargandoPeriodos] = useState(false);

  // Estados Pestaña 1: Carga Docente
  const [cargaDocente, setCargaDocente] = useState([]);
  const [cargandoCarga, setCargandoCarga] = useState(false);
  const [filtroFacultadDocente, setFiltroFacultadDocente] = useState('');
  const [docenteHorarioCompleto, setDocenteHorarioCompleto] = useState(null);

  // Estados Pestaña 2: Cumplimiento de Plan de Estudio
  const [filtroFacultadCarrera, setFiltroFacultadCarrera] = useState('');
  const [carreraDetalleCompleto, setCarreraDetalleCompleto] = useState(null);
  const [idsCursosAperturados, setIdsCursosAperturados] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(false);

  const obtenerCursoParaSlot = (dia, slotHora) => {
    if (!docenteHorarioCompleto) return null;
    const horaInicioSlot = slotHora.split(' - ')[0];
    
    return docenteHorarioCompleto.clases.find(item => {
      const diaItem = item.dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const diaFiltro = dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (diaItem !== diaFiltro) return false;
      
      const valorInicio = parseInt(item.horaInicio.replace(':', ''));
      const valorFin = parseInt(item.horaFin.replace(':', ''));
      const valorActual = parseInt(horaInicioSlot.replace(':', ''));
      
      return valorActual >= valorInicio && valorActual < valorFin;
    });
  };

  const obtenerColorCurso = (codigoCurso) => {
    const colores = ['azul', 'purpura', 'verde', 'naranja', 'turquesa', 'rosado'];
    let hash = 0;
    for (let i = 0; i < codigoCurso.length; i++) {
      hash = codigoCurso.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colores.length;
    return colores[index];
  };

  // Cargar catálogos iniciales
  useEffect(() => {
    const inicializarCatalogos = async () => {
      setCargandoPeriodos(true);
      try {
        const [resPeriodos, resFacultades, resEspecialidades, resCursos] = await Promise.all([
          obtenerPeriodos(),
          obtenerFacultades(),
          obtenerEspecialidades(),
          obtenerCursos()
        ]);
        
        const listaP = resPeriodos.periodos || [];
        setPeriodos(listaP);
        setFacultades(resFacultades.facultades || []);
        setEspecialidades(resEspecialidades.especialidades || []);
        setTodosLosCursos(resCursos.cursos || []);

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

  // Cargar carga docente cuando cambie el periodo
  useEffect(() => {
    if (!periodoSeleccionado) return;

    const cargarCargaDocente = async () => {
      setCargandoCarga(true);
      try {
        const datos = await obtenerCargaDocente(periodoSeleccionado);
        setCargaDocente(datos.carga || []);
      } catch (err) {
        toast.error('Error al cargar carga docente: ' + err.message);
      } finally {
        setCargandoCarga(false);
      }
    };

    cargarCargaDocente();
  }, [periodoSeleccionado]);

  // Cargar IDs de cursos aperturados de la carrera seleccionada
  useEffect(() => {
    if (!carreraDetalleCompleto || !periodoSeleccionado) {
      setIdsCursosAperturados([]);
      return;
    }

    const cargarCursosAperturados = async () => {
      setCargandoSecciones(true);
      try {
        const res = await obtenerCursosAperturados(carreraDetalleCompleto.id_especialidad, periodoSeleccionado);
        setIdsCursosAperturados(res.ids_cursos || []);
      } catch (err) {
        toast.error('Error al cargar asignaturas aperturadas: ' + err.message);
      } finally {
        setCargandoSecciones(false);
      }
    };

    cargarCursosAperturados();
  }, [carreraDetalleCompleto, periodoSeleccionado]);

  // --- FILTROS ---
  const docentesFiltrados = filtroFacultadDocente
    ? cargaDocente.filter(d => d.id_facultad.toString() === filtroFacultadDocente)
    : cargaDocente;

  const carrerasFiltradas = filtroFacultadCarrera
    ? especialidades.filter(e => e.id_facultad.toString() === filtroFacultadCarrera)
    : especialidades;

  // Cursos de la carrera seleccionada (Oficiales)
  const cursosCarrera = carreraDetalleCompleto
    ? todosLosCursos.filter(c => c.id_especialidades && c.id_especialidades.includes(carreraDetalleCompleto.id_especialidad))
    : [];

  // Cursos realmente aperturados de esa carrera en el periodo seleccionado (que tienen secciones registradas)
  const cursosAperturadosDeCarrera = carreraDetalleCompleto
    ? todosLosCursos.filter(c => c.id_especialidades && c.id_especialidades.includes(carreraDetalleCompleto.id_especialidad) && idsCursosAperturados.includes(c.id_curso))
    : [];

  const ciclosValores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="flex flex-col gap-6 animate-slide-up w-full">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
            <GraduationCap size={22} className="text-primary" /> Supervisión Académica
          </h3>
          <p className="text-[0.88rem] text-text-muted">Gestión de cumplimiento curricular, mallas y distribución de horas lectivas de docentes.</p>
        </div>

        {/* Selector de Periodo */}
        <div className="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-lg shadow-sm">
          <Calendar size={16} className="text-text-muted" />
          <select
            value={periodoSeleccionado}
            onChange={(e) => {
              setPeriodoSeleccionado(e.target.value);
              setDocenteHorarioCompleto(null);
              setCarreraDetalleCompleto(null);
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

      {/* Navegación de Pestañas (Tabs) */}
      <div className="flex overflow-x-auto max-w-full whitespace-nowrap bg-bg-alt/50 p-1.5 rounded-lg gap-1 border border-border scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActivoTab('cargaDocente');
            setDocenteHorarioCompleto(null);
          }}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'cargaDocente' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <Users size={16} /> Evaluar Carga Docente
        </button>
        <button
          type="button"
          onClick={() => {
            setActivoTab('planEstudios');
            setCarreraDetalleCompleto(null);
          }}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'planEstudios' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <BookOpen size={16} /> Cumplimiento de Plan de Estudio
        </button>
      </div>

      {/* Contenido de Pestañas */}
      <div className="w-full">
        
        {/* TAB 1: Carga Docente */}
        {activoTab === 'cargaDocente' && (
          docenteHorarioCompleto ? (
            // VISTA HORARIO COMPLETO (Otra ventana / sub-pantalla interactiva)
            <div className="flex flex-col gap-6 animate-fade-in w-full">
              {/* Botón de retroceso y Cabecera del Docente */}
              <div className="flex items-center gap-3 bg-white p-5 border border-border rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setDocenteHorarioCompleto(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-text-muted hover:text-text-heading transition-all cursor-pointer border border-border flex items-center justify-center"
                  title="Volver a la lista de docentes"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h4 className="font-heading font-extrabold text-[1.1rem] text-text-heading leading-none">
                    Horario de Clases Semanal: {docenteHorarioCompleto.nombre}
                  </h4>
                  <p className="text-[0.8rem] text-text-muted mt-1.5 uppercase font-semibold">
                    Facultad: {facultades.find(f => f.id_facultad === docenteHorarioCompleto.id_facultad)?.nombre || ''} | Horas Lectivas: {docenteHorarioCompleto.total_horas} hrs | Secciones: {docenteHorarioCompleto.total_secciones}
                  </p>
                </div>
              </div>

              {/* Grilla Semanal Horaria de Lunes a Viernes */}
              <div className="bg-white rounded-2xl border border-border shadow-md p-4 md:p-6 mb-4">
                {docenteHorarioCompleto.clases.length === 0 ? (
                  <div className="py-12 text-center text-text-muted italic bg-slate-50 border border-border border-dashed rounded-xl">
                    El docente no cuenta con horarios de clases programados en este semestre académico.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-border rounded-xl shadow-sm bg-white">
                    <table className="w-full border-collapse min-w-[900px]">
                      <thead>
                        <tr>
                          <th className="w-[130px] bg-bg-alt text-text-heading font-heading font-bold p-4 px-3 border-b border-r border-border last:border-r-0">Hora</th>
                          {diasSemana.filter(d => d !== 'Sábado').map(d => (
                            <th key={d} className="bg-bg-alt text-text-heading font-heading font-bold p-4 px-3 border-b border-r border-border last:border-r-0">{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {franjasHorarias.map((slot, index) => {
                          const horaInicioStr = slot.split(' - ')[0];

                          return (
                            <tr key={index}>
                              <td className="w-[130px] bg-bg-alt font-bold text-text-heading font-heading text-[0.85rem] p-3 border-b border-r border-border last:border-r-0 text-center align-middle">{slot}</td>
                              {diasSemana.filter(d => d !== 'Sábado').map(dia => {
                                const claseActiva = obtenerCursoParaSlot(dia, slot);

                                if (claseActiva) {
                                  const esInicio = claseActiva.horaInicio === horaInicioStr;
                                  const duracion = parseInt(claseActiva.horaFin.split(':')[0]) - parseInt(claseActiva.horaInicio.split(':')[0]);

                                  if (esInicio) {
                                    const colorCurso = obtenerColorCurso(claseActiva.curso_codigo);
                                    return (
                                      <td 
                                        key={dia} 
                                        rowSpan={duracion} 
                                        className="p-1.5 border-b border-r border-border last:border-r-0 text-center text-[0.88rem] align-middle"
                                      >
                                        <div className={`p-3 px-2.5 rounded-md flex flex-col gap-1 h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left animate-fade-in ${clasesColor[colorCurso] || ''}`}>
                                          <span className="font-bold text-text-heading text-[0.82rem] leading-tight">{claseActiva.curso_nombre}</span>
                                          <div className="flex flex-col gap-0.5 mt-1 border-t border-black/5 pt-1.5">
                                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                                              Código: {claseActiva.curso_codigo} | Sec: {claseActiva.seccion}
                                            </span>
                                            <span className="text-[0.65rem] font-medium text-slate-500 mt-0.5">
                                              Aula: {claseActiva.ambiente}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                    );
                                  }
                                  return null;
                                }

                                return <td key={dia} className="text-slate-300 font-normal p-3 border-b border-r border-border last:border-r-0 text-center text-[0.88rem] align-middle">—</td>;
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // LISTADO DE DOCENTES CON FILTRO POR FACULTAD
            <div className="flex flex-col gap-6">
              {/* Panel de Filtro */}
              <div className="bg-white p-5 border border-border rounded-xl shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ListFilter size={18} className="text-primary" />
                  <span className="text-[0.88rem] font-bold text-text-heading">Filtrar Docentes</span>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.78rem] font-bold text-text-muted uppercase flex items-center gap-1">
                      <Building2 size={12} /> Facultad
                    </label>
                    <select
                      value={filtroFacultadDocente}
                      onChange={(e) => setFiltroFacultadDocente(e.target.value)}
                      className="p-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white w-full"
                    >
                      <option value="">Todas las Facultades</option>
                      {facultades.map(f => (
                        <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Listado de Docentes */}
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                {cargandoCarga ? (
                  <div className="p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-[0.88rem] text-text-muted">Procesando carga docente del periodo...</p>
                  </div>
                ) : docentesFiltrados.length === 0 ? (
                  <div className="p-12 text-center text-text-muted">
                    No se encontraron docentes con carga lectiva asignada en el filtro seleccionado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="bg-bg-alt border-b border-border">
                          <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Docente</th>
                          <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad</th>
                          <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Secciones Asignadas</th>
                          <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Horas Totales</th>
                          <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Horario Semanal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {docentesFiltrados.map((d) => (
                          <tr key={d.id_docente} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-[0.88rem] font-bold text-text-heading">
                              {d.nombre}
                            </td>
                            <td className="p-4 text-[0.88rem] text-text-muted">
                              {facultades.find(f => f.id_facultad === d.id_facultad)?.nombre || 'Facultad'}
                            </td>
                            <td className="p-4 text-center text-[0.88rem] font-semibold text-text-heading">
                              {d.total_secciones}
                            </td>
                            <td className="p-4 text-center text-[0.88rem] font-semibold text-text-heading">
                              {d.total_horas} hrs
                            </td>
                            <td className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => setDocenteHorarioCompleto(d)}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded text-[0.82rem] font-bold border bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 transition-all cursor-pointer shadow-3xs"
                              >
                                <Clock size={14} /> Ver Horario
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
          )
        )}

        {/* TAB 2: Cumplimiento de Plan de Estudio */}
        {activoTab === 'planEstudios' && (
          carreraDetalleCompleto ? (
            // VISTA COMPARATIVA COMPLETA DE MALLAS (Otra ventana / sub-pantalla interactiva)
            <div className="flex flex-col gap-6 animate-fade-in w-full">
              {/* Botón de retroceso y Cabecera de la Carrera */}
              <div className="flex items-center gap-3 bg-white p-5 border border-border rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setCarreraDetalleCompleto(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-text-muted hover:text-text-heading transition-all cursor-pointer border border-border flex items-center justify-center"
                  title="Volver a los planes de estudio"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h4 className="font-heading font-extrabold text-[1.1rem] text-text-heading leading-none">
                    Comparación de Plan y Apertura Semestral: {carreraDetalleCompleto.nombre}
                  </h4>
                  <p className="text-[0.8rem] text-text-muted mt-1.5 uppercase font-semibold">
                    Facultad: {facultades.find(f => f.id_facultad === carreraDetalleCompleto.id_facultad)?.nombre || ''} | Semestre Activo: {periodos.find(p => p.id_periodo.toString() === periodoSeleccionado)?.nombre || ''}
                  </p>
                </div>
              </div>

              {/* Contenedor de las Dos Mallas en Formato Diagrama */}
              <div className="flex flex-col gap-8 w-full">
                
                {/* 1. Malla Curricular Oficial */}
                <div className="bg-white rounded-2xl border border-border shadow-md p-6 flex flex-col gap-4 overflow-hidden">
                  <div>
                    <h5 className="font-heading font-extrabold text-[1rem] text-text-heading flex items-center gap-2 border-b border-border pb-3">
                      <Map size={18} className="text-primary" /> Diagrama 1: Malla Curricular Oficial (Plan de Estudios completo)
                    </h5>
                    <p className="text-[0.8rem] text-text-muted mt-1">Estructura curricular oficial con todas las asignaturas requeridas y sus créditos por ciclo.</p>
                  </div>

                  <div className="grow overflow-auto p-4 bg-slate-50 select-none rounded-xl border border-border">
                    {cursosCarrera.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-text-muted italic gap-2 text-[0.85rem]">
                        <span className="flex items-center gap-1.5"><AlertTriangle size={16} /> No hay cursos asociados a esta carrera académica.</span>
                      </div>
                    ) : (
                      <div className="relative flex gap-8 min-w-max pb-4 pt-2 pr-4">
                        {ciclosValores.map(cicloNum => {
                          const cursosDelCiclo = cursosCarrera.filter(c => c.ciclo === cicloNum);
                          return (
                            <div key={cicloNum} className="flex flex-col gap-4 w-[180px] shrink-0 items-center">
                              <div className="bg-primary/5 text-primary text-center py-2 px-3 rounded-lg border border-primary/10 w-full font-heading font-extrabold text-[0.8rem] tracking-tight uppercase shadow-3xs">
                                {cicloNum}° Ciclo
                              </div>
                              <div className="flex flex-col gap-4 w-full grow justify-start">
                                {cursosDelCiclo.map(cur => (
                                  <div
                                    key={cur.id_curso}
                                    className="bg-white border border-border rounded-lg p-3 shadow-3xs hover:border-primary/20 flex flex-col gap-1.5 w-full text-left"
                                  >
                                    <div className="flex justify-between items-start gap-1">
                                      <span className="font-mono text-[0.68rem] font-bold text-primary bg-primary-light px-1.5 py-0.5 rounded leading-none">
                                        {cur.codigo}
                                      </span>
                                      <span className="text-[0.68rem] font-extrabold text-slate-500 font-mono shrink-0">
                                        {cur.creditos} CR
                                      </span>
                                    </div>
                                    <h4 className="text-[0.78rem] font-bold text-text-heading leading-snug">
                                      {cur.nombre}
                                    </h4>
                                  </div>
                                ))}
                                {cursosDelCiclo.length === 0 && (
                                  <div className="border border-dashed border-slate-200 rounded-lg py-4 text-center text-[0.72rem] text-slate-400 italic">
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
                </div>

                {/* 2. Malla de Cursos Aperturados */}
                <div className="bg-white rounded-2xl border border-border shadow-md p-6 flex flex-col gap-4 overflow-hidden">
                  <div>
                    <h5 className="font-heading font-extrabold text-[1rem] text-text-heading flex items-center gap-2 border-b border-border pb-3">
                      <BookOpen size={18} className="text-emerald-600" /> Diagrama 2: Asignaturas Aperturadas en el Semestre (Cumplimiento Real)
                    </h5>
                    <p className="text-[0.8rem] text-text-muted mt-1">Cursos que cuentan con al menos una sección académica activa e inscrita en el periodo de matrícula vigente.</p>
                  </div>

                  <div className="grow overflow-auto p-4 bg-slate-50 select-none rounded-xl border border-border">
                    {cargandoSecciones ? (
                      <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-[0.88rem] text-text-muted">Procesando secciones de matrícula...</p>
                      </div>
                    ) : cursosAperturadosDeCarrera.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-text-muted italic gap-2 text-[0.85rem]">
                        <span className="flex items-center gap-1.5"><AlertTriangle size={16} /> No se ha aperturado ningún curso de esta especialidad en el presente ciclo académico.</span>
                      </div>
                    ) : (
                      <div className="relative flex gap-8 min-w-max pb-4 pt-2 pr-4">
                        {ciclosValores.map(cicloNum => {
                          const cursosAperturadosDelCiclo = cursosAperturadosDeCarrera.filter(c => c.ciclo === cicloNum);
                          return (
                            <div key={cicloNum} className="flex flex-col gap-4 w-[180px] shrink-0 items-center">
                              <div className="bg-emerald-50 text-emerald-700 text-center py-2 px-3 rounded-lg border border-emerald-100 w-full font-heading font-extrabold text-[0.8rem] tracking-tight uppercase shadow-3xs">
                                {cicloNum}° Ciclo
                              </div>
                              <div className="flex flex-col gap-4 w-full grow justify-start">
                                {cursosAperturadosDelCiclo.map(cur => {
                                  return (
                                    <div
                                      key={cur.id_curso}
                                      className="bg-white border-2 border-emerald-100 rounded-lg p-3 shadow-3xs flex flex-col gap-1.5 w-full text-left"
                                    >
                                      <div className="flex justify-between items-start gap-1">
                                        <span className="font-mono text-[0.68rem] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded leading-none border border-emerald-100/50">
                                          {cur.codigo}
                                        </span>
                                        <span className="text-[0.68rem] font-extrabold text-emerald-600 bg-emerald-50/50 px-1 py-0.5 rounded font-mono shrink-0">
                                          {cur.creditos} CR
                                        </span>
                                      </div>
                                      <h4 className="text-[0.78rem] font-bold text-text-heading leading-snug">
                                        {cur.nombre}
                                      </h4>
                                    </div>
                                  );
                                })}
                                {cursosAperturadosDelCiclo.length === 0 && (
                                  <div className="border border-dashed border-slate-200 rounded-lg py-4 text-center text-[0.72rem] text-slate-400 italic">
                                    Sin apertura
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // LISTADO DE CARRERAS A ANCHO COMPLETO
            <div className="flex flex-col gap-6 w-full">
              {/* Panel de Filtro */}
              <div className="bg-white p-5 border border-border rounded-xl shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ListFilter size={18} className="text-primary" />
                  <span className="text-[0.88rem] font-bold text-text-heading">Filtrar Carreras / Planes</span>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.78rem] font-bold text-text-muted uppercase flex items-center gap-1">
                      <Building2 size={12} /> Facultad
                    </label>
                    <select
                      value={filtroFacultadCarrera}
                      onChange={(e) => {
                        setFiltroFacultadCarrera(e.target.value);
                      }}
                      className="p-2.5 border border-border rounded-lg text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white w-full"
                    >
                      <option value="">Todas las Facultades</option>
                      {facultades.map(f => (
                        <option key={f.id_facultad} value={f.id_facultad}>{f.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tabla de Carreras a Ancho Completo */}
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden w-full">
                <div className="p-4 bg-bg-alt border-b border-border font-heading font-extrabold text-[0.88rem] text-text-heading">
                  Programas de Estudio Registrados
                </div>
                {carrerasFiltradas.length === 0 ? (
                  <div className="p-12 text-center text-text-muted text-[0.88rem]">
                    No se encontraron carreras bajo el filtro seleccionado.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr className="bg-bg-alt border-b border-border">
                          <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                          <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Carrera / Especialidad</th>
                          <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad</th>
                          <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {carrerasFiltradas.map((e) => (
                          <tr key={e.id_especialidad} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-[0.88rem] font-mono font-bold text-primary">
                              {e.codigo}
                            </td>
                            <td className="p-4 text-[0.88rem] font-bold text-text-heading">
                              {e.nombre}
                            </td>
                            <td className="p-4 text-[0.88rem] text-text-muted">
                              {facultades.find(f => f.id_facultad === e.id_facultad)?.nombre || 'Facultad'}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => setCarreraDetalleCompleto(e)}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded text-[0.82rem] font-bold border bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 transition-all cursor-pointer shadow-3xs"
                              >
                                <Map size={14} /> Ver Detalle
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
          )
        )}

      </div>

    </div>
  );
}
