import axios, { isAxiosError } from 'axios';
import { readStoredLocale } from '@/i18n/locale';
import { isLegacyAccessToken, useAuthStore, type User } from '@/store/authStore';
import { isUnexpired, msUntilExpiry } from './accessToken';
import { API_ERROR_CODES } from './errorCodes';

export const PRINCIPAL = {
  MERCHANT: 'MERCHANT',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
} as const;

export type Principal = (typeof PRINCIPAL)[keyof typeof PRINCIPAL];

export const SESSION_ENDPOINTS = {
  SIGN_IN: '/auth/signin',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
} as const;

export const CREDENTIAL_CHECK_ENDPOINTS: readonly string[] = ['/auth/change-password'];

export const REFRESH_FAILURE = {
  INVALID: 'invalid',
  PAUSED: 'paused',
  UNAVAILABLE: 'unavailable',
} as const;

export type RefreshFailureKind = (typeof REFRESH_FAILURE)[keyof typeof REFRESH_FAILURE];

export class RefreshFailure extends Error {
  constructor(
    readonly kind: RefreshFailureKind,
    readonly cause?: unknown,
  ) {
    super(`refresh ${kind}`);
    this.name = 'RefreshFailure';
  }
}

export interface RefreshResponse {
  access_token: string;
  expires_in: number;
  userId: number;
}

const AUTH_BROADCAST = {
  TOKEN: 'token',
  SIGNIN: 'signin',
  SIGNOUT: 'signout',
} as const;

type AuthBroadcast =
  | { type: typeof AUTH_BROADCAST.TOKEN; token: string; userId: number }
  | { type: typeof AUTH_BROADCAST.SIGNIN; userId: number }
  | { type: typeof AUTH_BROADCAST.SIGNOUT };

const REFRESH_LOCK_NAME = 'orderaa-auth-refresh';
const AUTH_CHANNEL_NAME = 'orderaa-auth';
const LOCK_TIMEOUT_MS = 10_000;
const NETWORK_RETRY_DELAY_MS = 2_000;
export const PROACTIVE_REFRESH_WINDOW_MS = 30_000;

export const ROUTES = {
  SIGN_IN: '/signin',
  PAUSED: '/paused',
} as const;

const sessionClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

sessionClient.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = readStoredLocale();
  return config;
});

let channel: BroadcastChannel | null | undefined;

function authChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel;
  channel =
    typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(AUTH_CHANNEL_NAME)
      : null;
  return channel;
}

function broadcast(message: AuthBroadcast): void {
  try {
    authChannel()?.postMessage(message);
  } catch {}
}

function isAuthBroadcast(value: unknown): value is AuthBroadcast {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as { type?: unknown; token?: unknown; userId?: unknown };
  if (message.type === AUTH_BROADCAST.SIGNOUT) return true;
  if (message.type === AUTH_BROADCAST.SIGNIN) return typeof message.userId === 'number';
  if (message.type === AUTH_BROADCAST.TOKEN) {
    return typeof message.token === 'string' && typeof message.userId === 'number';
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lockTimeoutSignal(): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(LOCK_TIMEOUT_MS);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), LOCK_TIMEOUT_MS);
  return controller.signal;
}

async function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks) return task();
  let granted = false;
  try {
    return await locks.request(REFRESH_LOCK_NAME, { signal: lockTimeoutSignal() }, () => {
      granted = true;
      return task();
    });
  } catch (error) {
    if (granted) throw error;
    return task();
  }
}

function adoptableToken(usedToken: string | null): string | null {
  const current = useAuthStore.getState().token;
  if (current === null || current === usedToken) return null;
  if (isLegacyAccessToken(current)) return null;
  return isUnexpired(current) ? current : null;
}

function classifyRefreshError(error: unknown): RefreshFailure {
  if (!isAxiosError(error) || !error.response) {
    return new RefreshFailure(REFRESH_FAILURE.UNAVAILABLE, error);
  }
  const { status, data } = error.response;
  const code = (data as { error?: unknown } | undefined)?.error;
  if (status === 403 && code === API_ERROR_CODES.MERCHANT_PAUSED) {
    return new RefreshFailure(REFRESH_FAILURE.PAUSED, error);
  }
  if (status === 429 || status >= 500) {
    return new RefreshFailure(REFRESH_FAILURE.UNAVAILABLE, error);
  }
  return new RefreshFailure(REFRESH_FAILURE.INVALID, error);
}

async function postRefresh(): Promise<RefreshResponse> {
  try {
    const { data } = await sessionClient.post<RefreshResponse>(SESSION_ENDPOINTS.REFRESH, {
      principal: PRINCIPAL.MERCHANT,
    });
    return data;
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      await sleep(NETWORK_RETRY_DELAY_MS);
      const { data } = await sessionClient.post<RefreshResponse>(SESSION_ENDPOINTS.REFRESH, {
        principal: PRINCIPAL.MERCHANT,
      });
      return data;
    }
    throw error;
  }
}

async function fetchUserWithToken(token: string): Promise<User> {
  const { data } = await sessionClient.get<User>(SESSION_ENDPOINTS.ME, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: false,
  });
  return data;
}

