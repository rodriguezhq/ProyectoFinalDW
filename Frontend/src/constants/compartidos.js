// Opciones de menú mostradas en el panel lateral para cada rol de usuario (solo las que tienen interfaces implementadas)
export const opcionesMenuRol = {
  Estudiante: [
    { icono: '🗓️', etiqueta: 'Horario de Clases', activo: true }
  ],
  Docente: [
    { icono: '🗓️', etiqueta: 'Horario de Clases', activo: true }
  ],
  Administrador: [
    { icono: '📈', etiqueta: 'Dashboard de Control', activo: true },
    { icono: '🏫', etiqueta: 'Mantenimiento Académico' },
    { icono: '🗓️', etiqueta: 'Diseñar Horario' },
    { icono: '🛡️', etiqueta: 'Usuarios y Roles' }
  ],
  Direccion: [
    { icono: '📈', etiqueta: 'Dashboard Estratégico', activo: true },
    { icono: '🛡️', etiqueta: 'Bitácora Auditoría' }
  ]
};
