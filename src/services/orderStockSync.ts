import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getPreparedDrift, repairOrderStock } from '@/lib/api/orderStockSync';

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
      [
        QUERY_KEYS.ORDER_STOCK_DRIFT,
        QUERY_KEYS.ORDER_STOCK_AVAILABILITY,
        QUERY_KEYS.PRODUCT_VARIANT_AVAILABILITY,
        QUERY_KEYS.STOCK_MOVEMENTS,
        QUERY_KEYS.WAREHOUSE_SUMMARY,
      ].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};
