import { useQuery, QueryKey } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { PrintOrderStatisticsResponse } from '../types';
import { Order } from '@/types/orders';

export const usePrintOrderStatisticsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRINT_ORDER_STATISTICS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<PrintOrderStatisticsResponse>(
        '/orders/packaging/statistics'
      );
      return response.data;
    },
  });
};

export async function printOrders(count: number): Promise<Order[]> {
  const response = await http.post<Order[]>('/orders/print', { count });
  return response.data;
}
