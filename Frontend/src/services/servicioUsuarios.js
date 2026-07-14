import { consultarApi } from './clienteApi';

// Obtiene una página de usuarios del sistema, opcionalmente filtrada por rol
export async function obtenerUsuarios(page = 1, perPage = 10, rol = '', nombre = '', idFacultad = '', ciclo = '') {
  let url = `/api/admin/usuarios?page=${page}&per_page=${perPage}`;
  if (rol) url += `&rol=${encodeURIComponent(rol)}`;
  if (nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
  if (idFacultad) url += `&id_facultad=${encodeURIComponent(idFacultad)}`;
  if (ciclo) url += `&ciclo=${encodeURIComponent(ciclo)}`;
  const respuesta = await consultarApi(url, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar los usuarios');
  return respuesta.json();
}

// Catálogo completo de usuarios (para selects/combobox que necesitan verlos
// todos, no una página) — usa un per_page grande en vez de "sin límite"
export async function obtenerCatalogoUsuarios() {
  return obtenerUsuarios(1, 2000);
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
