import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getGoLiveSummary, getStockMode, postGoLive } from '@/lib/api/stockMode';
import { invalidateAndWait } from '@/lib/query/mutationSync';

const STALE_TIME = 30 * 1000;

export const useStockModeQuery = (enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOCK_MODE],
    queryFn: getStockMode,
    staleTime: STALE_TIME,
    enabled,
  });

export const useGoLiveSummaryQuery = (enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOCK_MODE, 'go-live-summary'],
    queryFn: getGoLiveSummary,
    enabled,
  });

export const useGoLiveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postGoLive(),
    onSuccess: () => invalidateAndWait(queryClient, [[QUERY_KEYS.STOCK_MODE]]),
  });
};
