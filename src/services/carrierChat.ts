import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getCarrierChatThread, markCarrierChatSeen, sendCarrierChatMessage } from '@/lib/api/carrierChat';
import type { SendCarrierChatMessageBody } from '@/types/carrierChat';
import type { ShipmentRowBase } from '@/types/shippingProviders';
import { getApiErrorMessage } from '@/utils/apiError';
import { KEY as SHIPPING_PROVIDERS_KEY, isShipmentListKey } from '@/services/shippingProviders';

interface CarrierChatThreadQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export const useCarrierChatThreadQuery = (orderId: number, options: CarrierChatThreadQueryOptions = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CARRIER_CHAT_THREAD, orderId] as QueryKey,
    queryFn: () => getCarrierChatThread(orderId),
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval ?? false,
    staleTime: 0,
  });
};

interface SendCarrierChatMessageVariables extends SendCarrierChatMessageBody {
  orderId: number;
}

export const useSendCarrierChatMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, ...body }: SendCarrierChatMessageVariables) => sendCarrierChatMessage(orderId, body),
    onSuccess: (_message, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARRIER_CHAT_THREAD, orderId] });
    },
    onError: (err: unknown, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARRIER_CHAT_THREAD, orderId] });
      toast.error(getApiErrorMessage(err, 'تعذر إرسال الرسالة'));
    },
  });
};

const clearChatUnread = <T extends { data: ShipmentRowBase[] }>(page: T, orderId: number): T => {
  if (!Array.isArray(page.data)) return page;
  return {
    ...page,
    data: page.data.map((row) => (row.id === orderId ? { ...row, unreadChatCount: 0 } : row)),
  };
};

export const useMarkCarrierChatSeenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => markCarrierChatSeen(orderId),
    onSuccess: (_result, { orderId }) => {
      queryClient.setQueriesData<{ data: ShipmentRowBase[] }>(
        {
          predicate: (query) =>
            query.queryKey[0] === SHIPPING_PROVIDERS_KEY && isShipmentListKey(query.queryKey[2]),
        },
        (previous) => (previous === undefined ? undefined : clearChatUnread(previous, orderId))
      );
    },
  });
};
