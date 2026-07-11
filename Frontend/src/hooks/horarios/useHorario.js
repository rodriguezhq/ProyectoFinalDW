import { useState, useEffect, useCallback } from 'react';
import { obtenerMatriculasPropias, obtenerMisSeccionesDocente } from '../../services/servicioHorarios';
import { listaColores } from '../../constants/horarios';

// Convierte la cadena del horario del backend (ej: "Lun/Mie 08:00-10:00") en slots independientes
const parsearHorarioServidor = (seccionesServidor) => {
  const resultado = [];
  const mapaDias = {
    'Lun': 'Lunes',
    'Mar': 'Martes',
    'Mie': 'Miércoles',
    'Jue': 'Jueves',
    'Vie': 'Viernes',
    'Sab': 'Sábado'
  };

  let indiceColor = 0;

  seccionesServidor.forEach(seccion => {
    const horarioStr = seccion.horario;
    if (!horarioStr) return;

    const partes = horarioStr.split(' ');
    if (partes.length < 2) return;

    const parteDias = partes[0];
    const parteHoras = partes[1];

    const rangoHoras = parteHoras.split('-');
    if (rangoHoras.length < 2) return;

    const horaInicio = rangoHoras[0];
    const horaFin = rangoHoras[1];

    const diasIndividuales = parteDias.split('/');

    const color = listaColores[indiceColor % listaColores.length];
    indiceColor++;

    diasIndividuales.forEach(dia => {
      const nombreDiaCompleto = mapaDias[dia.trim()];
      if (nombreDiaCompleto) {
        resultado.push({
          dia: nombreDiaCompleto,
          horaInicio: horaInicio,
          horaFin: horaFin,
          curso: seccion.curso_nombre || seccion.curso || 'Asignatura',
          color: color
        });
      }
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
      let secciones = [];
      if (esDocente) {
        const datos = await obtenerMisSeccionesDocente();
        secciones = datos.secciones || [];
      } else {
        const datos = await obtenerMatriculasPropias();
        const matriculas = datos.matriculas || [];
        secciones = matriculas.flatMap(m => m.detalles || []);
      }

      const parseado = parsearHorarioServidor(secciones);
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
