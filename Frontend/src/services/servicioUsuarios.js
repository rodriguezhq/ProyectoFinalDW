import { consultarApi } from './clienteApi';

// Obtiene la lista de usuarios del sistema
export async function obtenerUsuarios() {
  const respuesta = await consultarApi('/api/admin/usuarios', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar los usuarios');
  return respuesta.json();
}

// Crea un nuevo usuario en el sistema
export async function guardarUsuario(datos) {
  const respuesta = await consultarApi('/api/admin/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al crear el usuario.');
  }
  return respuesta.json();
}

// Actualiza un usuario existente
export async function actualizarUsuario(id, datos) {
  const respuesta = await consultarApi(`/api/admin/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al actualizar el usuario.');
  }
  return respuesta.json();
}

// Obtiene la lista de roles del sistema
export async function obtenerRoles() {
  const respuesta = await consultarApi('/api/admin/roles', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar los roles de usuario');
  return respuesta.json();
}

// Obtiene la lista de docentes
export async function obtenerDocentes() {
  const respuesta = await consultarApi('/api/admin/docentes', { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar la lista de docentes');
  return respuesta.json();
}
