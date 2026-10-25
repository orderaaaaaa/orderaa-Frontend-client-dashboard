import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { invalidateAndWait, orderStatusKeys } from '@/lib/query/mutationSync';
import { bulkOrders } from '../api/orders';
import type { BulkRequest, BulkUpdateResponse } from '../types/Bulk';

export const useBulkOrders = (
  options?: UseMutationOptions<
    BulkUpdateResponse,
    Error,
    { payload: BulkRequest; currentStatus?: string }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    BulkUpdateResponse,
    Error,
    { payload: BulkRequest; currentStatus?: string }
  >({
    ...options,
    mutationFn: ({ payload, currentStatus }) =>
      bulkOrders(payload, currentStatus),
    onSuccess: async (data, ...rest) => {
      for (const item of data.refused) toast.warning(item.message);
      await invalidateAndWait(queryClient, orderStatusKeys());
      await options?.onSuccess?.(data, ...rest);
    },
  });
};
