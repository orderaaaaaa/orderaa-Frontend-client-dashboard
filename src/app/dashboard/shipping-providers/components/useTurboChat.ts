import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrderChatSocket } from '@/hooks/realtime/useCarrierChatSocket';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { CarrierChatConnectionState } from '@/lib/realtime/carrierChatSocket';
import {
  useCarrierChatThreadQuery,
  useMarkCarrierChatSeenMutation,
  useSendCarrierChatMessageMutation,
} from '@/services/carrierChat';
import {
  CARRIER_CHAT_ERROR_CODES,
  CARRIER_CHAT_SOCKET_STATE,
  type CarrierChatMessage,
  type CarrierChatSocketState,
  type CarrierChatThread,
} from '@/types/carrierChat';
import { CHAT_POLL_INTERVAL_MS, CHAT_SEEN_DEBOUNCE_MS } from './followupNotesConstants';

export interface PendingChatSend {
  localId: number;
  text: string;
  createdAt: string;
}

interface UseTurboChatOptions {
  orderId: number;
  enabled: boolean;
  isActive: boolean;
  canManage: boolean;
}

export interface TurboChatView {
  thread: CarrierChatThread | undefined;
  unreadKey: string | null;
  isLoading: boolean;
  isError: boolean;
  errorCode: string | null;
  authFailed: boolean;
  refetch: () => void;
  socketState: CarrierChatConnectionState;
  lastSyncedAt: string | null;
  pending: PendingChatSend[];
  canCompose: boolean;
  canRetry: boolean;
  sendText: (text: string, retryOfLogId?: number) => Promise<boolean>;
  retry: (message: CarrierChatMessage) => void;
}

export const carrierChatErrorCodeOf = (error: unknown): string | null => {
  const code: unknown = (error as { response?: { data?: { code?: unknown } } } | null)?.response?.data?.code;
  return typeof code === 'string' ? code : null;
};

const newestCarrierKeyOf = (thread: CarrierChatThread | undefined): string | null => {
  if (thread === undefined) return null;
  for (let index = thread.messages.length - 1; index >= 0; index -= 1) {
    const message = thread.messages[index];
    if (message.origin === 'CARRIER') return message.key;
  }
  return null;
};

const subscribeCoarsePointer = (listener: () => void): (() => void) => {
  const query = window.matchMedia('(pointer: coarse)');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};

const coarsePointerSnapshot = (): boolean => window.matchMedia('(pointer: coarse)').matches;

export const useCoarsePointer = (): boolean =>
  useSyncExternalStore(subscribeCoarsePointer, coarsePointerSnapshot, () => false);

export function useTurboChat({ orderId, enabled, isActive, canManage }: UseTurboChatOptions): TurboChatView {
  const socket = useOrderChatSocket(orderId, isActive);
  const liveState: CarrierChatConnectionState =
    socket.state === 'connected' && socket.carrierStatus === CARRIER_CHAT_SOCKET_STATE.DEGRADED
      ? 'reconnecting'
      : socket.state;
  const query = useCarrierChatThreadQuery(orderId, {
    enabled,
    refetchInterval: isActive && liveState !== 'connected' ? CHAT_POLL_INTERVAL_MS : false,
  });
  const refetchThread = query.refetch;
  const previousCarrierStatus = useRef<CarrierChatSocketState | null>(null);

  useEffect(() => {
    const status = socket.carrierStatus;
    const previous = previousCarrierStatus.current;
    previousCarrierStatus.current = status;
    if (status === CARRIER_CHAT_SOCKET_STATE.AUTH_FAILED && previous !== status) void refetchThread();
    if (
      status === CARRIER_CHAT_SOCKET_STATE.OK &&
      (previous === CARRIER_CHAT_SOCKET_STATE.AUTH_FAILED || previous === CARRIER_CHAT_SOCKET_STATE.DEGRADED)
    ) {
      void refetchThread();
    }
  }, [socket.carrierStatus, refetchThread]);
  const sendMutation = useSendCarrierChatMessageMutation();
  const seenMutation = useMarkCarrierChatSeenMutation();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingChatSend[]>([]);
  const [unreadKey, setUnreadKey] = useState<string | null | undefined>(undefined);
  const localIdRef = useRef(0);
  const seenAtRef = useRef(0);
  const markedKeyRef = useRef<string | null | undefined>(undefined);
  const thread = query.data;
  const syncedAt = thread?.syncedAt;
  const markSeen = seenMutation.mutate;

  useEffect(
    () => () => {
      const queryKey = [QUERY_KEYS.CARRIER_CHAT_THREAD, orderId];
      void queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.removeQueries({ queryKey, exact: true });
    },
    [orderId, queryClient]
  );

  useEffect(() => {
    if (thread !== undefined && unreadKey === undefined) setUnreadKey(thread.firstUnreadKey);
  }, [thread, unreadKey]);

  const newestCarrierKey = newestCarrierKeyOf(thread);

  useEffect(() => {
    if (!isActive || thread === undefined || document.visibilityState !== 'visible') return;
    if (markedKeyRef.current === undefined) {
      if (thread.firstUnreadKey === null) {
        markedKeyRef.current = newestCarrierKey;
        return;
      }
    } else if (newestCarrierKey === null || newestCarrierKey === markedKeyRef.current) {
      return;
    }
    const send = () => {
      seenAtRef.current = Date.now();
      markedKeyRef.current = newestCarrierKey;
      markSeen({ orderId });
    };
    const wait = seenAtRef.current + CHAT_SEEN_DEBOUNCE_MS - Date.now();
    if (wait <= 0) {
      send();
      return;
    }
    const timer = window.setTimeout(send, wait);
    return () => window.clearTimeout(timer);
  }, [isActive, thread, newestCarrierKey, orderId, markSeen]);

  const sendText = async (text: string, retryOfLogId?: number): Promise<boolean> => {
    localIdRef.current += 1;
    const localId = localIdRef.current;
    setPending((current) => [...current, { localId, text, createdAt: new Date().toISOString() }]);
    try {
      await sendMutation.mutateAsync(
        retryOfLogId === undefined ? { orderId, text } : { orderId, text, retryOfLogId }
      );
      await query.refetch();
      return true;
    } catch {
      return false;
    } finally {
      setPending((current) => current.filter((item) => item.localId !== localId));
    }
  };

  const retry = (message: CarrierChatMessage) => {
    if (message.logId === null) return;
    void sendText(message.text, message.logId);
  };

  const errorCode = carrierChatErrorCodeOf(query.error);
  const authFailed =
    socket.carrierStatus === CARRIER_CHAT_SOCKET_STATE.AUTH_FAILED || errorCode === CARRIER_CHAT_ERROR_CODES.AUTH_FAILED;

  return {
    thread,
    unreadKey: unreadKey ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    errorCode,
    authFailed,
    refetch: () => {
      void query.refetch();
    },
    socketState: liveState,
    lastSyncedAt: socket.lastSyncedAt ?? syncedAt ?? null,
    pending,
    canCompose: canManage && thread !== undefined && thread.carrierCanSend && !authFailed,
    canRetry: canManage,
    sendText,
    retry,
  };
}
