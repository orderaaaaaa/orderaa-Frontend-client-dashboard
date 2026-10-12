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
  getShortfallSettlements,
  listSettlementBatchOrders,
  listSettlementBatches,
} from '@/lib/api/settlement';

export type ShortfallFilter = 'all' | 'pending' | 'finished';
export type SettlementBatchStatusFilter = 'ALL' | 'OPEN' | 'CONFIRMED';

const SETTLEMENT_KEY = 'settlement';
const BATCHES_LIMIT = 50;
const BATCH_ORDERS_LIMIT = 100;

export const settlementKeys = {
  all: [SETTLEMENT_KEY] as const,
  shortfall: (filter: ShortfallFilter) =>
    [SETTLEMENT_KEY, 'shortfall', filter] as const,
  batches: (status: SettlementBatchStatusFilter) =>
    [SETTLEMENT_KEY, 'batches', status] as const,
  batchOrders: (batchId: string) =>
    [SETTLEMENT_KEY, 'batch-orders', batchId] as const,
};

export function useShortfallSettlementsQuery(filter: ShortfallFilter) {
  return useQuery({
    queryKey: settlementKeys.shortfall(filter),
    queryFn: () => getShortfallSettlements(filter),
    placeholderData: keepPreviousData,
  });
}

export function useSettlementBatchesQuery(status: SettlementBatchStatusFilter) {
  return useQuery({
    queryKey: settlementKeys.batches(status),
    queryFn: () =>
      listSettlementBatches({
        status: status === 'ALL' ? undefined : status,
        limit: BATCHES_LIMIT,
      }),
    placeholderData: keepPreviousData,
  });
}

export function useSettlementBatchOrdersQuery(batchId: string | null) {
  return useQuery({
    queryKey: settlementKeys.batchOrders(batchId ?? ''),
    queryFn: () =>
      listSettlementBatchOrders(batchId ?? '', { limit: BATCH_ORDERS_LIMIT }),
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

export function useAdjustSettlementMutation() {
  const syncSettlement = useSettlementSync();
  return useMutation({
    mutationFn: ({ orderId, amount }: { orderId: number; amount: number }) =>
      adjustSettlement(orderId, amount),
    onSuccess: () => syncSettlement(),
  });
}
