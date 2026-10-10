import { useInfiniteQuery } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { OrderChangeHistoryPage } from '@/types/orderChangeHistory';

const PAGE_LIMIT = 20;

export const orderChangeHistoryKey = (orderId: number) =>
  [QUERY_KEYS.ORDER_DETAILS, orderId, 'change-history'] as const;

export const useOrderChangeHistory = (orderId: number) =>
  useInfiniteQuery({
    queryKey: orderChangeHistoryKey(orderId),
    queryFn: async ({ pageParam }) => {
      const { data } = await http.get<OrderChangeHistoryPage>(
        `/orders/${orderId}/change-history`,
        { params: { page: pageParam, limit: PAGE_LIMIT } }
      );
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled: !!orderId,
    staleTime: 0,
  });
