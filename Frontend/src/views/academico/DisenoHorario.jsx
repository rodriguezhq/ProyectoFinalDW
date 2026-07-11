import React, { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Save, BookOpen, Lightbulb, AlertTriangle, X, Pencil } from 'lucide-react';
import { useDisenoHorario } from '../../hooks/academico/useDisenoHorario';

export default function DisenoHorario() {
  // Parámetros seleccionados del panel de control
  const [idPeriodo, setIdPeriodo] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState(''); // Filtro por ciclo académico (1 al 10)

  // Obtener estados y funciones del hook personalizado de diseño
  const {
    periodos,
    facultades,
    especialidades,
    cursos,
    docentes,
    secciones,
    setSecciones,
    estaCargando,
    estaGuardando,
    guardarCambiosHorario
  } = useDisenoHorario(idPeriodo, idFacultad, idEspecialidad, filtroCiclo);

  // Estados locales para el modal de programación interactiva tradicional
  const [modalOpen, setModalOpen] = useState(false);
  const [cursoAProgramar, setCursoAProgramar] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState('LUNES');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [idDocente, setIdDocente] = useState('');

  // Estados locales para la edición interactiva del bloque al hacer click
  const [bloqueAEditar, setBloqueAEditar] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDocente, setEditDocente] = useState('');
  const [editHoraInicio, setEditHoraInicio] = useState('');
  const [editHoraFin, setEditHoraFin] = useState('');

  // Horas disponibles en la grilla (de 7:00 a 22:00)
  const horasDisponibles = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

  // Verificar si el periodo seleccionado está activo (permite edición)
  const esPeriodoActivo = () => {
    const p = periodos.find(per => per.id_periodo === parseInt(idPeriodo));
    return p && p.estado === 'activo';
  };

  // Filtrar especialidades/carreras por facultad elegida
  const especialidadesFiltradas = especialidades.filter(
    e => e.id_facultad === parseInt(idFacultad)
  );

  // Cursos de la carrera filtrados por especialidad y ciclo
  const cursosDisponibles = cursos.filter(c => {
    const perteneceEspecialidad = c.id_especialidades?.includes(parseInt(idEspecialidad));
    const perteneceCiclo = filtroCiclo ? c.ciclo === parseInt(filtroCiclo) : true;
    return perteneceEspecialidad && perteneceCiclo;
  });

  // Docentes elegibles de la facultad seleccionada
  const docentesElegibles = docentes.filter(
    d => d.id_facultad === parseInt(idFacultad)
  );

  // Abrir modal de programación de un curso tradicional
  const iniciarProgramacion = (curso) => {
    setCursoAProgramar(curso);
    setDiaSeleccionado('LUNES');
    setHoraInicio('08:00');
    setHoraFin('10:00');
    setIdDocente('');
    setModalOpen(true);
  };

  // Agregar sección por modal validando cruces
  const agregarSeccion = (e) => {
    e.preventDefault();
    const hInicioIndex = horasDisponibles.indexOf(horaInicio);
    const hFinIndex = horasDisponibles.indexOf(horaFin);

    if (hInicioIndex >= hFinIndex) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    const colision = secciones.some(sec => {
      if (sec.dia !== diaSeleccionado) return false;
      const inicioA = hInicioIndex;
      const finA = hFinIndex;
      const inicioB = horasDisponibles.indexOf(sec.horaInicio);
      const finB = horasDisponibles.indexOf(sec.horaFin);
      return (inicioA < finB && finA > inicioB);
    });

    if (colision) {
      toast.error('¡Cruce de horario detectado! No se puede programar en este bloque.');
      return;
    }

    const num = secciones.length + 1;
    const codigoGenerado = `SEC-${String(num).padStart(2, '0')}`;

    const nuevaSec = {
      id_seccion: null,
      codigo: codigoGenerado,
      dia: diaSeleccionado,
      horaInicio,
      horaFin,
      capacidad: 30,
      id_curso: cursoAProgramar.id_curso,
      id_docente: idDocente,
      curso_nombre: cursoAProgramar.nombre,
    };

    setSecciones([...secciones, nuevaSec]);
    setModalOpen(false);
    toast.success(`${cursoAProgramar.nombre} agregado al horario.`);
  };

  // Manejar el soltado (drop) de una tarjeta de curso sobre una celda del horario
  const manejarDropCurso = (e, dia, horaInicio) => {
    e.preventDefault();
    if (!esPeriodoActivo()) return;

    const idCursoStr = e.dataTransfer.getData("id_curso");
    if (!idCursoStr) return;

    const idCurso = parseInt(idCursoStr);
    const curso = cursos.find(c => c.id_curso === idCurso);
    if (!curso) return;

    // Calcular hora de fin por defecto (2 horas después)
    const hInicioIndex = horasDisponibles.indexOf(horaInicio);
    const hFinIndex = Math.min(hInicioIndex + 2, horasDisponibles.length - 1);
    const horaFin = horasDisponibles[hFinIndex];

    // Validar cruces de horarios en el rango calculado
    const colision = secciones.some(sec => {
      if (sec.dia !== dia) return false;
      const inicioA = hInicioIndex;
      const finA = hFinIndex;
      const inicioB = horasDisponibles.indexOf(sec.horaInicio);
      const finB = horasDisponibles.indexOf(sec.horaFin);
      return (inicioA < finB && finA > inicioB);
    });

    if (colision) {
      toast.error(`¡Cruce de horario detectado! No se puede programar "${curso.nombre}" en este bloque.`);
      return;
    }

    const num = secciones.length + 1;
    const codigoGenerado = `SEC-${String(num).padStart(2, '0')}`;

    const nuevaSec = {
      id_seccion: null,
      codigo: codigoGenerado,
      dia: dia,
      horaInicio,
      horaFin,
      capacidad: 30,
      id_curso: curso.id_curso,
      id_docente: '',
      curso_nombre: curso.nombre,
    };

    setSecciones([...secciones, nuevaSec]);
    toast.success(`"${curso.nombre}" programado los ${dia} de ${horaInicio} a ${horaFin}.`);
  };

  // Redimensionar duración arrastrando el borde inferior del bloque
  const iniciarRedimension = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sec = secciones[index];
    const startY = e.pageY;
    const hInicioIndex = horasDisponibles.indexOf(sec.horaInicio);
    const hFinIndexInicial = horasDisponibles.indexOf(sec.horaFin);
    const alturaFila = 58; // Altura aproximada de fila de 50px + brecha (gap) de 8px

    const alMoverMouse = (eventoMovimiento) => {
      const deltaY = eventoMovimiento.pageY - startY;
      const deltaHoras = Math.round(deltaY / alturaFila);
      const nuevoFinIndex = hFinIndexInicial + deltaHoras;

      if (nuevoFinIndex > hInicioIndex && nuevoFinIndex < horasDisponibles.length) {
        const nuevaHoraFin = horasDisponibles[nuevoFinIndex];
        
        // Validar si la expansión se cruza con otra asignatura de ese día
        const colision = secciones.some((otraSec, otroIndex) => {
          if (otroIndex === index) return false;
          if (otraSec.dia !== sec.dia) return false;
          
          const inicioA = hInicioIndex;
          const finA = nuevoFinIndex;
          const inicioB = horasDisponibles.indexOf(otraSec.horaInicio);
          const finB = horasDisponibles.indexOf(otraSec.horaFin);
          
          return (inicioA < finB && finA > inicioB);
        });

        if (!colision) {
          actualizarCampoSeccion(index, 'horaFin', nuevaHoraFin);
        }
      }
    };

    const alSoltarMouse = () => {
      window.removeEventListener('mousemove', alMoverMouse);
      window.removeEventListener('mouseup', alSoltarMouse);
    };

    window.addEventListener('mousemove', alMoverMouse);
    window.addEventListener('mouseup', alSoltarMouse);
  };

  const iniciarRedimensionSuperior = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sec = secciones[index];
    const startY = e.pageY;
    const hInicioIndexInicial = horasDisponibles.indexOf(sec.horaInicio);
    const hFinIndex = horasDisponibles.indexOf(sec.horaFin);
    const alturaFila = 58;

    const alMoverMouse = (eventoMovimiento) => {
      const deltaY = eventoMovimiento.pageY - startY;
      const deltaHoras = Math.round(deltaY / alturaFila);
      const nuevoInicioIndex = hInicioIndexInicial + deltaHoras;

      if (nuevoInicioIndex >= 0 && nuevoInicioIndex < hFinIndex) {
        const nuevaHoraInicio = horasDisponibles[nuevoInicioIndex];
        
        // Validar si la expansión se cruza con otra asignatura de ese día
        const colision = secciones.some((otraSec, otroIndex) => {
          if (otroIndex === index) return false;
          if (otraSec.dia !== sec.dia) return false;
          
          const inicioA = nuevoInicioIndex;
          const finA = hFinIndex;
          const inicioB = horasDisponibles.indexOf(otraSec.horaInicio);
          const finB = horasDisponibles.indexOf(otraSec.horaFin);
          
          return (inicioA < finB && finA > inicioB);
        });

        if (!colision) {
          actualizarCampoSeccion(index, 'horaInicio', nuevaHoraInicio);
        }
      }
    };

    const alSoltarMouse = () => {
      window.removeEventListener('mousemove', alMoverMouse);
      window.removeEventListener('mouseup', alSoltarMouse);
    };

    window.addEventListener('mousemove', alMoverMouse);
    window.addEventListener('mouseup', alSoltarMouse);
  };

  const removerSeccion = (index) => {
    setSecciones(secciones.filter((_, i) => i !== index));
    if (bloqueAEditar && bloqueAEditar.index === index) {
      setEditModalOpen(false);
      setBloqueAEditar(null);
    }
  };

  const actualizarCampoSeccion = (index, campo, valor) => {
    const actualizadas = [...secciones];
    actualizadas[index][campo] = valor;
    setSecciones(actualizadas);
  };

  const iniciarEdicionBloque = (index, sec) => {
    if (!esPeriodoActivo()) return;
    setBloqueAEditar({ index, ...sec });
    setEditDocente(sec.id_docente || '');
    setEditHoraInicio(sec.horaInicio);
    setEditHoraFin(sec.horaFin);
    setEditModalOpen(true);
  };

  const guardarEdicionBloque = (e) => {
    e.preventDefault();
    const hInicioIndex = horasDisponibles.indexOf(editHoraInicio);
    const hFinIndex = horasDisponibles.indexOf(editHoraFin);

    if (hInicioIndex >= hFinIndex) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    // Validar cruces de horarios con otros bloques programados
    const colision = secciones.some((sec, idx) => {
      if (idx === bloqueAEditar.index) return false;
      if (sec.dia !== bloqueAEditar.dia) return false;
      const inicioA = hInicioIndex;
      const finA = hFinIndex;
      const inicioB = horasDisponibles.indexOf(sec.horaInicio);
      const finB = horasDisponibles.indexOf(sec.horaFin);
      return (inicioA < finB && finA > inicioB);
    });

    if (colision) {
      toast.error('¡Cruce de horario detectado! No se puede guardar en este bloque.');
      return;
    }

    const actualizadas = [...secciones];
    actualizadas[bloqueAEditar.index] = {
      ...actualizadas[bloqueAEditar.index],
      id_docente: editDocente,
      horaInicio: editHoraInicio,
      horaFin: editHoraFin
    };

    setSecciones(actualizadas);
    setEditModalOpen(false);
    setBloqueAEditar(null);
    toast.success('Bloque de horario actualizado.');
  };

  const obtenerGridRowSpan = (hInicio, hFin) => {
    const startIdx = horasDisponibles.indexOf(hInicio);
    const endIdx = horasDisponibles.indexOf(hFin);
    if (startIdx === -1 || endIdx === -1) return 'grid-row: 1 / 2';
    return {
      gridRowStart: startIdx + 2,
      gridRowEnd: endIdx + 2
    };
  };

  const obtenerGridCol = (dia) => {
    const colIdx = diasSemana.indexOf(dia);
    return colIdx !== -1 ? colIdx + 2 : 2;
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1"><Calendar size={20} /> Diseñar Horario y Carga Académica</h3>
            <p className="text-[0.88rem] text-text-muted">Diseño de horarios en grilla semanal (Kanban) y asignación de docentes obligatorios.</p>
          </div>
          {idPeriodo && idFacultad && idEspecialidad && filtroCiclo && esPeriodoActivo() && (
            <button
              type="button"
              disabled={estaGuardando}
              onClick={guardarCambiosHorario}
              className="flex items-center gap-1.5 bg-primary text-white py-2.5 px-6 text-[0.88rem] font-bold rounded-md transition-all hover:bg-primary-hover shadow-sm cursor-pointer disabled:bg-slate-300"
            >
              {estaGuardando ? 'Guardando...' : <><Save size={16} /> Guardar Horario</>}
            </button>
          )}
        </div>

        {/* Selectores */}
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
            <label htmlFor="select-ciclo" className="text-[0.78rem] font-bold text-text-muted uppercase">Seleccionar Ciclo</label>
            <select
              id="select-ciclo"
              value={filtroCiclo}
              disabled={!idEspecialidad}
              onChange={(e) => setFiltroCiclo(e.target.value)}
              className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.85rem] bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- Seleccionar Ciclo --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={c}>
                  {c}° Ciclo
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panel del Diseñador */}
        {!idPeriodo || !idFacultad || !idEspecialidad || !filtroCiclo ? (
          <div className="flex items-center justify-center gap-2 bg-white border border-border rounded-xl p-12 text-center text-text-muted italic shadow-sm">
            <Lightbulb size={18} /> Por favor, selecciona un Periodo Académico, una Facultad, una Carrera y un Ciclo para cargar el diseñador de horarios.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Cursos Disponibles */}
            {esPeriodoActivo() && (
              <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="flex items-center gap-1.5 font-heading font-extrabold text-[0.95rem] text-text-heading"><BookOpen size={16} /> Cursos Disponibles</h4>
                    <p className="text-[0.75rem] text-text-muted">Arrastra de forma horizontal o presiona para agregar a la grilla.</p>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin whitespace-nowrap scroll-smooth select-none">
                  {cursosDisponibles.length === 0 ? (
                    <span className="text-[0.85rem] text-text-muted italic py-4">No hay cursos disponibles para este filtro.</span>
                  ) : (
                    cursosDisponibles.map(cur => (
                      <div
                        key={cur.id_curso}
                        draggable={esPeriodoActivo()}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("id_curso", cur.id_curso);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="bg-bg-alt border border-border rounded-xl p-3 w-[220px] shrink-0 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col justify-between gap-3 inline-block align-top cursor-grab active:cursor-grabbing"
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
                          onClick={() => iniciarProgramacion(cur)}
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
              {!esPeriodoActivo() && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-[0.82rem] font-medium mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" /> <strong>Modo Lectura</strong>: El periodo seleccionado se encuentra cerrado. No se permiten realizar modificaciones de horarios ni de docentes.
                </div>
              )}

              {estaCargando ? (
                <div className="p-12 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[0.88rem] text-text-muted">Cargando horario...</p>
                </div>
              ) : (
                <div className="min-w-[800px] flex flex-col select-none">
                  {/* Grid Cabecera */}
                  <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2 mb-2">
                    <div className="text-center font-bold text-[0.78rem] text-text-muted uppercase">Hora</div>
                    {diasSemana.map(dia => (
                      <div key={dia} className="text-center font-heading font-extrabold text-[0.88rem] text-primary bg-primary-light py-2 rounded-lg border border-primary/10">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Grid Cuerpo */}
                  <div className="relative grid grid-cols-[80px_repeat(5,1fr)] grid-rows-[repeat(15,minmax(50px,auto))] gap-2 h-[550px] overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50 scrollbar-thin">
                    {horasDisponibles.slice(0, -1).map((hora, idx) => (
                      <React.Fragment key={hora}>
                        <div 
                          style={{ gridColumn: 1, gridRowStart: idx + 2 }}
                          className="text-center text-[0.78rem] font-bold font-mono text-slate-500 flex items-center justify-center border-r border-slate-200"
                        >
                          {hora}
                        </div>
                        {diasSemana.map((dia, dIdx) => (
                          <div
                            key={dIdx}
                            style={{ gridColumn: dIdx + 2, gridRowStart: idx + 2 }}
                            className="border-b border-dashed border-slate-200/60 min-h-[50px] transition-colors duration-150 hover:bg-primary/5"
                            onDragOver={(evento) => {
                              if (esPeriodoActivo()) {
                                evento.preventDefault();
                              }
                            }}
                            onDrop={(evento) => manejarDropCurso(evento, dia, hora)}
                          />
                        ))}
                      </React.Fragment>
                    ))}

                    {/* Renderizar las secciones activas */}
                    {secciones.map((sec, index) => {
                      const gridPos = obtenerGridRowSpan(sec.horaInicio, sec.horaFin);
                      const col = obtenerGridCol(sec.dia);

                      return (
                        <div
                          key={index}
                          style={{
                            gridColumn: col,
                            gridRowStart: gridPos.gridRowStart,
                            gridRowEnd: gridPos.gridRowEnd
                          }}
                          onClick={() => iniciarEdicionBloque(index, sec)}
                          className="bg-white border-2 border-primary/20 hover:border-primary/40 rounded-xl p-3 shadow-md transition-all flex flex-col justify-between items-stretch gap-1.5 group relative animate-scale-in cursor-pointer hover:shadow-lg"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-mono text-[0.68rem] font-extrabold text-primary bg-primary-light px-2 py-0.5 rounded truncate max-w-[70px]">
                              {sec.codigo}
                            </span>
                            <span className="text-[0.68rem] font-mono font-bold text-slate-400">
                              {sec.horaInicio}-{sec.horaFin}
                            </span>
                            {esPeriodoActivo() && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removerSeccion(index);
                                }}
                                className="text-red-500 hover:text-red-700 font-bold text-[0.88rem] shrink-0 ml-1 cursor-pointer"
                                title="Remover de la programación"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          <div className="flex-1 flex items-center justify-center text-center">
                            <h5 className="text-[0.78rem] font-bold text-text-heading leading-snug break-words" title={sec.curso_nombre}>
                              {sec.curso_nombre}
                            </h5>
                          </div>

                          {/* Manejador de redimensión (arrastrar borde superior) */}
                          {esPeriodoActivo() && (
                            <div
                              className="absolute top-0 left-0 right-0 h-2.5 cursor-ns-resize bg-transparent hover:bg-primary/20 group-hover:bg-primary/10 transition-colors rounded-t-xl z-20"
                              onMouseDown={(evento) => {
                                evento.stopPropagation();
                                iniciarRedimensionSuperior(evento, index);
                              }}
                              title="Arrastra para cambiar inicio"
                            />
                          )}

                          {/* Manejador de redimensión (arrastrar borde inferior) */}
                          {esPeriodoActivo() && (
                            <div
                              className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize bg-transparent hover:bg-primary/20 group-hover:bg-primary/10 transition-colors rounded-b-xl z-20"
                              onMouseDown={(evento) => {
                                evento.stopPropagation();
                                iniciarRedimension(evento, index);
                              }}
                              title="Arrastra para cambiar duración"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Agregar Sección */}
      {modalOpen && cursoAProgramar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="flex items-center gap-2 font-heading font-extrabold text-primary text-[1.1rem]">
                <Calendar size={18} /> Programar: {cursoAProgramar.nombre}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={agregarSeccion}>
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

      {/* Modal para Editar Bloque Programado */}
      {editModalOpen && bloqueAEditar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setEditModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="flex items-center gap-2 font-heading font-extrabold text-primary text-[1.1rem]">
                <Pencil size={18} /> Editar Bloque: {bloqueAEditar.curso_nombre}
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={guardarEdicionBloque}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-docente" className="text-[0.82rem] font-bold text-text-muted uppercase">Docente Responsable</label>
                  <select
                    id="edit-docente"
                    value={editDocente}
                    onChange={(e) => setEditDocente(e.target.value)}
                    className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer font-medium"
                  >
                    <option value="">-- Seleccionar Docente --</option>
                    {docentesElegibles.map(d => (
                      <option key={d.id_docente} value={d.id_docente}>
                        {d.apellidos}, {d.nombres}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-hinicio" className="text-[0.82rem] font-bold text-text-muted uppercase">Hora Inicio</label>
                    <select
                      id="edit-hinicio"
                      value={editHoraInicio}
                      onChange={(e) => setEditHoraInicio(e.target.value)}
                      className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer font-medium"
                    >
                      {horasDisponibles.slice(0, -1).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-hfin" className="text-[0.82rem] font-bold text-text-muted uppercase">Hora Fin</label>
                    <select
                      id="edit-hfin"
                      value={editHoraFin}
                      onChange={(e) => setEditHoraFin(e.target.value)}
                      className="p-2.5 border border-border rounded-md bg-white focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer font-medium"
                    >
                      {horasDisponibles.slice(horasDisponibles.indexOf(editHoraInicio) + 1).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
