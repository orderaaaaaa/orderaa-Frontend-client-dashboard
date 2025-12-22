import api from './index';

const http = {
  get<T = unknown>(url: string, config?: object) {
    return api.get<T>(url, config);
  },

  post<T = unknown>(url: string, data?: unknown, config?: object) {
    return api.post<T>(url, data, config);
  },

  put<T = unknown>(url: string, data?: unknown, config?: object) {
    return api.put<T>(url, data, config);
  },

  patch<T = unknown>(url: string, data?: unknown, config?: object) {
    return api.patch<T>(url, data, config);
  },

  delete<T = unknown>(url: string, config?: object) {
    return api.delete<T>(url, config);
  },
};

export default http;
