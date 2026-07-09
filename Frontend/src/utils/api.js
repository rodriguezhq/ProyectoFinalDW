import { toast } from 'sonner';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

export async function apiFetch(endpoint, options = {}) {
  // Ensure credentials: 'include' is always set for cookie transmission
  options.credentials = 'include';
  options.headers = options.headers || {};

  const method = options.method || 'GET';
  const isMutative = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());

  // Attach CSRF token if it's a mutative request
  if (isMutative) {
    const csrfAccessToken = getCookie('csrf_access_token');
    if (csrfAccessToken) {
      options.headers['X-CSRF-TOKEN'] = csrfAccessToken;
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;

  const response = await fetch(url, options);

  // If 401 Unauthorized, we attempt to refresh the token
  if (response.status === 401 && !options._retry && !endpoint.includes('/api/auth/refresh')) {
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(async () => {
          options._retry = true;
          if (isMutative) {
            const freshCsrf = getCookie('csrf_access_token');
            if (freshCsrf) {
              options.headers['X-CSRF-TOKEN'] = freshCsrf;
            }
          }
          resolve(await apiFetch(endpoint, options));
        });
      });
    }

    isRefreshing = true;
    options._retry = true;

    try {
      const csrfRefreshToken = getCookie('csrf_refresh_token');
      const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': csrfRefreshToken || ''
        }
      });

      if (refreshResponse.ok) {
        isRefreshing = false;
        onRefreshed();
        
        // Retry the original request with fresh credentials
        if (isMutative) {
          const freshCsrf = getCookie('csrf_access_token');
          if (freshCsrf) {
            options.headers['X-CSRF-TOKEN'] = freshCsrf;
          }
        }
        return await fetch(url, options);
      } else {
        // Refresh token expired or invalid - clear session
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('user');
        toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        throw new Error("Sesión expirada");
      }
    } catch (refreshErr) {
      isRefreshing = false;
      refreshSubscribers = [];
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw refreshErr;
    }
  }

  return response;
}
