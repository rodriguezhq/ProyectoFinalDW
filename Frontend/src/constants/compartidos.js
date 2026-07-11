// Opciones de menú mostradas en el panel lateral para cada rol de usuario
export const opcionesMenuRol = {
  Estudiante: [
    { icono: '🗓️', etiqueta: 'Horario de Clases', activo: true },
    { icono: '📝', etiqueta: 'Solicitar Matrícula' },
    { icono: '📥', etiqueta: 'Descargar Ficha' },
    { icono: '📊', etiqueta: 'Hoja de Notas' },
    { icono: '🎓', etiqueta: 'Récord Académico' },
    { icono: '📄', etiqueta: 'Solicitar Certificados' }
  ],
  Docente: [
    { icono: '🗓️', etiqueta: 'Horario de Clases', activo: true },
    { icono: '📚', etiqueta: 'Cursos Asignados' },
    { icono: '✍️', etiqueta: 'Registrar Notas' },
    { icono: '🔎', etiqueta: 'Notas Estudiante' },
    { icono: '🏫', etiqueta: 'Notas por Sección' }
  ],
  Administrador: [
    { icono: '📈', etiqueta: 'Dashboard de Control', activo: true },
    { icono: '🏫', etiqueta: 'Mantenimiento Académico' },
    { icono: '📝', etiqueta: 'Validar Matrículas' },
    { icono: '💵', etiqueta: 'Registrar Pagos' },
    { icono: '🗓️', etiqueta: 'Diseñar Horario' },
    { icono: '📊', etiqueta: 'Validar Actas' },
    { icono: '📄', etiqueta: 'Emitir Certificados (QR)' },
    { icono: '🛡️', etiqueta: 'Usuarios y Roles' }
  ],
  Direccion: [
    { icono: '📈', etiqueta: 'Dashboard Estratégico', activo: true },
    { icono: '📝', etiqueta: 'Estadísticas Matrícula' },
    { icono: '📚', etiqueta: 'Carga Docente' },
    { icono: '🎓', etiqueta: 'Desempeño Cohortes' },
    { icono: '📄', etiqueta: 'Autorizar Certificados' },
    { icono: '🛡️', etiqueta: 'Bitácora Auditoría' }
  ]
};
