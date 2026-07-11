import { toast } from 'sonner';

const urlBaseApi = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Obtiene el valor de una cookie por su nombre
function obtenerCookie(nombre) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nombre}=`);
  if (partes.length === 2) return partes.pop().split(';').shift();
  return null;
}

let estaRefrescando = false;
let suscriptoresRefresco = [];

// Registra un suscriptor para ser notificado cuando el token se refresque
function suscribirRefrescoToken(callback) {
  suscriptoresRefresco.push(callback);
}

// Llama a todos los suscriptores una vez completado el refresco
function alRefrescar() {
  suscriptoresRefresco.forEach((callback) => callback());
  suscriptoresRefresco = [];
}

// Función principal para realizar peticiones HTTP a la API
export async function consultarApi(ruta, opciones = {}) {
  // Asegurar que las credenciales estén incluidas para la transmisión de cookies
  opciones.credentials = 'include';
  opciones.headers = opciones.headers || {};

  const metodo = opciones.method || 'GET';
  const esMutativo = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(metodo.toUpperCase());

  // Adjuntar el token CSRF si la petición modifica datos en el servidor
  if (esMutativo) {
    const tokenAccesoCsrf = obtenerCookie('csrf_access_token');
    if (tokenAccesoCsrf) {
      opciones.headers['X-CSRF-TOKEN'] = tokenAccesoCsrf;
    }
  }

  const url = ruta.startsWith('http') ? ruta : `${urlBaseApi}${ruta}`;

  const respuesta = await fetch(url, opciones);

  // Si no está autorizado (401), se intenta refrescar el token de forma transparente
  if (respuesta.status === 401 && !opciones._reintento && !ruta.includes('/api/auth/refresh')) {
    if (estaRefrescando) {
      return new Promise((resolver) => {
        suscribirRefrescoToken(async () => {
          opciones._reintento = true;
          if (esMutativo) {
            const csrfFresco = obtenerCookie('csrf_access_token');
            if (csrfFresco) {
              opciones.headers['X-CSRF-TOKEN'] = csrfFresco;
            }
          }
          resolver(await consultarApi(ruta, opciones));
        });
      });
    }

    estaRefrescando = true;
    opciones._reintento = true;

    try {
      const tokenRefrescoCsrf = obtenerCookie('csrf_refresh_token');
      const respuestaRefresco = await fetch(`${urlBaseApi}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': tokenRefrescoCsrf || ''
        }
      });

      if (respuestaRefresco.ok) {
        estaRefrescando = false;
        alRefrescar();
        
        // Reintentar la petición original con credenciales frescas
        if (esMutativo) {
          const csrfFresco = obtenerCookie('csrf_access_token');
          if (csrfFresco) {
            opciones.headers['X-CSRF-TOKEN'] = csrfFresco;
          }
        }
        return await fetch(url, opciones);
      } else {
        // El token de refresco ha expirado o no es válido - limpiar sesión
        estaRefrescando = false;
        suscriptoresRefresco = [];
        localStorage.removeItem('user');
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        throw new Error("Sesión expirada");
      }
    } catch (errorRefresco) {
      estaRefrescando = false;
      suscriptoresRefresco = [];
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw errorRefresco;
    }
  }

  return respuesta;
}
