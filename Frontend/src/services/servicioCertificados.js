import { consultarApi } from './clienteApi';

const urlBaseApi = import.meta.env.VITE_API_BASE_URL || '';

// ==========================================
// SERVICIOS DE CERTIFICADOS Y DOCUMENTOS
// ==========================================

export async function solicitarDocumento(tipoDocumento) {
  const respuesta = await consultarApi('/api/certificates/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo_documento: tipoDocumento })
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al solicitar el documento.');
  }
  return respuesta.json();
}

export async function obtenerMisDocumentos(page = 1, perPage = 10) {
  const respuesta = await consultarApi(`/api/certificates/mis-documentos?page=${page}&per_page=${perPage}`, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar tus documentos.');
  return respuesta.json();
}

export async function obtenerTodosLosDocumentos(page = 1, perPage = 10) {
  const respuesta = await consultarApi(`/api/certificates/?page=${page}&per_page=${perPage}`, { method: 'GET' });
  if (!respuesta.ok) throw new Error('Error al cargar los documentos.');
  return respuesta.json();
}

export async function autorizarDocumento(idDocumento) {
  const respuesta = await consultarApi(`/api/certificates/${idDocumento}/autorizar`, { method: 'POST' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al autorizar el documento.');
  }
  return respuesta.json();
}

export function urlPdfDocumento(idDocumento) {
  return `${urlBaseApi}/api/certificates/${idDocumento}/pdf`;
}

// Endpoint publico (sin login) para la pagina de verificacion que abre el QR
export async function verificarDocumento(codigoQr) {
  const respuesta = await fetch(`${urlBaseApi}/api/certificates/verificar/${codigoQr}`);
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Documento no encontrado.');
  }
  return respuesta.json();
}

export async function emitirDocumento(idDocumento) {
  const respuesta = await consultarApi(`/api/certificates/${idDocumento}/emitir`, { method: 'POST' });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.msg || 'Error al emitir el documento.');
  }
  return respuesta.json();
}
