import { consultarApi } from './clienteApi';

// Obtiene todas las actas de notas del periodo académico especificado
export async function obtenerActasPeriodo(idPeriodo) {
    if (!idPeriodo) throw new Error('El periodo académico es requerido.');
    const respuesta = await consultarApi(`/api/grades/actas?id_periodo=${idPeriodo}`, { method: 'GET' });
    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.msg || 'Error al obtener las actas del periodo académico.');
    }
    return respuesta.json();
}

// Obtiene el listado detallado de estudiantes y sus notas para una clase (sección + curso)
export async function obtenerDetalleActa(idSeccion, idCurso) {
    if (!idSeccion || !idCurso) throw new Error('Sección y Curso son requeridos.');
    const respuesta = await consultarApi(`/api/grades/actas/seccion/${idSeccion}/curso/${idCurso}`, { method: 'GET' });
    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.msg || 'Error al obtener el detalle de la sección.');
    }
    return respuesta.json();
}

// Valida y consolida (cierra) oficialmente las notas de un acta
export async function validarActa(idSeccion, idCurso) {
    if (!idSeccion || !idCurso) throw new Error('Sección y Curso son requeridos.');
    const respuesta = await consultarApi(`/api/grades/actas/seccion/${idSeccion}/curso/${idCurso}/validar`, { method: 'POST' });
    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.msg || 'Error al validar y consolidar el acta de la sección.');
    }
    return respuesta.json();
}
