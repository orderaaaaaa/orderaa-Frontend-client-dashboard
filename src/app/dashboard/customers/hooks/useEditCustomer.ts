// useEditCustomer.ts - Updated to accept options
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editCustomer } from '../api/editCustomer';
import { UpdateCustomerPayload } from '../types/updateCustomerPayload';

interface UseEditCustomerParams {
  customerId: number;
  payload: Omit<UpdateCustomerPayload, 'id'>;
}

// Allow users to pass their own callbacks
export function useEditCustomer(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
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

      options?.onError?.(err);
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      options?.onSettled?.();
    },
  });
}
