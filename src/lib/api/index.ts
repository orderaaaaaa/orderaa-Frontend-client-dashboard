import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': 'ar',
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
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;
export default api;
