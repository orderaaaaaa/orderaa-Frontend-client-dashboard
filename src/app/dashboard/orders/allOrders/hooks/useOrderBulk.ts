import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { bulkOrders } from '../api/orders';
import type { BulkRequest, BulkUpdateResponse } from '../types/Bulk';

export const useBulkOrders = (
  options?: UseMutationOptions<BulkUpdateResponse, Error, BulkRequest>
) => {
  return useMutation<BulkUpdateResponse, Error, BulkRequest>({
    mutationFn: bulkOrders,
    ...options,
  });
};
