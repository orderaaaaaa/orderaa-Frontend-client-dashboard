'use client';

import { useCallback } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { useOrderStatusSync } from '@/lib/query/mutationSync';
import {
  adjustSettlement,
  deleteSettlementBatch,
  getSettlementBatch,
  getShortfallSettlements,
  listSettlementBatchOrders,
  listSettlementBatches,
} from '@/lib/api/settlement';

export type ShortfallFilter = 'all' | 'pending' | 'finished';
export type SettlementBatchStatusFilter = 'ALL' | 'OPEN' | 'CONFIRMED';

export interface SettlementPageParams {
  q: string;
  page: number;
  limit: number;
}

const SETTLEMENT_KEY = 'settlement';

export const settlementKeys = {
  all: [SETTLEMENT_KEY] as const,
  shortfall: (filter: ShortfallFilter) =>
    [SETTLEMENT_KEY, 'shortfall', filter] as const,
  batches: (
    status: SettlementBatchStatusFilter,
    q: string,
    page: number,
    limit: number,
  ) => [SETTLEMENT_KEY, 'batches', status, q, page, limit] as const,
  batchOrders: (batchId: string, q: string, page: number, limit: number) =>
    [SETTLEMENT_KEY, 'batch-orders', batchId, q, page, limit] as const,
  batch: (batchId: string) => [SETTLEMENT_KEY, 'batch', batchId] as const,
};

export function useShortfallSettlementsQuery(filter: ShortfallFilter) {
  return useQuery({
    queryKey: settlementKeys.shortfall(filter),
    queryFn: () => getShortfallSettlements(filter),
    placeholderData: keepPreviousData,
  });
}

export function useSettlementBatchesQuery(
  status: SettlementBatchStatusFilter,
  { q, page, limit }: SettlementPageParams,
) {
  return useQuery({
    queryKey: settlementKeys.batches(status, q, page, limit),
    queryFn: () =>
      listSettlementBatches({
        status: status === 'ALL' ? undefined : status,
        q: q || undefined,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
  });
}

export function useSettlementBatchOrdersQuery(
  batchId: string | null,
  { q, page, limit }: SettlementPageParams,
) {
  return useQuery({
    queryKey: settlementKeys.batchOrders(batchId ?? '', q, page, limit),
    queryFn: () =>
      listSettlementBatchOrders(batchId ?? '', {
        q: q || undefined,
        page,
        limit,
      }),
    enabled: !!batchId,
  });
}

export function useSettlementBatchQuery(batchId: string | null) {
  return useQuery({
    queryKey: settlementKeys.batch(batchId ?? ''),
    queryFn: () => getSettlementBatch(batchId ?? ''),
    enabled: !!batchId,
  });
}

export function useSettlementSync() {
  const syncOrders = useOrderStatusSync();
  return useCallback(
    () => syncOrders([[...settlementKeys.all]]),
    [syncOrders]
  );
}

export function useDeleteSettlementBatchMutation() {
  const syncSettlement = useSettlementSync();
  return useMutation({
    mutationFn: deleteSettlementBatch,
    onSuccess: () => syncSettlement(),
  });
}

export function useAdjustSettlementMutation() {
  const syncSettlement = useSettlementSync();
  return useMutation({
    mutationFn: ({ orderId, amount }: { orderId: number; amount: number }) =>
      adjustSettlement(orderId, amount),
    onSuccess: () => syncSettlement(),
  });
}
