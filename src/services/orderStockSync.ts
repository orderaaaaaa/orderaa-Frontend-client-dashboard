import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  OrderStockRepairResult,
  PreparedDriftPage,
} from '@/types/orderStockSync';

export const getPreparedDrift = async (
  page: number,
  pageSize: number
): Promise<PreparedDriftPage> => {
  const response = await api.get<PreparedDriftPage>(
    '/stock-movements/orders/prepared-drift',
    { params: { page, pageSize } }
  );
  return response.data;
};

export const repairOrderStock = async (
  orderId: number
): Promise<OrderStockRepairResult> => {
  const response = await api.post<OrderStockRepairResult>(
    `/stock-movements/orders/${orderId}/repair`
  );
  return response.data;
};

export const useOrderStockDriftQuery = (
  page: number,
  pageSize: number,
  enabled: boolean
) =>
  useQuery({
    queryKey: [QUERY_KEYS.ORDER_STOCK_DRIFT, page, pageSize],
    queryFn: () => getPreparedDrift(page, pageSize),
    enabled,
    staleTime: 0,
  });

export const useRepairOrderStockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => repairOrderStock(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_STOCK_DRIFT],
      });
    },
  });
};
