import { useQuery } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { OrderLedger } from '@/types/orderLedger';

export const orderLedgerKey = (orderId: number) =>
  [QUERY_KEYS.ORDER_DETAILS, orderId, 'ledger'] as const;

export const useOrderLedger = (orderId: number, enabled: boolean) =>
  useQuery({
    queryKey: orderLedgerKey(orderId),
    queryFn: async () => {
      const { data } = await http.get<OrderLedger>(`/orders/${orderId}/ledger`);
      return data;
    },
    enabled: enabled && !!orderId,
    staleTime: 0,
  });
