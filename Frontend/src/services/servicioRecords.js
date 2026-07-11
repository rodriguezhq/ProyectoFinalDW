import { consultarApi } from './clienteApi';

// Obtiene el récord académico histórico completo de un estudiante
export async function obtenerRecordEstudiante(idEstudiante) {
  const respuesta = await consultarApi(`/api/records/${idEstudiante}`, { method: 'GET' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al cargar el récord académico.');
  }
  return respuesta.json();
}
