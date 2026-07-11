// Definición de las rutas del sistema habilitadas para cada rol de usuario
export const rutasPorRol = {
  Estudiante: [
    "/estudiante/horario",
    "/estudiante/matricula",
    "/estudiante/ficha",
    "/estudiante/notas",
    "/estudiante/record",
    "/estudiante/certificados"
  ],
  Docente: [
    "/docente/horario",
    "/docente/cursos",
    "/docente/notas-registrar",
    "/docente/notas-estudiante",
    "/docente/notas-seccion"
  ],
  Administrador: [
    "/administrador/dashboard",
    "/administrador/mantenimiento",
    "/administrador/matriculas",
    "/administrador/pagos",
    "/administrador/docentes",
    "/administrador/actas",
    "/administrador/certificados",
    "/administrador/usuarios"
  ],
  Direccion: [
    "/direccion/dashboard",
    "/direccion/matriculas",
    "/direccion/docentes",
    "/direccion/cohortes",
    "/direccion/certificados",
    "/direccion/auditoria"
  ]
};
