// Definición de las rutas del sistema habilitadas para cada rol de usuario (solo las interfaces implementadas)
export const rutasPorRol = {
  Estudiante: [
    "/estudiante/horario"
  ],
  Docente: [
    "/docente/horario"
  ],
  Administrador: [
    "/administrador/dashboard",
    "/administrador/mantenimiento",
    "/administrador/docentes",
    "/administrador/usuarios"
  ],
  Direccion: [
    "/direccion/dashboard",
    "/direccion/auditoria"
  ]
};
