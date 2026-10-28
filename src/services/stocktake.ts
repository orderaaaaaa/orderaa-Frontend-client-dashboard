import { useCallback } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  cancelStocktake,
  getAllChangedStocktakeLines,
  getStocktake,
  getStocktakeLines,
  getStocktakes,
  postStocktake,
  startStocktake,
  updateStocktakeLines,
} from '@/lib/api/stocktake';
import { STOCK_VIEW_KEYS } from '@/services/warehouses';
import type {
  CreateStocktakeDto,
  ListStocktakesParams,
  PostStocktakeDto,
  StocktakeLinesParams,
  UpdateStocktakeLinesDto,
} from '@/app/dashboard/inventory/stock-management/types/stocktake';

const STALE_TIME = 30 * 1000;

export const useStocktakesQuery = (
  params: ListStocktakesParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOCKTAKES, params] as QueryKey,
    queryFn: () => getStocktakes(params),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: STALE_TIME,
  });

export const useStocktakeQuery = (id: number | null, enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOCKTAKE_DETAIL, id] as QueryKey,
    queryFn: () => getStocktake(id as number),
    enabled: enabled && id !== null,
    staleTime: STALE_TIME,
  });

export const useStocktakeLinesQuery = (
  id: number | null,
  params: StocktakeLinesParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: [QUERY_KEYS.STOCKTAKE_LINES, id, params] as QueryKey,
    queryFn: () => getStocktakeLines(id as number, params),
    enabled: enabled && id !== null,
    placeholderData: (previous) => previous,
    staleTime: STALE_TIME,
  });

const useInvalidateStocktakeViews = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (id?: number) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCKTAKES] });
      queryClient.invalidateQueries({
        queryKey: id === undefined
          ? [QUERY_KEYS.STOCKTAKE_DETAIL]
          : [QUERY_KEYS.STOCKTAKE_DETAIL, id],
      });
      queryClient.invalidateQueries({
        queryKey: id === undefined
          ? [QUERY_KEYS.STOCKTAKE_LINES]
          : [QUERY_KEYS.STOCKTAKE_LINES, id],
      });
    },
    [queryClient]
  );
};

export const useStartStocktakeMutation = () => {
  const invalidate = useInvalidateStocktakeViews();
  return useMutation({
    mutationFn: (body: CreateStocktakeDto) => startStocktake(body),
    onSuccess: () => invalidate(),
  });
};

export const useUpdateStocktakeLinesMutation = () => {
  const invalidate = useInvalidateStocktakeViews();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateStocktakeLinesDto }) =>
      updateStocktakeLines(id, body),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
};

export const usePostStocktakeMutation = () => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateStocktakeViews();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PostStocktakeDto }) =>
      postStocktake(id, body),
    onSuccess: (_data, variables) => {
      invalidate(variables.id);
      STOCK_VIEW_KEYS.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
    },
  });
};

export const useCancelStocktakeMutation = () => {
  const invalidate = useInvalidateStocktakeViews();
  return useMutation({
    mutationFn: (id: number) => cancelStocktake(id),
    onSuccess: (_data, id) => invalidate(id),
  });
};

export const useLoadChangedStocktakeLines = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (id: number) =>
      queryClient.fetchQuery({
        queryKey: [QUERY_KEYS.STOCKTAKE_LINES, id, 'CHANGED_ALL'] as QueryKey,
        queryFn: () => getAllChangedStocktakeLines(id),
        staleTime: 0,
      }),
    [queryClient]
  );
};
