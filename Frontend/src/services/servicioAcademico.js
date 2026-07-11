import { consultarApi } from './clienteApi';

// ==========================================
// SERVICIOS DE FACULTADES
// ==========================================

export async function obtenerFacultades() {
  const respuesta = await consultarApi('/api/courses/facultades', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar las facultades');
  return respuesta.json();
}

export async function guardarFacultad(datos) {
  const respuesta = await consultarApi('/api/courses/facultades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al guardar la facultad.');
  }
  return respuesta.json();
}

export async function actualizarFacultad(id, datos) {
  const respuesta = await consultarApi(`/api/courses/facultades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al actualizar la facultad.');
  }
  return respuesta.json();
}

export async function eliminarFacultad(id) {
  const respuesta = await consultarApi(`/api/courses/facultades/${id}`, { method: 'DELETE' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al eliminar la facultad.');
  }
  return respuesta.json();
}

// ==========================================
// SERVICIOS DE ESPECIALIDADES / CARRERAS
// ==========================================

export async function obtenerEspecialidades() {
  const respuesta = await consultarApi('/api/courses/especialidades', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar las especialidades');
  return respuesta.json();
}

export async function guardarEspecialidad(datos) {
  const respuesta = await consultarApi('/api/courses/especialidades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al guardar la especialidad.');
  }
  return respuesta.json();
}

export async function actualizarEspecialidad(id, datos) {
  const respuesta = await consultarApi(`/api/courses/especialidades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al actualizar la especialidad.');
  }
  return respuesta.json();
}

export async function eliminarEspecialidad(id) {
  const respuesta = await consultarApi(`/api/courses/especialidades/${id}`, { method: 'DELETE' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al eliminar la especialidad.');
  }
  return respuesta.json();
}

// ==========================================
// SERVICIOS DE CURSOS
// ==========================================

export async function obtenerCursos() {
  const respuesta = await consultarApi('/api/courses/cursos', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar los cursos');
  return respuesta.json();
}

export async function guardarCurso(datos) {
  const respuesta = await consultarApi('/api/courses/cursos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al guardar el curso.');
  }
  return respuesta.json();
}

export async function actualizarCurso(id, datos) {
  const respuesta = await consultarApi(`/api/courses/cursos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al actualizar el curso.');
  }
  return respuesta.json();
}

export async function eliminarCurso(id) {
  const respuesta = await consultarApi(`/api/courses/cursos/${id}`, { method: 'DELETE' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al eliminar el curso.');
  }
  return respuesta.json();
}

// ==========================================
// SERVICIOS DE PERIODOS ACADÉMICOS
// ==========================================

export async function obtenerPeriodos() {
  const respuesta = await consultarApi('/api/admin/periodos', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar los periodos académicos');
  return respuesta.json();
}

export async function guardarPeriodo(datos) {
  const respuesta = await consultarApi('/api/admin/periodos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al crear el periodo académico.');
  }
  return respuesta.json();
}

export async function activarPeriodo(id) {
  const respuesta = await consultarApi(`/api/admin/periodos/${id}/activar`, { method: 'POST' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al activar el periodo académico.');
  }
  return respuesta.json();
}
