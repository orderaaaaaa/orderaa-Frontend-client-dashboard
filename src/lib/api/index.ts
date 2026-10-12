import axios, { CanceledError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { refreshPermissions, syncPermissionsVersion } from './permissionsVersion';
import { API_ERROR_CODES } from './errorCodes';
import { isLegacyAccessToken, useAuthStore } from '@/store/authStore';
import { isUnexpired } from './accessToken';
import {
  CREDENTIAL_CHECK_ENDPOINTS,
  SESSION_ENDPOINTS,
  endPausedSession,
  endSession,
  handleRefreshFailure,
  needsProactiveRefresh,
  refreshSession,
} from './refresh';

function extractMessage(data: unknown): string | undefined {
  const message = (data as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(message)) return message.length ? message.join('\n') : undefined;
  return typeof message === 'string' && message.trim() ? message : undefined;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // `Accept-Language` is deliberately absent: it is stamped per request by the
  // interceptor below. Baking it in here would freeze whatever locale was
  // stored when this module first evaluated, so every request after a switch
  // would still ask the backend for the old language.
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

function bearerToken(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers?.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length);
}

function currentUserId(): number | null {
  return useAuthStore.getState().user?.id ?? null;
}

function isSessionEndpoint(url: string | undefined): boolean {
  return (
    url === SESSION_ENDPOINTS.SIGN_IN ||
    url === SESSION_ENDPOINTS.REFRESH ||
    url === SESSION_ENDPOINTS.LOGOUT
  );
}

api.interceptors.request.use(async (config) => {
  if (config.headers) {
    config.headers['Accept-Language'] = readStoredLocale();
  }

  if (typeof window === 'undefined' || config.headers.Authorization) return config;

  let token = useAuthStore.getState().token;

  if (token !== null && !isSessionEndpoint(config.url) && needsProactiveRefresh(token)) {
    const userIdBefore = currentUserId();
    try {
      token = await refreshSession(token);
    } catch (refreshError) {
      handleRefreshFailure(refreshError);
    }
    if (currentUserId() !== userIdBefore) {
      throw new CanceledError('session user changed');
    }
  }

  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    syncPermissionsVersion(api, response.headers['x-permissions-version']);
    return response;
  },
  async (error) => {
    const config = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 403 &&
      error.response?.data?.error === API_ERROR_CODES.MERCHANT_PAUSED &&
      config?.url !== SESSION_ENDPOINTS.SIGN_IN
    ) {
      await endPausedSession();
      return Promise.reject(error);
    }

    const isAuthEndpoint = config?.url?.startsWith('/auth/');

    if (
      error.response?.status === 401 &&
      config &&
      !isSessionEndpoint(config.url) &&
      useAuthStore.getState().user !== null
    ) {
      const usedToken = bearerToken(config);
      const isCredentialCheck = CREDENTIAL_CHECK_ENDPOINTS.includes(config.url ?? '');

      if (config._retried) {
        if (!isCredentialCheck) endSession();
        return Promise.reject(error);
      }

      if (isCredentialCheck && usedToken !== null && isUnexpired(usedToken)) {
        return Promise.reject(error);
      }

      if (isLegacyAccessToken(usedToken)) {
        useAuthStore.getState().dropLegacyToken();
      }

      const userIdBefore = currentUserId();
      let freshToken: string;
      try {
        freshToken = await refreshSession(usedToken);
      } catch (refreshError) {
        handleRefreshFailure(refreshError);
        return Promise.reject(error);
      }

      if (currentUserId() !== userIdBefore) {
        return Promise.reject(error);
      }

      config._retried = true;
      config.headers.Authorization = `Bearer ${freshToken}`;
      return api.request(config);
    }

    syncPermissionsVersion(api, error.response?.headers?.['x-permissions-version']);

    // ABAC: the backend PermissionGuard answers 403 when the caller's roles
    // don't grant the endpoint. Surface it once, in Arabic, without touching
    // the 401 sign-out path above. Callers may still catch and handle it.
    if (
      error.response?.status === 403 &&
      !isAuthEndpoint &&
      typeof window !== 'undefined'
    ) {
      const message =
        extractMessage(error.response?.data) ??
        // Only reached when the backend sends a bodyless 403; its own copy
        // already arrives in the locale the request asked for.
        translate(readStoredLocale(), 'common.errors.forbidden');
      // Same toastId for identical copy → a burst of parallel denied requests
      // (a dashboard fanning out queries) shows one toast, not ten.
      toast.error(message, { toastId: `forbidden:${message}` });
      refreshPermissions(api);
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;
export default api;
