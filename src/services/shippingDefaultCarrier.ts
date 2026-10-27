import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  clearDefaultCarrier,
  getDefaultCarrier,
  setDefaultCarrier,
  type SetDefaultCarrierRequest,
} from '@/lib/api/shippingDefaultCarrier';
import { invalidateAndWait } from '@/lib/query/mutationSync';

export const useDefaultCarrierQuery = (enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.SHIPPING_DEFAULT_CARRIER],
    queryFn: getDefaultCarrier,
    enabled,
  });

export const useSetDefaultCarrierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SetDefaultCarrierRequest) => setDefaultCarrier(body),
    onSuccess: () =>
      invalidateAndWait(queryClient, [[QUERY_KEYS.SHIPPING_DEFAULT_CARRIER]]),
  });
};

export const useClearDefaultCarrierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearDefaultCarrier,
    onSuccess: () =>
      invalidateAndWait(queryClient, [[QUERY_KEYS.SHIPPING_DEFAULT_CARRIER]]),
  });
};
