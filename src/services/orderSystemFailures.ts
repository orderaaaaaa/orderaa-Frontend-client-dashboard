import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { retryHeldTransition } from '@/lib/api/orderSystemFailures';
import { invalidateAndWait, orderStatusKeys } from '@/lib/query/mutationSync';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { getApiErrorMessage, getOutOfStockBlock } from '@/utils/apiError';
import type {
  MarkAllSystemFailuresSeenResponse,
  OrderSystemFailure,
  OrderSystemFailuresPage,
} from '@/types/orderSystemFailures';

const PAGE_LIMIT = 20;

export const orderSystemFailuresKey = (orderId: number) =>
  [QUERY_KEYS.ORDER_DETAILS, orderId, 'system-failures'] as const;

export const useOrderSystemFailures = (orderId: number) =>
  useInfiniteQuery({
    queryKey: orderSystemFailuresKey(orderId),
    queryFn: async ({ pageParam }) => {
      const { data } = await http.get<OrderSystemFailuresPage>(
        `/orders/${orderId}/system-failures`,
        { params: { page: pageParam, limit: PAGE_LIMIT } }
      );
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled: !!orderId,
  });

const useInvalidateAfterSeen = (orderId: number) => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orderSystemFailuresKey(orderId) });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELAYED_ORDERS] });
  };
};

export const useMarkSystemFailureSeen = (orderId: number) => {
  const invalidate = useInvalidateAfterSeen(orderId);

  return useMutation({
    mutationFn: async (failure: Pick<OrderSystemFailure, 'id' | 'occurrenceCount'>) => {
      const { data } = await http.post<OrderSystemFailure>(
        `/orders/${orderId}/system-failures/${failure.id}/seen`,
        { occurrenceCount: failure.occurrenceCount }
      );
      return data;
    },
    onSuccess: (row) => {
      if (!row.seenAt) {
        toast.info('تكرر هذا التنبيه مرة أخرى قبل تعليمه، راجع آخر حدوث ثم أعد المحاولة');
      }
      invalidate();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'تعذر تعليم التنبيه كمقروء'));
    },
  });
};

export const useMarkAllSystemFailuresSeen = (orderId: number) => {
  const invalidate = useInvalidateAfterSeen(orderId);

  return useMutation({
    mutationFn: async (asOf: string) => {
      const { data } = await http.post<MarkAllSystemFailuresSeenResponse>(
        `/orders/${orderId}/system-failures/seen`,
        { asOf }
      );
      return data;
    },
    onSuccess: () => {
      invalidate();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'تعذر تعليم التنبيهات كمقروءة'));
    },
  });
};

export const useRetryHeldTransitionMutation = (orderId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (failureId: number) => retryHeldTransition(orderId, failureId),
    onSuccess: async () => {
      toast.success(
        translate(readStoredLocale(), 'orderSystemFailures.retry.success')
      );
      await invalidateAndWait(queryClient, [
        orderSystemFailuresKey(orderId),
        ...orderStatusKeys(orderId),
      ]);
    },
    onError: (err) => {
      const outOfStock = getOutOfStockBlock(err);
      toast.error(
        outOfStock?.message ??
          getApiErrorMessage(
            err,
            translate(readStoredLocale(), 'orderSystemFailures.retry.failed')
          ),
        outOfStock ? { autoClose: 8000 } : undefined
      );
    },
  });
};
