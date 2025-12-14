import axios from 'axios';

// HTTP Client class with interceptors
class Http {
  private baseURL: string;
  private instance: typeof axios | null = null;

  constructor(baseUrl: string) {
    this.baseURL = baseUrl;
  }

  private get http() {
    return this.instance != null ? this.instance : this.initHttp();
  }

  initHttp() {
    const http = axios.create({
      baseURL: this.baseURL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    // REQUEST INTERCEPTOR - Add auth token
    http.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const { state } = JSON.parse(authStorage);
              const token = state?.token;

              if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          } catch (error) {
            console.error('Error parsing auth storage:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // RESPONSE INTERCEPTOR - Handle errors
    http.interceptors.response.use(
      (response) => response,
      (error) => {
        return this.handleError(error);
      }
    );

    this.instance = http as typeof axios;
    return http;
  }

  private handleError(error: unknown): Promise<never> {
    const axiosError = error as { response?: { status: number } };
    if (axiosError.response) {
      const status = axiosError.response.status;

      switch (status) {
        case 401:
          // Handle unauthorized - could redirect to login
          if (typeof window !== 'undefined') {
            // Optionally redirect to login
            // window.location.href = '/signin';
          }
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    }

    return Promise.reject(error);
  }

  // Public HTTP methods
  get<T = unknown>(url: string, config?: object) {
    return this.http.get<T>(url, config);
  }

  post<T = unknown>(url: string, data?: unknown, config?: object) {
    return this.http.post<T>(url, data, config);
  }

  put<T = unknown>(url: string, data?: unknown, config?: object) {
    return this.http.put<T>(url, data, config);
  }

  patch<T = unknown>(url: string, data?: unknown, config?: object) {
    return this.http.patch<T>(url, data, config);
  }

  delete<T = unknown>(url: string, config?: object) {
    return this.http.delete<T>(url, config);
  }
}

// Create singleton instance
const http = new Http(process.env.NEXT_PUBLIC_API_URL || '');

export default http;
