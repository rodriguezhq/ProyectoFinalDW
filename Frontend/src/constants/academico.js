// Datos de los módulos académicos - 100% compatibles con las funcionalidades requeridas
export const datosModulos = [
  {
    id: "matricula",
    nombre: "Matrícula",
    icono: "📝",
    lema: "Gestión eficiente del ciclo de matrícula estudiantil.",
    roles: [
      { nombre: "Estudiante", tareas: ["Solicita matrícula en línea", "Descarga ficha de matrícula oficial"] },
      { nombre: "Administrador", tareas: ["Valida requisitos académicos", "Registra pagos de tasas de matrícula", "Genera la ficha oficial de matrícula"] },
      { nombre: "Dirección", tareas: ["Supervisa estadísticas generales e indicadores de matrícula"] }
    ]
  },
  {
    id: "cursos",
    nombre: "Cursos y Docentes",
    icono: "📚",
    lema: "Programación académica, sílabos y control de carga horaria.",
    roles: [
      { nombre: "Docente", tareas: ["Visualiza cursos asignados", "Carga y actualiza sílabos", "Registra notas en el sistema"] },
      { nombre: "Administrador", tareas: ["Asigna docentes a secciones", "Gestiona horarios y asignación de aulas"] },
      { nombre: "Dirección", tareas: ["Evalúa la carga docente institucional", "Supervisa el cumplimiento del plan de estudios"] }
    ]
  },
  {
    id: "notas",
    nombre: "Notas",
    icono: "📊",
    lema: "Registro y control del rendimiento académico estudiantil.",
    roles: [
      { nombre: "Docente", tareas: ["Registra notas parciales y finales"] },
      { nombre: "Estudiante", tareas: ["Consulta de forma transparente su hoja de notas por ciclo"] },
      { nombre: "Administrador", tareas: ["Valida actas promocionales", "Consolida las notas en el registro central"] },
      { nombre: "Dirección", tareas: ["Supervisa indicadores académicos (promedios, aprobados/desaprobados)"] }
    ]
  },
  {
    id: "record",
    nombre: "Récord Académico",
    icono: "🎓",
    lema: "Historial unificado y seguimiento de la trayectoria del alumno.",
    roles: [
      { nombre: "Estudiante", tareas: ["Accede a su historial académico completo en tiempo real"] },
      { nombre: "Administrador", tareas: ["Genera reportes consolidados (exportación a formato oficial)"] },
      { nombre: "Dirección", tareas: ["Analiza desempeño por cohorte, programa o especialidad"] }
    ]
  },
  {
    id: "certificados",
    nombre: "Certificados y Documentos",
    icono: "📄",
    lema: "Trámites en línea con firmas digitales y códigos QR de verificación.",
    roles: [
      { nombre: "Estudiante", tareas: ["Solicita certificados de estudio y constancias en línea"] },
      { nombre: "Administrador", tareas: ["Emite certificados oficiales con firma digital y código QR"] },
      { nombre: "Dirección", tareas: ["Autoriza la emisión de documentos oficiales"] }
    ]
  },
  {
    id: "seguridad",
    nombre: "Administración y Seguridad",
    icono: "🛡️",
    lema: "Control de accesos y auditoría de operaciones críticas.",
    roles: [
      { nombre: "Administrador", tareas: ["Define perfiles de acceso y roles (permisos del sistema)"] },
      { nombre: "Dirección", tareas: ["Controla auditorías y reportes estratégicos (bitácora)"] },
      { nombre: "Todos", tareas: ["Acceden al sistema según los permisos y roles asignados"] }
    ]
  }
];
