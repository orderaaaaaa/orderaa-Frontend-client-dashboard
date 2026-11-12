import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getCarrierChatThread, markCarrierChatSeen, sendCarrierChatMessage } from '@/lib/api/carrierChat';
import type { SendCarrierChatMessageBody } from '@/types/carrierChat';
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

export const useMarkCarrierChatSeenMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => markCarrierChatSeen(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === SHIPPING_PROVIDERS_KEY && isShipmentListKey(query.queryKey[2]),
      });
    },
  });
};
