import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getPreparedDrift, repairOrderStock } from '@/lib/api/orderStockSync';

export const useOrderStockDriftQuery = (
  cursor: number | null,
  limit: number,
  enabled: boolean
) =>
  useQuery({
    queryKey: [QUERY_KEYS.ORDER_STOCK_DRIFT, cursor, limit],
    queryFn: () => getPreparedDrift(cursor, limit),
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
