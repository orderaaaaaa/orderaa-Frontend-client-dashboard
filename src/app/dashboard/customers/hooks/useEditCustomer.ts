import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { getApiErrorMessage } from '@/utils/apiError';
import { editCustomer } from '../api/editCustomer';
import {
  UpdateCustomerPayload,
  UpdateCustomerResponse,
} from '../types/updateCustomerPayload';
import { CUSTOMERS_QUERY_KEY } from './useGetCustomers';

interface UseEditCustomerParams {
  customerId: number;
  payload: Omit<UpdateCustomerPayload, 'id'>;
}

export function useEditCustomer(options?: {
  onSuccess?: (
    data: UpdateCustomerResponse,
    variables: UseEditCustomerParams
  ) => void;
  onError?: (error: unknown, variables: UseEditCustomerParams) => void;
  onSettled?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, payload }: UseEditCustomerParams) =>
      editCustomer(customerId, payload),

    onError: (err, variables) => {
      toast.error(getApiErrorMessage(err, 'فشل في تحديث بيانات العميل'));
      options?.onError?.(err, variables);
    },

    onSuccess: async (data, variables) => {
      await invalidateAndWait(queryClient, [
        [CUSTOMERS_QUERY_KEY],
        ['customer', variables.customerId],
      ]);
      options?.onSuccess?.(data, variables);
    },

    onSettled: () => {
      options?.onSettled?.();
    },
  });
}
