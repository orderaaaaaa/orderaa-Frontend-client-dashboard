import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  acquireCarrierChatSocket,
  getCarrierChatConnection,
  releaseCarrierChatSocket,
  subscribeCarrierChatConnection,
  type CarrierChatConnectionState,
} from '@/lib/realtime/carrierChatSocket';
import { KEY as SHIPPING_PROVIDERS_KEY, isShipmentListKey } from '@/services/shippingProviders';
import {
  CARRIER_CHAT_EVENTS,
  type CarrierChatAck,
  type CarrierChatSocketState,
  type CarrierChatStatusEvent,
  type CarrierChatThread,
  type CarrierChatThreadEvent,
} from '@/types/carrierChat';

export interface OrderChatSocketState {
  state: CarrierChatConnectionState;
  lastSyncedAt: string | null;
  carrierStatus: CarrierChatSocketState | null;
}

const useConnectionState = (): CarrierChatConnectionState =>
  useSyncExternalStore(subscribeCarrierChatConnection, getCarrierChatConnection, getCarrierChatConnection);

export function useOrderChatSocket(orderId: number, enabled: boolean): OrderChatSocketState {
  const queryClient = useQueryClient();
  const connection = useConnectionState();
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [carrierStatus, setCarrierStatus] = useState<CarrierChatSocketState | null>(null);
  const [joinRefused, setJoinRefused] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const socket = acquireCarrierChatSocket();
    if (socket === null) return;
    const queryKey = [QUERY_KEYS.CARRIER_CHAT_THREAD, orderId];
    const join = () => {
      socket.emit(CARRIER_CHAT_EVENTS.JOIN, { orderId }, (ack: CarrierChatAck) => {
        setJoinRefused(!ack.ok);
      });
    };
    const onThread = (event: CarrierChatThreadEvent) => {
      if (event.orderId !== orderId) return;
      queryClient.setQueryData<CarrierChatThread>(queryKey, (previous) =>
        previous === undefined ? undefined : { ...event.thread, firstUnreadKey: previous.firstUnreadKey }
      );
      setLastSyncedAt(event.thread.syncedAt);
    };
    const onStatus = (event: CarrierChatStatusEvent) => {
      if (event.orderId === undefined || event.orderId === orderId) setCarrierStatus(event.state);
    };
    socket.on('connect', join);
    socket.on(CARRIER_CHAT_EVENTS.THREAD, onThread);
    socket.on(CARRIER_CHAT_EVENTS.STATUS, onStatus);
    if (socket.connected) join();
    return () => {
      socket.off('connect', join);
      socket.off(CARRIER_CHAT_EVENTS.THREAD, onThread);
      socket.off(CARRIER_CHAT_EVENTS.STATUS, onStatus);
      if (socket.connected) socket.emit(CARRIER_CHAT_EVENTS.LEAVE, { orderId });
      releaseCarrierChatSocket();
      setJoinRefused(false);
      setLastSyncedAt(null);
      setCarrierStatus(null);
    };
  }, [enabled, orderId, queryClient]);

  return { state: joinRefused ? 'offline' : connection, lastSyncedAt, carrierStatus };
}

export function useCarrierChatPageSocket(enabled: boolean): CarrierChatConnectionState {
  const queryClient = useQueryClient();
  const connection = useConnectionState();

  useEffect(() => {
    if (!enabled) return;
    const socket = acquireCarrierChatSocket();
    if (socket === null) return;
    const join = () => {
      socket.emit(CARRIER_CHAT_EVENTS.PAGE_JOIN, {});
    };
    const onActivity = () => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === SHIPPING_PROVIDERS_KEY && isShipmentListKey(query.queryKey[2]),
      });
    };
    socket.on('connect', join);
    socket.on(CARRIER_CHAT_EVENTS.ACTIVITY, onActivity);
    if (socket.connected) join();
    return () => {
      socket.off('connect', join);
      socket.off(CARRIER_CHAT_EVENTS.ACTIVITY, onActivity);
      if (socket.connected) socket.emit(CARRIER_CHAT_EVENTS.PAGE_LEAVE, {});
      releaseCarrierChatSocket();
    };
  }, [enabled, queryClient]);

  return connection;
}
