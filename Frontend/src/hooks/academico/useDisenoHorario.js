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
