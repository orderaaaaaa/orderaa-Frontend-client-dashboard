import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomer } from '../api/getCustomerById';
import { CustomerId } from '../types/customerId';

export const useCustomer = (id?: number) => {
  const queryClient = useQueryClient();

  const query = useQuery<CustomerId>({
    queryKey: ['customer', id],
    queryFn: () => {
      if (!id) throw new Error('Customer ID is required');
      return getCustomer(id);
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    remove: () => queryClient.removeQueries({ queryKey: ['customer', id] }),
  };
};
