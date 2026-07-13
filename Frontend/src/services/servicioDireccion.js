import { consultarApi } from './clienteApi';

// Obtiene la bitácora de auditoría con filtros opcionales de acción y usuario, paginada
export async function obtenerAuditoria(accion = '', idUsuario = '', page = 1, perPage = 50) {
  let url = '/api/admin/auditoria';
  const parametros = [`page=${page}`, `per_page=${perPage}`];
  if (accion) parametros.push(`accion=${accion}`);
  if (idUsuario) parametros.push(`id_usuario=${idUsuario}`);
  url += `?${parametros.join('&')}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar la bitácora de auditoría');
  return respuesta.json();
}

// Obtiene el desempeño académico por cohorte filtrado opcionalmente por especialidad, paginado
export async function obtenerDesempenoCohortes(idEspecialidad = '', page = 1, perPage = 10) {
  let url = `/api/records/desempeno?page=${page}&per_page=${perPage}`;
  if (idEspecialidad) url += `&id_especialidad=${idEspecialidad}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar el desempeño por cohorte');
  return respuesta.json();
}

// Obtiene el consolidado de alumnos por especialidad, paginado
export async function obtenerConsolidadoEspecialidad(idEspecialidad = '', page = 1, perPage = 10) {
  let url = `/api/records/consolidado?page=${page}&per_page=${perPage}`;
  if (idEspecialidad) url += `&id_especialidad=${idEspecialidad}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar el reporte consolidado de especialidad');
  return respuesta.json();
}

// Exporta el consolidado de alumnos por especialidad en formato CSV o PDF
export async function exportarConsolidadoEspecialidadApi(idEspecialidad = '', formato = 'csv') {
  let url = `/api/records/consolidado/export?formato=${formato}`;
  if (idEspecialidad) url += `&id_especialidad=${idEspecialidad}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al exportar el consolidado académico');
  return respuesta.blob();
}

// Exporta el desempeño académico por cohorte en formato CSV o PDF
export async function exportarDesempenoCohortesApi(idEspecialidad = '', formato = 'csv') {
  let url = `/api/records/desempeno/export?formato=${formato}`;
  if (idEspecialidad) url += `&id_especialidad=${idEspecialidad}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al exportar el desempeño por cohorte');
  return respuesta.blob();
}


