import { useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { OrderStatistics, OrderStatisticsResponse } from '@/types/orders';
import { areStatisticsEqual } from '@/utils/statisticsComparison';

interface UseStatisticsChangeDetectionOptions {
  onStatisticsChange?: () => void;
  enabled?: boolean;
}

export function useStatisticsChangeDetection({
  onStatisticsChange,
  enabled = true,
}: UseStatisticsChangeDetectionOptions = {}) {
  const queryClient = useQueryClient();
  const previousStatisticsRef = useRef(
    new Map<string, OrderStatistics | null>()
  );
  const fetchStartedAtRef = useRef(new Map<string, number>());
  const onStatisticsChangeRef = useRef(onStatisticsChange);

  onStatisticsChangeRef.current = onStatisticsChange;

  useEffect(() => {
    if (!enabled) return;

    const queryCache = queryClient.getQueryCache();

    const isStaleSince = (startedAt: number) =>
      queryCache
        .findAll({ queryKey: [QUERY_KEYS.ORDERS], type: 'active' })
        .some((query) =>
          query.state.fetchStatus === 'idle'
            ? query.state.dataUpdatedAt < startedAt
            : (fetchStartedAtRef.current.get(query.queryHash) ?? 0) <
              startedAt
        );

    const unsubscribe = queryCache.subscribe((event) => {
      if (event.type !== 'updated') return;

      const root = event.query.queryKey[0];

      if (root === QUERY_KEYS.ORDERS) {
        if (event.action.type === 'fetch') {
          fetchStartedAtRef.current.set(event.query.queryHash, Date.now());
        }
        return;
      }

      if (root !== QUERY_KEYS.ORDER_STATISTICS) return;

      const { queryHash } = event.query;

      if (event.action.type === 'fetch') {
        fetchStartedAtRef.current.set(queryHash, Date.now());
        return;
      }

      if (event.action.type !== 'success') return;

      const newData = event.query.state.data as
        | OrderStatisticsResponse
        | undefined;
      const newStatistics = newData?.success ? newData.data : null;
      const previous = previousStatisticsRef.current;

      if (!previous.has(queryHash)) {
        previous.set(queryHash, newStatistics);
        return;
      }

      if (areStatisticsEqual(previous.get(queryHash), newStatistics)) return;

      previous.set(queryHash, newStatistics);
      const startedAt =
        fetchStartedAtRef.current.get(queryHash) ??
        event.query.state.dataUpdatedAt;
      if (isStaleSince(startedAt)) {
        onStatisticsChangeRef.current?.();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, enabled]);

  const resetPreviousStatistics = useCallback(() => {
    previousStatisticsRef.current.clear();
    fetchStartedAtRef.current.clear();
  }, []);

  return { resetPreviousStatistics };
}
