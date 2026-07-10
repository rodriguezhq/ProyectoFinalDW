import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function DisenoHorario() {
  const [periodos, setPeriodos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);

  // Parámetros seleccionados
  const [idPeriodo, setIdPeriodo] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState(''); // Filtro por número de ciclo (1 al 10)

  // Secciones en el horario (diseño activo)
  const [secciones, setSecciones] = useState([]);
  // Rastreo de IDs de secciones eliminadas para pasarlas en lote con eliminar: true
  const [seccionesEliminadasIds, setSeccionesEliminadasIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal para agregar una sección de forma interactiva
  const [modalOpen, setModalOpen] = useState(false);
  const [cursoAProgramar, setCursoAProgramar] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState('LUNES');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [aula, setAula] = useState('Aula 101');
  const [idDocente, setIdDocente] = useState('');

  // Horas del grid (de 7:00 a 22:00)
  const horasDisponibles = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

  // Cargar datos maestros al iniciar
  const loadInitialData = async () => {
    try {
      const perRes = await apiFetch('/api/admin/periodos', { method: 'GET' });
      if (perRes.ok) {
        const perData = await perRes.json();
        setPeriodos(perData.periodos || []);
      }
      const facRes = await apiFetch('/api/courses/facultades', { method: 'GET' });
      if (facRes.ok) {
        const facData = await facRes.json();
        setFacultades(facData.facultades || []);
      }
      const espRes = await apiFetch('/api/courses/especialidades', { method: 'GET' });
      if (espRes.ok) {
        const espData = await espRes.json();
        setEspecialidades(espData.especialidades || []);
      }
      const curRes = await apiFetch('/api/courses/cursos', { method: 'GET' });
      if (curRes.ok) {
        const curData = await curRes.json();
        setCursos(curData.cursos || []);
      }
      const docRes = await apiFetch('/api/admin/docentes', { method: 'GET' });
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocentes(docData.docentes || []);
      }
    } catch (err) {
      toast.error('Error al inicializar los datos del horario.');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar las secciones existentes cuando se seleccionan los 3 parámetros
  const fetchSeccionesExistentes = async () => {
    if (!idPeriodo || !idFacultad || !idEspecialidad) {
      setSecciones([]);
      setSeccionesEliminadasIds([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/courses/secciones?id_periodo=${idPeriodo}`, { method: 'GET' });
      if (!response.ok) throw new Error('Error al cargar las secciones programadas');
      const data = await response.json();
      
      const cursosCarreraIds = cursos
        .filter(c => c.id_especialidades?.includes(parseInt(idEspecialidad)))
        .map(c => c.id_curso);

      const seccionesFiltradas = (data.secciones || [])
        .filter(sec => cursosCarreraIds.includes(sec.id_curso))
        .map(sec => {
          const parts = (sec.horario || '').split(' ');
          const dia = parts[0] || 'LUNES';
          const range = parts[1] || '08:00-10:00';
          const [hInicio, hFin] = range.split('-');

          return {
            id_seccion: sec.id_seccion,
            codigo: sec.codigo,
            dia: dia,
            horaInicio: hInicio || '08:00',
            horaFin: hFin || '10:00',
            aula: sec.aula || 'Aula 101',
            capacidad: sec.capacidad || 30,
            id_curso: sec.id_curso,
            id_docente: sec.id_docente || '',
            curso_nombre: sec.curso_nombre,
          };
        });

      setSecciones(seccionesFiltradas);
      setSeccionesEliminadasIds([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeccionesExistentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPeriodo, idFacultad, idEspecialidad, cursos]);

  // Verificar si el periodo seleccionado está activo (editable)
  const isPeriodoActivo = () => {
    const p = periodos.find(per => per.id_periodo === parseInt(idPeriodo));
    return p && p.estado === 'activo';
  };

  // Filtrar carreras por facultad elegida
  const especialidadesFiltradas = especialidades.filter(
    e => e.id_facultad === parseInt(idFacultad)
  );

  // Cursos disponibles de la carrera filtrados por especialidad y por número de ciclo si corresponde
  const cursosDisponibles = cursos.filter(c => {
    const perteneceEspecialidad = c.id_especialidades?.includes(parseInt(idEspecialidad));
    const perteneceCiclo = filtroCiclo ? c.ciclo === parseInt(filtroCiclo) : true;
    return perteneceEspecialidad && perteneceCiclo;
  });

  // Docentes elegibles (pertenecientes a la facultad seleccionada)
  const docentesElegibles = docentes.filter(
    d => d.id_facultad === parseInt(idFacultad)
  );

  // Manejador para abrir modal de programación de un curso
  const startProgramar = (curso) => {
    setCursoAProgramar(curso);
    setDiaSeleccionado('LUNES');
    setHoraInicio('08:00');
    setHoraFin('10:00');
    setAula('Aula 101');
    setIdDocente('');
    setModalOpen(true);
  };

  const handleAddSeccion = (e) => {
    e.preventDefault();
    const hInicioIndex = horasDisponibles.indexOf(horaInicio);
    const hFinIndex = horasDisponibles.indexOf(horaFin);

    if (hInicioIndex >= hFinIndex) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    const colision = secciones.some(sec => 
      sec.dia === diaSeleccionado &&
      ((horaInicio >= sec.horaInicio && horaInicio < sec.horaFin) ||
       (horaFin > sec.horaInicio && horaFin <= sec.horaFin) ||
       (horaInicio <= sec.horaInicio && horaFin >= sec.horaFin))
    );

    if (colision) {
      toast.warning('Existe un cruce de horario en ese día y rango. Se agregará igualmente.');
    }

    const num = secciones.length + 1;
    const codigoGenerado = `SEC-${String(num).padStart(2, '0')}`;

    const nuevaSec = {
      id_seccion: null,
      codigo: codigoGenerado,
      dia: diaSeleccionado,
      horaInicio,
      horaFin,
      aula,
      capacidad: 30,
      id_curso: cursoAProgramar.id_curso,
      id_docente: idDocente,
      curso_nombre: cursoAProgramar.nombre,
    };

    setSecciones([...secciones, nuevaSec]);
    setModalOpen(false);
    toast.success(`${cursoAProgramar.nombre} agregado al horario.`);
  };

  const removeSeccion = (index) => {
    const sec = secciones[index];
    if (sec.id_seccion) {
      setSeccionesEliminadasIds([...seccionesEliminadasIds, sec.id_seccion]);
    }
    setSecciones(secciones.filter((_, i) => i !== index));
  };

  const updateSeccionField = (index, field, value) => {
    const updated = [...secciones];
    updated[index][field] = value;
    setSecciones(updated);
  };

  const handleGuardarLote = async () => {
    const sinDocente = secciones.some(s => !s.id_docente);
    if (sinDocente) {
      toast.error('Cada sección en el horario debe tener asignado un docente obligatorio.');
      return;
    }

    setIsSaving(true);
    try {
      const listaLote = secciones.map(sec => ({
        id_seccion: sec.id_seccion,
        codigo: sec.codigo,
        horario: `${sec.dia} ${sec.horaInicio}-${sec.horaFin}`,
        aula: sec.aula,
        capacidad: sec.capacidad,
        id_curso: sec.id_curso,
        id_docente: parseInt(sec.id_docente),
        id_periodo: parseInt(idPeriodo),
        eliminar: false
      }));

      const listaEliminados = seccionesEliminadasIds.map(id => ({
        id_seccion: id,
        codigo: 'ELIM',
        id_curso: 1,
        id_periodo: parseInt(idPeriodo),
        eliminar: true
      }));

      const payload = {
        secciones: [...listaLote, ...listaEliminados]
      };

      const response = await apiFetch(`/api/courses/secciones/lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || 'Error al guardar el horario.');
      }

      toast.success('Horario y asignación de docentes guardados con éxito.');
      fetchSeccionesExistentes();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getGridRowSpan = (hInicio, hFin) => {
    const startIdx = horasDisponibles.indexOf(hInicio);
    const endIdx = horasDisponibles.indexOf(hFin);
    if (startIdx === -1 || endIdx === -1) return 'grid-row: 1 / 2';
    return {
      gridRowStart: startIdx + 2,
      gridRowEnd: endIdx + 2
    };
  };

  const getGridCol = (dia) => {
    const colIdx = diasSemana.indexOf(dia);
    return colIdx !== -1 ? colIdx + 2 : 2;
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">🗓️ Diseñar Horario y Carga Académica</h3>
            <p className="text-[0.88rem] text-text-muted">Diseño de horarios en grilla semanal y asignación de docentes obligatorios.</p>
          </div>
          {idPeriodo && idFacultad && idEspecialidad && isPeriodoActivo() && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleGuardarLote}
              className="bg-primary text-white py-2.5 px-6 text-[0.88rem] font-bold rounded-md transition-all hover:bg-primary-hover shadow-sm cursor-pointer disabled:bg-slate-300"
            >
              {isSaving ? 'Guardando...' : '💾 Guardar Horario'}
            </button>
          )}
        </div>

        {/* Selectores del lote + Filtro de Ciclo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="select-periodo" className="text-[0.78rem] font-bold text-text-muted uppercase">Periodo Académico</label>
            <select
              id="select-periodo"
              value={idPeriodo}
              onChange={(e) => {
                setIdPeriodo(e.target.value);
                setIdEspecialidad('');
                setFiltroCiclo('');
              }}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Seleccionar Periodo --</option>
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre} ({p.estado === 'activo' ? 'Activo/Edición' : 'Cerrado/Lectura'})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="select-facultad" className="text-[0.78rem] font-bold text-text-muted uppercase">Facultad</label>
            <select
              id="select-facultad"
              value={idFacultad}
              onChange={(e) => {
                setIdFacultad(e.target.value);
                setIdEspecialidad('');
                setFiltroCiclo('');
              }}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer"
            >
              <option value="">-- Seleccionar Facultad --</option>
              {facultades.map(f => (
                <option key={f.id_facultad} value={f.id_facultad}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="select-carrera" className="text-[0.78rem] font-bold text-text-muted uppercase">Carrera / Especialidad</label>
            <select
              id="select-carrera"
              value={idEspecialidad}
              disabled={!idFacultad}
              onChange={(e) => {
                setIdEspecialidad(e.target.value);
                setFiltroCiclo('');
              }}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- Seleccionar Carrera --</option>
              {especialidadesFiltradas.map(e => (
                <option key={e.id_especialidad} value={e.id_especialidad}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="select-ciclo" className="text-[0.78rem] font-bold text-text-muted uppercase">Filtrar por Ciclo</label>
            <select
              id="select-ciclo"
              value={filtroCiclo}
              disabled={!idEspecialidad}
              onChange={(e) => setFiltroCiclo(e.target.value)}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- Todos los Ciclos --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={c}>
                  {c}° Ciclo
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panel de Diseño */}
        {!idPeriodo || !idFacultad || !idEspecialidad ? (
          <div className="bg-white border border-border rounded-xl p-12 text-center text-text-muted italic shadow-sm">
            💡 Por favor, selecciona un Periodo Académico, una Facultad y una Carrera para cargar el diseñador de horarios.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Scrollbar Horizontal de Cursos Disponibles */}
            {isPeriodoActivo() && (
              <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-extrabold text-[0.95rem] text-text-heading">📚 Cursos Disponibles</h4>
                    <p className="text-[0.75rem] text-text-muted">Arrastra de forma horizontal o presiona para agregar a la grilla.</p>
                  </div>
                  {filtroCiclo && (
                    <button
                      type="button"
                      onClick={() => setFiltroCiclo('')}
                      className="text-[0.75rem] text-primary font-bold hover:underline"
                    >
                      Mostrar Todos los Ciclos
                    </button>
                  )}
                </div>

                {/* Contenedor con Scrollbar Horizontal */}
                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin whitespace-nowrap scroll-smooth">
                  {cursosDisponibles.length === 0 ? (
                    <span className="text-[0.85rem] text-text-muted italic py-4">No hay cursos disponibles para este filtro.</span>
                  ) : (
                    cursosDisponibles.map(cur => (
                      <div
                        key={cur.id_curso}
                        className="bg-bg-alt border border-border rounded-xl p-3 w-[220px] shrink-0 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col justify-between gap-3 inline-block align-top"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[0.62rem] font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                              {cur.codigo}
                            </span>
                            <span className="text-[0.65rem] text-slate-400 font-extrabold">{cur.ciclo}° Ciclo</span>
                          </div>
                          <h5 className="text-[0.78rem] font-bold text-text-heading mt-1 leading-snug break-words whitespace-normal h-[36px] overflow-hidden line-clamp-2">
                            {cur.nombre}
                          </h5>
                          <span className="text-[0.68rem] text-text-muted font-medium">{cur.creditos} Créditos</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startProgramar(cur)}
                          className="bg-primary hover:bg-primary-hover text-white py-1 px-3 text-[0.75rem] font-bold rounded-lg transition-colors w-full cursor-pointer text-center"
                        >
                          + Programar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Grilla Semanal */}
            <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col overflow-x-auto">
              {!isPeriodoActivo() && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-[0.82rem] font-medium mb-4 flex items-center gap-2">
                  ⚠️ **Modo Lectura**: El periodo seleccionado se encuentra cerrado. No se permiten realizar modificaciones de horarios ni de docentes.
                </div>
              )}

              <div className="min-w-[800px] flex flex-col select-none">
                {/* Grid Header */}
                <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 mb-2">
                  <div className="text-center font-bold text-[0.78rem] text-text-muted uppercase">Hora</div>
                  {diasSemana.map(dia => (
                    <div key={dia} className="text-center font-heading font-extrabold text-[0.88rem] text-primary bg-primary-light py-2 rounded-lg border border-primary/10">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Grid Body */}
                <div className="relative grid grid-cols-[80px_repeat(5,1fr)] grid-rows-[repeat(15,minmax(50px,auto))] gap-2 h-[550px] overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50 scrollbar-thin">
                  {horasDisponibles.slice(0, -1).map((hora, idx) => (
                    <React.Fragment key={hora}>
                      <div 
                        style={{ gridColumn: 1, gridRowStart: idx + 2 }}
                        className="text-center text-[0.78rem] font-bold font-mono text-slate-500 flex items-center justify-center border-r border-slate-200"
                      >
                        {hora}
                      </div>
                      {diasSemana.map((_, dIdx) => (
                        <div
                          key={dIdx}
                          style={{ gridColumn: dIdx + 2, gridRowStart: idx + 2 }}
                          className="border-b border-dashed border-slate-200/60 min-h-[50px]"
                        />
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Renderizar las secciones activas */}
                  {secciones.map((sec, index) => {
                    const gridPos = getGridRowSpan(sec.horaInicio, sec.horaFin);
                    const col = getGridCol(sec.dia);

                    return (
                      <div
                        key={index}
                        style={{
                          gridColumn: col,
                          gridRowStart: gridPos.gridRowStart,
                          gridRowEnd: gridPos.gridRowEnd
                        }}
                        className="bg-white border-2 border-primary/20 hover:border-primary/40 rounded-xl p-3 shadow-md transition-all flex flex-col justify-between items-stretch gap-2.5 group relative animate-scale-in"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono text-[0.68rem] font-extrabold text-primary bg-primary-light px-2 py-0.5 rounded truncate max-w-[70px]">
                            {sec.codigo}
                          </span>
                          <span className="text-[0.68rem] font-mono font-bold text-slate-400">
                            {sec.horaInicio}-{sec.horaFin}
                          </span>
                          {isPeriodoActivo() && (
                            <button
                              type="button"
                              onClick={() => removeSeccion(index)}
                              className="text-red-500 hover:text-red-700 font-bold text-[0.88rem] shrink-0 ml-1 cursor-pointer"
                              title="Remover de la programación"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        <h5 className="text-[0.78rem] font-bold text-text-heading leading-snug" title={sec.curso_nombre}>
                          {sec.curso_nombre}
                        </h5>

                        <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-slate-100">
                          {/* Selector de Docente */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[0.65rem] text-slate-400 font-extrabold uppercase">Docente</span>
                            {isPeriodoActivo() ? (
                              <select
                                value={sec.id_docente}
                                onChange={(e) => updateSeccionField(index, 'id_docente', e.target.value)}
                                className="w-full text-[0.75rem] border border-border rounded bg-white p-1 focus:outline-none focus:border-primary cursor-pointer font-medium"
                              >
                                <option value="">-- Asignar Docente --</option>
                                {docentesElegibles.map(d => (
                                  <option key={d.id_docente} value={d.id_docente}>
                                    {d.apellidos}, {d.nombres}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[0.75rem] font-semibold text-text-heading">
                                {docentesElegibles.find(d => d.id_docente === sec.id_docente)
                                  ? `${docentesElegibles.find(d => d.id_docente === sec.id_docente).apellidos}, ${docentesElegibles.find(d => d.id_docente === sec.id_docente).nombres}`
                                  : 'No asignado'}
                              </span>
                            )}
                          </div>

                          {/* Entrada de Aula y Capacidad */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[0.65rem] text-slate-400 font-extrabold uppercase">Aula</span>
                              {isPeriodoActivo() ? (
                                <input
                                  type="text"
                                  value={sec.aula}
                                  onChange={(e) => updateSeccionField(index, 'aula', e.target.value)}
                                  className="w-full text-[0.75rem] border border-border rounded p-0.5 font-medium focus:outline-none"
                                />
                              ) : (
                                <span className="text-[0.75rem] font-bold text-slate-700">{sec.aula}</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[0.65rem] text-slate-400 font-extrabold uppercase">Duración</span>
                              {isPeriodoActivo() ? (
                                <select
                                  value={sec.horaFin}
                                  onChange={(e) => updateSeccionField(index, 'horaFin', e.target.value)}
                                  className="w-full text-[0.75rem] border border-border rounded p-0.5 bg-white font-medium focus:outline-none cursor-pointer"
                                >
                                  {horasDisponibles.slice(horasDisponibles.indexOf(sec.horaInicio) + 1).map(h => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[0.75rem] font-bold text-slate-700">Spans</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Agregar Sección */}
      {modalOpen && cursoAProgramar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                🗓️ Programar: {cursoAProgramar.nombre}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all text-2xl font-bold cursor-pointer focus:outline-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddSeccion}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-dia" className="text-[0.82rem] font-bold text-text-muted uppercase">Día de la Semana</label>
                  <select
                    id="modal-dia"
                    value={diaSeleccionado}
                    onChange={(e) => setDiaSeleccionado(e.target.value)}
                    className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
                  >
                    {diasSemana.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-hinicio" className="text-[0.82rem] font-bold text-text-muted uppercase">Hora Inicio</label>
                    <select
                      id="modal-hinicio"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
                    >
                      {horasDisponibles.slice(0, -1).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-hfin" className="text-[0.82rem] font-bold text-text-muted uppercase">Hora Fin</label>
                    <select
                      id="modal-hfin"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
                    >
                      {horasDisponibles.slice(1).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-aula" className="text-[0.82rem] font-bold text-text-muted uppercase">Aula / Salón</label>
                  <input
                    id="modal-aula"
                    type="text"
                    value={aula}
                    onChange={(e) => setAula(e.target.value)}
                    placeholder="Ej. Aula 101"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-docente" className="text-[0.82rem] font-bold text-text-muted uppercase">Docente Responsable</label>
                  <select
                    id="modal-docente"
                    value={idDocente}
                    onChange={(e) => setIdDocente(e.target.value)}
                    className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
                  >
                    <option value="">-- Seleccionar Docente --</option>
                    {docentesElegibles.map(d => (
                      <option key={d.id_docente} value={d.id_docente}>
                        {d.apellidos}, {d.nombres}
                      </option>
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
                  Agregar a Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
