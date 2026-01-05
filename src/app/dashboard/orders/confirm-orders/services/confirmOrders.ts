import { useQuery, QueryKey } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { ConfirmOrderStatisticsResponse } from '../types';

export const useConfirmOrderStatisticsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONFIRM_ORDER_STATISTICS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<ConfirmOrderStatisticsResponse>(
        '/orders/packaging/statistics'
      );
      return response.data;
    },
  });
};
