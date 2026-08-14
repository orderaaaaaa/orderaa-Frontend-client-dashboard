import axios from 'axios';
import { toast } from 'react-toastify';

/** Fallback copy when the backend sends no message with a 403. */
const FORBIDDEN_FALLBACK_MESSAGE = 'ليس لديك صلاحية للقيام بهذا الإجراء';

function extractMessage(data: unknown): string | undefined {
  const message = (data as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return message.length ? message.join('\n') : undefined;
  return typeof message === 'string' && message.trim() ? message : undefined;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
  },
  paramsSerializer: (params) => {
    const parts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    });
    return parts.join('&');
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStorage = localStorage.getItem('auth-storage');

    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.token;

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {}
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      let hasValidToken = false;
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          hasValidToken = !!state?.token;
        }
      } catch {}

      if (!hasValidToken) return Promise.reject(error);

      localStorage.removeItem('auth-storage');
      window.location.href = '/signin';
      return Promise.reject(error);
    }

    // ABAC: the backend PermissionGuard answers 403 when the caller's roles
    // don't grant the endpoint. Surface it once, in Arabic, without touching
    // the 401 sign-out path above. Callers may still catch and handle it.
    if (
      error.response?.status === 403 &&
      !isAuthEndpoint &&
      typeof window !== 'undefined'
    ) {
      const message =
        extractMessage(error.response?.data) ?? FORBIDDEN_FALLBACK_MESSAGE;
      // Same toastId for identical copy → a burst of parallel denied requests
      // (a dashboard fanning out queries) shows one toast, not ten.
      toast.error(message, { toastId: `forbidden:${message}` });
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;
export default api;
