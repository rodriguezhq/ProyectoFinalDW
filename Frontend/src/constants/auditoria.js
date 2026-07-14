// Vocabulario fijo de acciones auditables (definido en el backend por cada
// llamada a registrar_auditoria). No sale de los datos cargados porque no
// escala con el volumen del log ni debe variar según el filtro activo.
export const ACCIONES_AUDITORIA = [
  'login_exitoso',
  'login_fallido',
  'login_fallido_cuenta_inactiva',
  'crear_usuario',
  'actualizar_usuario',
  'guardar_horario_ciclo',
  'registrar_matricula',
  'confirmar_matricula_admin',
  'confirmar_pago_admin',
  'actualizar_nota',
  'validar_acta',
  'crear_periodo',
  'activar_periodo',
  'establecer_periodo_matricula',
  'solicitar_documento',
  'autorizar_documento',
  'emitir_documento'
];
