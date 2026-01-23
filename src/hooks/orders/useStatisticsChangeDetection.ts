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
  const previousStatisticsRef = useRef<OrderStatistics | null>(null);
  const isInitializedRef = useRef(false);
  const onStatisticsChangeRef = useRef(onStatisticsChange);

  onStatisticsChangeRef.current = onStatisticsChange;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.query.queryKey[0] === QUERY_KEYS.ORDER_STATISTICS
      ) {
        const queryState = event.query.state;
        const newData = queryState.data as OrderStatisticsResponse | undefined;
        const newStatistics = newData?.success ? newData.data : null;

        if (!isInitializedRef.current) {
          previousStatisticsRef.current = newStatistics;
          isInitializedRef.current = true;
          return;
        }

        if (!areStatisticsEqual(previousStatisticsRef.current, newStatistics)) {
          previousStatisticsRef.current = newStatistics;
          onStatisticsChangeRef.current?.();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, enabled]);

  const resetPreviousStatistics = useCallback(() => {
    previousStatisticsRef.current = null;
    isInitializedRef.current = false;
  }, []);

  return { resetPreviousStatistics };
}
