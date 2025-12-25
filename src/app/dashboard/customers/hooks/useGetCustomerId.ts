// hooks/useCustomer.ts
import { useQuery } from '@tanstack/react-query';
import { getCustomer } from '../api/getCustomerById';
import { CustomerId } from '../types/customerId';

export const useCustomer = (id?: number) => {
  return useQuery<CustomerId>({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id as number),
    enabled: typeof id === 'number',
    staleTime: 1000 * 60 * 5,
  });
};
