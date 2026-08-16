import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mergeCustomers } from '../api/mergeCustomers';
import { MergeCustomersPayload } from '../types/merge';
import { CustomerId } from '../types/customerId';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

interface UseMergeCustomersParams {
  targetCustomerId: number;
  payload: MergeCustomersPayload;
}

/**
 * Synchronous merge of two customers (T4). On success invalidates every
 * query the merge can affect: the customers list, individual customer
 * details, and orders — the merged orders can be showing on an open order
 * details page whose customer was just deleted, so `ORDER_DETAILS` must be
 * invalidated too (spec §8 case 9).
 */
export function useMergeCustomersMutation(options?: {
  onSuccess?: (data: CustomerId, variables: UseMergeCustomersParams) => void;
  onError?: (error: unknown, variables: UseMergeCustomersParams) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetCustomerId, payload }: UseMergeCustomersParams) =>
      mergeCustomers(targetCustomerId, payload),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_ORDERS] });
      options?.onSuccess?.(data, variables);
    },

    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });
}
