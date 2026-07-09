// Nombres de rol tal cual los devuelve el backend (Usuario.rol.nombre).
// Única fuente de verdad: evita strings sueltos repetidos en guards y rutas.
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
  DIRECCION: 'Direccion',
};

// Mapa de redirección según el ROL (string, estable) del backend — NUNCA por
// id_rol (es un autoincremental de MySQL, cambia según el orden de inserción
// y no hay forma de predecirlo desde el frontend).
export const ROLE_ROUTES = {
  [ROLES.ADMINISTRADOR]: '/admin',
  [ROLES.DOCENTE]: '/docente',
  [ROLES.ESTUDIANTE]: '/estudiante',
  [ROLES.DIRECCION]: '/direccion',
};
