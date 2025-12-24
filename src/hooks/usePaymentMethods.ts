import { useQuery } from '@tanstack/react-query';
import { getPaymentMethods } from '@/lib/api/lookups';

export interface PaymentMethodOption {
  key: string;
  label: string;
}

export default function usePaymentMethods(enabled: boolean = true) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useQuery<PaymentMethodOption[]>({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const data = await getPaymentMethods();
      return data as PaymentMethodOption[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });

  const paymentMethods: PaymentMethodOption[] = data ?? [];

  return {
    paymentMethods,
    error: error?.message ?? null,
    isLoading,
    isFetching,
  };
}
