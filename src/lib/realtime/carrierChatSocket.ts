'use client';

import { io, type Socket } from 'socket.io-client';
import { handleRefreshFailure, refreshSession } from '@/lib/api/refresh';
import { useAuthStore } from '@/store/authStore';
import {
  CARRIER_CHAT_ACCESS_CODES,
  CARRIER_CHAT_EVENTS,
  CARRIER_CHAT_SOCKET_STATE,
  type CarrierChatStatusEvent,
} from '@/types/carrierChat';

export type CarrierChatSocket = Socket;

export type CarrierChatConnectionState = 'connected' | 'reconnecting' | 'offline';

type AuthSession = Pick<ReturnType<typeof useAuthStore.getState>, 'token' | 'user'>;

const CARRIER_CHAT_NAMESPACE = '/carrier-chat';
const CARRIER_CHAT_SOCKET_PATH = '/socket.io';
const DISCONNECT_BY_SERVER = 'io server disconnect';

let socket: CarrierChatSocket | null = null;
let holders = 0;
let connection: CarrierChatConnectionState = 'offline';
let stopped = false;
let authRetries = 0;
let unsubscribeAuth: (() => void) | null = null;
const connectionListeners = new Set<() => void>();

const apiOrigin = (): string | null => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    return new URL(base).origin;
  } catch {
    return null;
  }
};

const accessCodeOf = (error: Error): string | null => {
  const data: unknown = (error as { data?: unknown }).data;
  if (typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string') {
    return data.code;
  }
  return null;
};

const setConnection = (next: CarrierChatConnectionState): void => {
  if (connection === next) return;
  connection = next;
  connectionListeners.forEach((listener) => listener());
};

export const subscribeCarrierChatConnection = (listener: () => void): (() => void) => {
  connectionListeners.add(listener);
  return () => {
    connectionListeners.delete(listener);
  };
};

export const getCarrierChatConnection = (): CarrierChatConnectionState => connection;

const stop = (): void => {
  if (!socket) return;
  stopped = true;
  socket.disconnect();
  setConnection('offline');
};

const reconnect = (): void => {
  if (!socket) return;
  stopped = false;
  socket.disconnect();
  socket.connect();
};

const onConnectError = async (error: Error): Promise<void> => {
  if (!socket) return;
  const code = accessCodeOf(error);
  if (code === CARRIER_CHAT_ACCESS_CODES.UNAUTHORIZED) {
    if (authRetries >= 1) {
      stop();
      return;
    }
    authRetries += 1;
    try {
      await refreshSession();
    } catch (refreshError) {
      handleRefreshFailure(refreshError);
      stop();
      return;
    }
    if (!stopped && socket && !socket.connected) socket.connect();
    return;
  }
  if (code !== null) {
    stop();
    return;
  }
  setConnection('reconnecting');
};

const createSocket = (origin: string): CarrierChatSocket => {
  const next = io(`${origin}${CARRIER_CHAT_NAMESPACE}`, {
    path: CARRIER_CHAT_SOCKET_PATH,
    transports: ['websocket'],
    forceNew: true,
    autoConnect: false,
    auth: (callback) => callback({ token: useAuthStore.getState().token }),
  });
  next.on('connect', () => {
    authRetries = 0;
    setConnection('connected');
  });
  next.on('disconnect', (reason) => {
    if (reason === DISCONNECT_BY_SERVER) stopped = true;
    setConnection(stopped ? 'offline' : 'reconnecting');
  });
  next.on('connect_error', (error) => {
    void onConnectError(error);
  });
  next.on(CARRIER_CHAT_EVENTS.STATUS, (event: CarrierChatStatusEvent) => {
    if (event.state === CARRIER_CHAT_SOCKET_STATE.REVOKED) stop();
  });
  return next;
};

const onAuthChange = (state: AuthSession, previous: AuthSession): void => {
  if (!socket) return;
  if (state.user === null) {
    stop();
    return;
  }
  const identityChanged = previous.user === null || previous.user.id !== state.user.id;
  if (identityChanged) authRetries = 0;
  if (identityChanged || state.token !== previous.token) reconnect();
};

export const acquireCarrierChatSocket = (): CarrierChatSocket | null => {
  if (!socket) {
    const origin = apiOrigin();
    if (origin === null) return null;
    socket = createSocket(origin);
    unsubscribeAuth = useAuthStore.subscribe(onAuthChange);
    stopped = false;
    setConnection('reconnecting');
    socket.connect();
  }
  holders += 1;
  return socket;
};

export const releaseCarrierChatSocket = (): void => {
  holders = Math.max(0, holders - 1);
  if (holders > 0 || !socket) return;
  unsubscribeAuth?.();
  unsubscribeAuth = null;
  const closing = socket;
  socket = null;
  closing.removeAllListeners();
  closing.disconnect();
  authRetries = 0;
  setConnection('offline');
};
