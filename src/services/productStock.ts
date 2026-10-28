import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  adjustStockBatch,
  getProductStock,
  getStockTimelinePage,
} from '@/lib/api/productStock';
import type {
  AdjustStockBatchDto,
  StockTimelineQueryParams,
} from '@/lib/api/warehouses';
import { invalidateStockViews } from '@/services/warehouses';

export const useProductStockQuery = (productId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_STOCK, productId] as QueryKey,
    queryFn: () => getProductStock(productId as number),
    enabled: productId !== null,
    placeholderData: (previous) => previous,
  });

export const useStockTimelineQuery = (
  params: StockTimelineQueryParams | null,
  options?: { enabled?: boolean }
) =>
  useInfiniteQuery({
    queryKey: [QUERY_KEYS.STOCK_TIMELINE, params] as QueryKey,
    queryFn: ({ pageParam }) =>
      getStockTimelinePage({ ...(params as StockTimelineQueryParams), cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor === null ? undefined : String(lastPage.nextCursor),
    enabled: params !== null && (options?.enabled ?? true),
  });

export const useAdjustStockBatchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdjustStockBatchDto) => adjustStockBatch(body),
    onSuccess: () => invalidateStockViews(queryClient),
  });
};
