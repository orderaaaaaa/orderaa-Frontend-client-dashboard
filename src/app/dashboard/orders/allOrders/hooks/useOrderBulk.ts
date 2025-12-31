import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { bulkOrders } from '../api/orders';
import type { BulkRequest, BulkUpdateResponse } from '../types/Bulk';

export const useBulkOrders = (
  options?: UseMutationOptions<
    BulkUpdateResponse,
    Error,
    { payload: BulkRequest; currentStatus?: string }
  >
) => {
  return useMutation<
    BulkUpdateResponse,
    Error,
    { payload: BulkRequest; currentStatus?: string }
  >({
    mutationFn: ({ payload, currentStatus }) =>
      bulkOrders(payload, currentStatus),
    ...options,
  });
};
