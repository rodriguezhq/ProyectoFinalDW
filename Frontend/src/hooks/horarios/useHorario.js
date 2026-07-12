import { useState, useEffect, useCallback } from 'react';
import { obtenerMatriculasPropias, obtenerMisSeccionesDocente } from '../../services/servicioHorarios';
import { listaColores } from '../../constants/horarios';

const mapaDias = {
  'LUN': 'Lunes', 'LUNES': 'Lunes',
  'MAR': 'Martes', 'MARTES': 'Martes',
  'MIE': 'Miércoles', 'MIERCOLES': 'Miércoles',
  'JUE': 'Jueves', 'JUEVES': 'Jueves',
  'VIE': 'Viernes', 'VIERNES': 'Viernes',
  'SAB': 'Sábado', 'SABADO': 'Sábado'
};

// Docente: cada bloque ya viene aplanado, con "horario" como texto "Lun 08:00-10:00"
const parsearHorarioDocente = (secciones) => {
  const resultado = [];
  let indiceColor = 0;

  secciones.forEach(seccion => {
    const horarioStr = seccion.horario;
    if (!horarioStr) return;

    const partes = horarioStr.split(' ');
    if (partes.length < 2) return;

    const rangoHoras = partes[1].split('-');
    if (rangoHoras.length < 2) return;

    const nombreDiaCompleto = mapaDias[partes[0].trim().toUpperCase()];
    if (!nombreDiaCompleto) return;

    resultado.push({
      dia: nombreDiaCompleto,
      horaInicio: rangoHoras[0],
      horaFin: rangoHoras[1],
      curso: seccion.curso_nombre || seccion.curso || 'Asignatura',
      color: listaColores[indiceColor++ % listaColores.length]
    });
  });

  return resultado;
};

// Estudiante: cada matricula trae "cursos", y cada curso trae "horarios" (lista de bloques)
const parsearHorarioEstudiante = (cursos) => {
  const resultado = [];
  let indiceColor = 0;

  cursos.forEach(curso => {
    const color = listaColores[indiceColor++ % listaColores.length];
    (curso.horarios || []).forEach(bloque => {
      const nombreDiaCompleto = mapaDias[(bloque.dia || '').trim().toUpperCase()];
      if (!nombreDiaCompleto || !bloque.horaInicio || !bloque.horaFin) return;

      resultado.push({
        dia: nombreDiaCompleto,
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin,
        curso: curso.nombre || 'Asignatura',
        color: color
      });
    });
  });

  return resultado;
};

export function useHorario(esDocente = false) {
  const [datosHorario, setDatosHorario] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState(null);

  const obtenerHorario = useCallback(async () => {
    setEstaCargando(true);
    setMensajeError(null);

    try {
      let parseado = [];
      if (esDocente) {
        const datos = await obtenerMisSeccionesDocente();
        parseado = parsearHorarioDocente(datos.secciones || []);
      } else {
        const datos = await obtenerMatriculasPropias();
        const matriculas = datos.matriculas || [];
        // Solo la matricula mas reciente (viene ordenada por fecha desc.),
        // para no mezclar cursos de periodos academicos ya cerrados
        const cursos = matriculas.length > 0 ? (matriculas[0].cursos || []) : [];
        parseado = parsearHorarioEstudiante(cursos);
      }

      setDatosHorario(parseado);
    } catch (error) {
      console.error(error);
      setMensajeError("Error al conectar con el servidor para cargar el horario.");
    } finally {
      setEstaCargando(false);
    }
  }, [esDocente]);

  useEffect(() => {
    obtenerHorario();
  }, [obtenerHorario]);

  return {
    datosHorario,
    estaCargando,
    mensajeError,
    refrescarHorario: obtenerHorario
  };
}
