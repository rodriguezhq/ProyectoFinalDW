import { consultarApi } from './clienteApi';

export async function obtenerSeccionesDocente() {
  const respuesta = await consultarApi('/api/courses/mis-secciones', { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error('Error al cargar las secciones del docente');
  }
  const datos = await respuesta.json();
  return datos.secciones || [];
}

export async function obtenerNotasCurso(idCurso) {
  const respuesta = await consultarApi(`/api/grades/curso/${idCurso}`, { method: 'GET' });
  if (!respuesta.ok) {
    throw new Error('Error al cargar las notas del curso');
  }
  const datos = await respuesta.json();
  return datos.notas || [];
}

export async function registrarNotas(idMatriculaDetalle, notas) {
  const respuesta = await consultarApi(`/api/grades/${idMatriculaDetalle}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        parcial1: notas.parcial1 !== '' && notas.parcial1 !== null ? parseFloat(notas.parcial1) : null,
        parcial2: notas.parcial2 !== '' && notas.parcial2 !== null ? parseFloat(notas.parcial2) : null,
        final: notas.final !== '' && notas.final !== null ? parseFloat(notas.final) : null,
        sustitutorio: notas.sustitutorio !== '' && notas.sustitutorio !== null ? parseFloat(notas.sustitutorio) : null
    })
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al registrar las notas');
  }
  
  return respuesta.json();
}