async function applyToken(token: string, userId: number): Promise<void> {
  const { user, setToken, setSession, dropLegacyToken } = useAuthStore.getState();
  if (user !== null && user.id === userId) {
    dropLegacyToken();
    setToken(token);
    return;
  }
  const freshUser = await fetchUserWithToken(token);
  setSession(token, freshUser);
}

async function refreshFromServer(usedToken: string | null): Promise<string> {
  const early = adoptableToken(usedToken);
  if (early !== null) return early;
  return withRefreshLock(async () => {
    const adopted = adoptableToken(usedToken);
    if (adopted !== null) return adopted;
    let response: RefreshResponse;
    try {
      response = await postRefresh();
    } catch (error) {
      throw classifyRefreshError(error);
    }
    try {
      await applyToken(response.access_token, response.userId);
    } catch (error) {
      throw new RefreshFailure(REFRESH_FAILURE.UNAVAILABLE, error);
    }
    broadcast({ type: AUTH_BROADCAST.TOKEN, token: response.access_token, userId: response.userId });
    return response.access_token;
  });
}

let inFlight: Promise<string> | null = null;

export function refreshSession(usedToken: string | null = useAuthStore.getState().token): Promise<string> {
  if (inFlight) return inFlight;
  const run = refreshFromServer(usedToken).finally(() => {
    inFlight = null;
  });
  inFlight = run;
  return run;
}

export function needsProactiveRefresh(token: string): boolean {
  if (isLegacyAccessToken(token)) return false;
  const remaining = msUntilExpiry(token);
  return remaining !== null && remaining < PROACTIVE_REFRESH_WINDOW_MS;
}

export async function logoutSession(): Promise<void> {
  try {
    await sessionClient.post(SESSION_ENDPOINTS.LOGOUT, { principal: PRINCIPAL.MERCHANT });
  } catch {}
}

let redirecting = false;

function navigate(path: string): void {
  if (typeof window === 'undefined' || redirecting) return;
  if (window.location.pathname === path) return;
  redirecting = true;
  window.location.href = path;
}

export function clearLocalSession(): void {
  useAuthStore.getState().logout();
}

export function endSession(): void {
  clearLocalSession();
  broadcast({ type: AUTH_BROADCAST.SIGNOUT });
  navigate(ROUTES.SIGN_IN);
}

let pausedHandled = false;

export async function endPausedSession(): Promise<void> {
  if (pausedHandled) return;
  pausedHandled = true;
  clearLocalSession();
  await logoutSession();
  navigate(ROUTES.PAUSED);
}

export function handleRefreshFailure(error: unknown): void {
  if (!(error instanceof RefreshFailure)) return;
  if (error.kind === REFRESH_FAILURE.INVALID) endSession();
  if (error.kind === REFRESH_FAILURE.PAUSED) void endPausedSession();
}

export async function signOut(): Promise<void> {
  await logoutSession();
  clearLocalSession();
  broadcast({ type: AUTH_BROADCAST.SIGNOUT });
}

export function announceSignIn(userId: number): void {
  broadcast({ type: AUTH_BROADCAST.SIGNIN, userId });
}

export const BOOTSTRAP_RESULT = {
  READY: 'ready',
  SIGNED_OUT: 'signed-out',
  PAUSED: 'paused',
  UNAVAILABLE: 'unavailable',
} as const;

export type BootstrapResult = (typeof BOOTSTRAP_RESULT)[keyof typeof BOOTSTRAP_RESULT];

export async function bootstrapSession(): Promise<BootstrapResult> {
  const { user, token } = useAuthStore.getState();
  if (user === null || token !== null) return BOOTSTRAP_RESULT.READY;
  try {
    await refreshSession(null);
    return BOOTSTRAP_RESULT.READY;
  } catch (error) {
    if (error instanceof RefreshFailure && error.kind === REFRESH_FAILURE.INVALID) {
      clearLocalSession();
      return BOOTSTRAP_RESULT.SIGNED_OUT;
    }
    if (error instanceof RefreshFailure && error.kind === REFRESH_FAILURE.PAUSED) {
      await endPausedSession();
      return BOOTSTRAP_RESULT.PAUSED;
    }
    return BOOTSTRAP_RESULT.UNAVAILABLE;
  }
}

async function followSignInElsewhere(): Promise<void> {
  const { token } = useAuthStore.getState();
  try {
    await refreshSession(token);
  } catch (error) {
    handleRefreshFailure(error);
  }
}

function onBroadcast(message: AuthBroadcast): void {
  const { user, token } = useAuthStore.getState();
  if (message.type === AUTH_BROADCAST.SIGNOUT) {
    if (user === null && token === null) return;
    clearLocalSession();
    navigate(ROUTES.SIGN_IN);
    return;
  }
  if (message.type === AUTH_BROADCAST.SIGNIN) {
    void followSignInElsewhere();
    return;
  }
  if (message.token === token || !isUnexpired(message.token)) return;
  if (user === null) return;
  void applyToken(message.token, message.userId).catch(() => {});
}

export function subscribeAuthBroadcast(): () => void {
  const source = authChannel();
  if (source === null) return () => {};
  const listener = (event: MessageEvent<unknown>) => {
    if (isAuthBroadcast(event.data)) onBroadcast(event.data);
  };
  source.addEventListener('message', listener);
  return () => source.removeEventListener('message', listener);
}
