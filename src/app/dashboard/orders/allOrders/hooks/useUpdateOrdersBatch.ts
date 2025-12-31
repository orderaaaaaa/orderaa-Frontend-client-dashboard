import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { updateOrdersBatch } from '../api/orders';
import type { OrdersBatchRequest, OrdersBatchResponse } from '../types/Bulk';

export const useUpdateOrdersBatch = (
  options?: UseMutationOptions<OrdersBatchResponse, Error, OrdersBatchRequest>
) => {
  return useMutation<OrdersBatchResponse, Error, OrdersBatchRequest>({
    mutationFn: updateOrdersBatch,
    ...options,
  });
};
