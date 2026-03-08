import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editCustomer } from '../api/editCustomer';
import { UpdateCustomerPayload } from '../types/updateCustomerPayload';
import { toast } from 'react-toastify';

interface UseEditCustomerParams {
  customerId: number;
  payload: Omit<UpdateCustomerPayload, 'id'>;
}

export function useEditCustomer(options?: {
  onSuccess?: (data: any, variables: UseEditCustomerParams) => void;
  onError?: (error: Error, variables: UseEditCustomerParams) => void;
  onSettled?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, payload }: UseEditCustomerParams) =>
      editCustomer(customerId, payload),

    onMutate: async ({ customerId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] });
      const previousCustomers = queryClient.getQueryData(['customers']);

      queryClient.setQueryData(['customers'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((customer: any) =>
            customer.id === customerId ? { ...customer, ...payload } : customer
          ),
        };
      });

      return { previousCustomers };
    },

    onError: (err, variables, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(['customers'], context.previousCustomers);
      }
      const message =
        err instanceof Error && 'response' in err
          ? (err as any).response?.data?.message
          : null;
      toast.error(message || 'فشل في تحديث بيانات العميل');
      options?.onError?.(err, variables);
    },

    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      options?.onSettled?.();
    },
  });
}
