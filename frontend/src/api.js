import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function apiUrl(path) {
  return `${BASE_URL}${path}`;
}

export function getAccessToken() {
  return Cookies.get('access_token') || null;
}

export function getRefreshToken() {
  return Cookies.get('refresh_token') || null;
}

export function saveTokens(access, refresh) {
  Cookies.set('access_token', access, { expires: 1, sameSite: 'Lax' });
  Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'Lax' });
}

export function clearTokens() {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

async function tryRefreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(apiUrl('/api/users/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      saveTokens(data.access, data.refresh || refresh);
      return true;
    }
  } catch (err) {
    // Refresh failed
  }

  clearTokens();
  return false;
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, headers: customHeaders = {}, auth = true } = options;

  const headers = { ...customHeaders };

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(apiUrl(path), {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      response = await fetch(apiUrl(path), {
        method,
        headers,
        body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      });
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { ok: true, status: 204, data: null };
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Build error message from API response
    let errorMessage = '';
    if (data) {
      if (data.detail) {
        errorMessage = data.detail;
      } else if (typeof data === 'object') {
        // Handle field-level errors like {username: ["already exists"]}
        const messages = [];
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(', ')}`);
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          }
        }
        errorMessage = messages.join('; ') || 'An error occurred';
      }
    }

    const error = new Error(errorMessage || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { ok: true, status: response.status, data };
}
