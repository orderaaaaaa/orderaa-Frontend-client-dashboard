import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCustomerReturn, getCustomerReturnCandidates } from '@/lib/api/customerReturnsApi';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait, orderStatusKeys } from '@/lib/query/mutationSync';
import type { CreateCustomerReturnPayload } from '@/types/customer-return';

export const CUSTOMER_RETURN_CANDIDATES_KEY = 'customer-return-candidates';

export const useCustomerReturnCandidates = (customerId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.ORDERS, CUSTOMER_RETURN_CANDIDATES_KEY, customerId],
    queryFn: () => getCustomerReturnCandidates(customerId as number),
    enabled: customerId !== null,
    refetchOnWindowFocus: false,
  });

export const useCreateCustomerReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerReturnPayload) => createCustomerReturn(payload),
    onSuccess: async () => {
      await invalidateAndWait(queryClient, orderStatusKeys());
    },
  });
};
