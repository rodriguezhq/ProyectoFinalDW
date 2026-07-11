import { consultarApi } from './clienteApi';

export async function obtenerPeriodosDocente() {
  // Obtiene la lista de periodos academicos en los que el docente tiene carga
  const respuesta = await consultarApi('/api/courses/mis-periodos', { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error('Error al cargar los periodos académicos del docente');
  }
  const datos = await respuesta.json();
  return datos.periodos || [];
}

export async function obtenerCursosDocentePorPeriodo(idPeriodo) {
  // Obtiene los cursos asignados al docente para un periodo especifico
  let url_api = '/api/courses/mis-secciones';
  if (idPeriodo) {
    url_api += `?id_periodo=${idPeriodo}`;
  }
  const respuesta = await consultarApi(url_api, { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error('Error al cargar las asignaturas del docente');
  }
  const datos = await respuesta.json();
  return datos.secciones || [];
}

export async function obtenerDetalleCursoDocente(idCurso, idPeriodo) {
  // Obtiene la informacion detallada de un curso y su silabo
  const respuesta = await consultarApi(`/api/courses/cursos/${idCurso}/detalle?id_periodo=${idPeriodo}`, { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error('Error al cargar el detalle de la asignatura');
  }
  return await respuesta.json();
}

export async function obtenerEstudiantesCursoDocente(idCurso, idPeriodo) {
  // Obtiene la nomina de estudiantes y sus calificaciones para un curso y periodo especifico
  const respuesta = await consultarApi(`/api/courses/cursos/${idCurso}/estudiantes?id_periodo=${idPeriodo}`, { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error('Error al cargar los estudiantes de la asignatura');
  }
  const datos = await respuesta.json();
  return datos.notas || [];
}

export async function subirSilaboCurso(idCurso, archivo) {
  // Sube el archivo de silabo (PDF) para el curso correspondiente
  const datosFormulario = new FormData();
  datosFormulario.append('archivo', archivo);

  const respuesta = await consultarApi(`/api/courses/cursos/${idCurso}/silabo`, {
    method: 'POST',
    body: datosFormulario
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al subir el archivo de sílabo');
  }

  return await respuesta.json();
}
