import { consultarApi } from './clienteApi';

const urlBaseApi = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Obtiene la oferta académica disponible para el estudiante en el periodo activo.
 * Retorna: { ya_matriculado, id_matricula, periodo_nombre, cursos }
 */
export async function obtenerOfertaAcademica() {
  const respuesta = await consultarApi('/api/enrollment/oferta-academica', { method: 'GET' });
  if (!respuesta.ok) {
    const errorDatos = await respuesta.json();
    throw new Error(errorDatos.msg || 'Error al obtener la oferta académica.');
  }
  return await respuesta.json();
}

/**
 * Procesa y registra la matrícula del estudiante con las secciones elegidas.
 * @param {Array<number>} seccionesIds Lista de IDs de secciones
 */
export async function procesarMatricula(seccionesIds) {
  const respuesta = await consultarApi('/api/enrollment/matricular', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ secciones: seccionesIds })
  });

  if (!respuesta.ok) {
    const errorDatos = await respuesta.json();
    throw new Error(errorDatos.msg || 'Error al registrar la matrícula.');
  }
  return await respuesta.json();
}

/**
 * Devuelve la URL para descargar el PDF de la Ficha de Matrícula.
 * @param {number} idMatricula ID de la matrícula
 */
export function obtenerUrlFichaPdf(idMatricula) {
  return `${urlBaseApi}/api/enrollment/matricula/${idMatricula}/pdf`;
}
