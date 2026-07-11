import { consultarApi } from './clienteApi';

// Obtiene el horario de un periodo, facultad, especialidad y ciclo específicos
export async function obtenerHorario(idPeriodo, idFacultad, idEspecialidad, ciclo) {
  const respuesta = await consultarApi(`/api/courses/horarios?id_periodo=${idPeriodo}&id_facultad=${idFacultad}&id_especialidad=${idEspecialidad}&ciclo=${ciclo}`, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar el horario programado');
  return respuesta.json();
}

// Obtiene la matrícula del estudiante autenticado (para ver su horario)
export async function obtenerMatriculasPropias() {
  const respuesta = await consultarApi('/api/enrollment/mias', { method: 'GET' });
  if (!respuesta.ok) throw new Error('No se pudo obtener la información de matrículas del estudiante.');
  return respuesta.json();
}

// Obtiene las secciones asignadas al docente autenticado
export async function obtenerMisSeccionesDocente() {
  const respuesta = await consultarApi('/api/courses/mis-secciones', { method: 'GET' });
  if (!respuesta.ok) throw new Error('No se pudo obtener la información de secciones del docente.');
  return respuesta.json();
}

// Guarda o actualiza un horario específico por ciclo
export async function guardarHorario(datosHorario) {
  const respuesta = await consultarApi('/api/courses/horarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosHorario)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al guardar el horario.');
  }
  return respuesta.json();
}
