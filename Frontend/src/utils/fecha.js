// El backend guarda y devuelve fechas en UTC pero SIN marca de zona horaria
// (ni "Z" ni "+00:00"). El navegador, al ver un string asi, lo interpreta
// como si ya fuera hora local -> todo se ve ~5 horas adelantado respecto a
// la hora real de Peru. Estas funciones agregan la "Z" antes de parsear, asi
// el navegador convierte correctamente a la zona horaria local.

function normalizarUTC(fechaTexto) {
  if (!fechaTexto) return null;
  const yaTieneZona = /Z$|[+-]\d{2}:?\d{2}$/.test(fechaTexto);
  const iso = fechaTexto.includes(' ') ? fechaTexto.replace(' ', 'T') : fechaTexto;
  const fecha = new Date(yaTieneZona ? iso : `${iso}Z`);
  return isNaN(fecha.getTime()) ? null : fecha;
}

export function fechaUTCaDate(fechaTexto) {
  return normalizarUTC(fechaTexto);
}

export function formatearFecha(fechaTexto, opciones) {
  const fecha = normalizarUTC(fechaTexto);
  return fecha ? fecha.toLocaleDateString('es-PE', opciones) : '-';
}

export function formatearFechaHora(fechaTexto, opciones) {
  const fecha = normalizarUTC(fechaTexto);
  return fecha ? fecha.toLocaleString('es-PE', opciones) : '-';
}
