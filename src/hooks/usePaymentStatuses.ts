import { useQuery } from '@tanstack/react-query';
import { getPaymentStatuses } from '@/lib/api/lookups';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export interface PaymentStatusOption {
  key: string;
  label: string;
}

export default function usePaymentStatuses(enabled: boolean = true) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useQuery<PaymentStatusOption[]>({
    queryKey: [QUERY_KEYS.PAYMENT_STATUSES],
    queryFn: async () => {
      const data = await getPaymentStatuses();
      return data as PaymentStatusOption[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });

  const paymentStatuses: PaymentStatusOption[] = data ?? [];

  return {
    paymentStatuses,
    error: error?.message ?? null,
    isLoading,
    isFetching,
  };
}
