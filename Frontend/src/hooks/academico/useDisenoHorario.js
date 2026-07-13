import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { obtenerPeriodos, obtenerFacultades, obtenerEspecialidades, obtenerCursos } from '../../services/servicioAcademico';
import { obtenerDocentes } from '../../services/servicioUsuarios';
import { obtenerHorario, guardarHorario } from '../../services/servicioHorarios';

export function useDisenoHorario(idPeriodo, idFacultad, idEspecialidad, filtroCiclo) {
  const [periodos, setPeriodos] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);

  const [secciones, setSecciones] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [estaGuardando, setEstaGuardando] = useState(false);

  // Cargar catálogos maestros iniciales
  const cargarDatosCatalogos = useCallback(async () => {
    try {
      const datosPeriodos = await obtenerPeriodos();
      setPeriodos(datosPeriodos.periodos || []);

      const datosFacultades = await obtenerFacultades();
      setFacultades(datosFacultades.facultades || []);

      const datosEspecialidades = await obtenerEspecialidades();
      setEspecialidades(datosEspecialidades.especialidades || []);

      const datosCursos = await obtenerCursos();
      setCursos(datosCursos.cursos || []);

      const datosDocentes = await obtenerDocentes();
      setDocentes(datosDocentes.docentes || []);
    } catch (error) {
      toast.error('Error al inicializar los datos para el diseño de horarios.');
    }
  }, []);

  useEffect(() => {
    cargarDatosCatalogos();
  }, [cargarDatosCatalogos]);

  // Cargar horario existente para los parámetros y ciclo seleccionados
  const cargarHorarioExistente = useCallback(async () => {
    if (!idPeriodo || !idFacultad || !idEspecialidad || !filtroCiclo) {
      setSecciones([]);
      return;
    }

    setEstaCargando(true);
    try {
      const datosHorario = await obtenerHorario(idPeriodo, idFacultad, idEspecialidad, filtroCiclo);
      if (datosHorario.horario) {
        setSecciones(datosHorario.horario.detalles || []);
      } else {
        setSecciones([]);
      }
    } catch (error) {
      toast.error(error.message || 'Error al cargar el horario programado.');
    } finally {
      setEstaCargando(false);
    }
  }, [idPeriodo, idFacultad, idEspecialidad, filtroCiclo]);

  useEffect(() => {
    cargarHorarioExistente();
  }, [cargarHorarioExistente]);

  // Guardar horario por ciclo en el servidor
  const guardarCambiosHorario = async () => {
    if (!idPeriodo || !idFacultad || !idEspecialidad || !filtroCiclo) {
      toast.error('Todos los filtros (Periodo, Facultad, Especialidad y Ciclo) son obligatorios.');
      return;
    }

    const sinDocente = secciones.some(s => !s.id_docente);
    if (sinDocente) {
      toast.error('Cada bloque en el horario debe tener asignado un docente obligatorio.');
      return;
    }

    // Validar que se cumpla la cantidad de horas mínimas (teóricas + prácticas) por curso en cada sección
    const seccionesPorGrupo = {};
    secciones.forEach(sec => {
      const claveGrupo = `${sec.seccion || 'A'}_${sec.id_curso}`;
      if (!seccionesPorGrupo[claveGrupo]) {
        seccionesPorGrupo[claveGrupo] = [];
      }
      seccionesPorGrupo[claveGrupo].push(sec);
    });

    const horasDisponibles = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    for (const claveGrupo in seccionesPorGrupo) {
      const bloques = seccionesPorGrupo[claveGrupo];
      if (bloques.length === 0) continue;

      const idCurso = bloques[0].id_curso;
      const seccionNombre = bloques[0].seccion || 'A';

      const curso = cursos.find(c => c.id_curso === idCurso);
      if (!curso) continue;

      const horasAsignadas = bloques.reduce((acum, sec) => {
        const inicioIdx = horasDisponibles.indexOf(sec.horaInicio);
        const finIdx = horasDisponibles.indexOf(sec.horaFin);
        const dif = (inicioIdx !== -1 && finIdx !== -1) ? (finIdx - inicioIdx) : 0;
        return acum + dif;
      }, 0);

      const horasRequeridas = (curso.horas_teoria || 0) + (curso.horas_practica || 0);
      if (horasAsignadas < horasRequeridas) {
        toast.error(`En la Sección ${seccionNombre}, el curso "${curso.nombre}" tiene programadas ${horasAsignadas} horas, pero requiere un mínimo de ${horasRequeridas} horas (Teoría: ${curso.horas_teoria}, Práctica: ${curso.horas_practica}).`);
        return;
      } else if (horasAsignadas > horasRequeridas) {
        toast.error(`En la Sección ${seccionNombre}, el curso "${curso.nombre}" tiene programadas ${horasAsignadas} horas, superando el límite máximo permitido de ${horasRequeridas} horas (Teoría: ${curso.horas_teoria}, Práctica: ${curso.horas_practica}).`);
        return;
      }
    }

    setEstaGuardando(true);
    try {
      const payload = {
        id_periodo: parseInt(idPeriodo),
        id_facultad: parseInt(idFacultad),
        id_especialidad: parseInt(idEspecialidad),
        ciclo: parseInt(filtroCiclo),
        detalles: secciones.map(sec => ({
          codigo: sec.codigo,
          seccion: sec.seccion || 'A',
          dia: sec.dia,
          horaInicio: sec.horaInicio,
          horaFin: sec.horaFin,
          id_curso: parseInt(sec.id_curso),
          id_docente: parseInt(sec.id_docente),
          curso_nombre: sec.curso_nombre
        }))
      };

      await guardarHorario(payload);
      toast.success('Horario y asignación de docentes guardados con éxito.');
      await cargarHorarioExistente();
    } catch (error) {
      toast.error(error.message || 'Error al guardar el horario.');
    } finally {
      setEstaGuardando(false);
    }
  };

  return {
    periodos,
    facultades,
    especialidades,
    cursos,
    docentes,
    secciones,
    setSecciones,
    estaCargando,
    estaGuardando,
    guardarCambiosHorario,
    recargarSecciones: cargarHorarioExistente
  };
}
