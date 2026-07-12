import { consultarApi } from './clienteApi';

/**
 * Obtiene la lista de todas las matrículas del sistema con filtros opcionales.
 * @param {number} [idPeriodo] 
 * @param {string} [estado] 
 */
export async function listarMatriculasAdmin(idPeriodo, estado) {
    let url = '/api/enrollment/';
    const parametros = [];
    if (idPeriodo) parametros.push(`id_periodo=${idPeriodo}`);
    if (estado) parametros.push(`estado=${estado}`);
    if (parametros.length > 0) {
        url += '?' + parametros.join('&');
    }
    const respuesta = await consultarApi(url, { method: 'GET' });
    if (!respuesta.ok) {
        const errorDatos = await respuesta.json();
        throw new Error(errorDatos.msg || 'Error al listar matrículas.');
    }
    return await respuesta.json();
}

/**
 * Obtiene la información detallada de una matrícula específica.
 * @param {number} idMatricula 
 */
export async function obtenerMatriculaAdmin(idMatricula) {
    const respuesta = await consultarApi(`/api/enrollment/${idMatricula}/detalle`, { method: 'GET' });
    if (!respuesta.ok) {
        const errorDatos = await respuesta.json();
        throw new Error(errorDatos.msg || 'Error al obtener detalle de la matrícula.');
    }
    return await respuesta.json();
}

/**
 * Registra la validación de la matrícula y opcionalmente asocia el pago de forma transaccional.
 * @param {number} idMatricula 
 * @param {object} payload 
 */
export async function confirmarMatriculaAdmin(idMatricula, payload) {
    const respuesta = await consultarApi(`/api/enrollment/${idMatricula}/confirmar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!respuesta.ok) {
        const errorDatos = await respuesta.json();
        throw new Error(errorDatos.msg || 'Error al confirmar matrícula.');
    }
    return await respuesta.json();
}
