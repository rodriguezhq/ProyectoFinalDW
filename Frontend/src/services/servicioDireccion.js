import { consultarApi } from './clienteApi';

// Obtiene la bitácora de auditoría con filtros opcionales de acción y usuario
export async function obtenerAuditoria(accion = '', idUsuario = '') {
  let url = '/api/admin/auditoria';
  const parametros = [];
  if (accion) parametros.push(`accion=${accion}`);
  if (idUsuario) parametros.push(`id_usuario=${idUsuario}`);
  
  if (parametros.length > 0) {
    url += `?${parametros.join('&')}`;
  }

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar la bitácora de auditoría');
  return respuesta.json();
}

// Obtiene el desempeño académico por cohorte filtrado opcionalmente por especialidad
export async function obtenerDesempenoCohortes(idEspecialidad = '') {
  let url = '/api/records/desempeno';
  if (idEspecialidad) url += `?id_especialidad=${idEspecialidad}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar el desempeño por cohorte');
  return respuesta.json();
}

// Obtiene el consolidado de alumnos por especialidad
export async function obtenerConsolidadoEspecialidad(idEspecialidad = '') {
  let url = '/api/records/consolidado';
  if (idEspecialidad) url += `?id_especialidad=${idEspecialidad}`;

  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar el reporte consolidado de especialidad');
  return respuesta.json();
}

