import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import type { Order } from '@/types/orders';
import { getApiErrorMessage } from '@/utils/apiError';

export type DelayedMarkKind = 'FOLLOWED_UP' | 'DONE';

/** default hides DONE while still showing followed-up — the described default. */
export type DelayedMarksMode =
  | 'default'
  | 'withDone'
  | 'followedUp'
  | 'notFollowedUp';

export interface DelaySetting {
  status: string;
  /** Stored in minutes; the UI offers days. */
  delayMinutes: number;
}

export interface DelayedOrder extends Order {
  delayedInStatus: string;
  delayedSince: string;
  delayedMinutes: number;
  marks: {
    followedUp: { employeeId: number | null; createdAt: string } | null;
    done: { employeeId: number | null; createdAt: string } | null;
  };
}

export interface DelayedOrdersPage {
  data: DelayedOrder[];
  page: number;
  limit: number;
  total: number;
  /** Lets the empty state tell "nothing delayed" from "nothing configured". */
  thresholdsConfigured: number;
}

export type DelayedTabCounts = Record<DelayedMarksMode, number>;

export interface DelayedUnassessableCount {
  count: number;
}

const KEY = QUERY_KEYS.DELAYED_ORDERS;

export const isRenderableDelayedOrder = (
  value: unknown,
): value is DelayedOrder =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).id === 'number' &&
  typeof (value as Record<string, unknown>).code === 'string';

export const useDelaySettingsQuery = () =>
  useQuery({
    queryKey: [KEY, 'settings'],
    queryFn: async () => {
      const { data } = await http.get<DelaySetting[]>('/orders/delay-settings');
      return data;
    },
  });

export const useReplaceDelaySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: DelaySetting[]) => {
      const { data } = await http.put<DelaySetting[]>('/orders/delay-settings', {
        rows,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast.success('تم حفظ إعدادات التأخير');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ الإعدادات'));
    },
  });
};

export const useDelayedOrdersQuery = (params: {
  status?: string;
  minMinutes?: number;
  marks: DelayedMarksMode;
  page: number;
  limit: number;
}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await http.get<DelayedOrdersPage>('/orders/delayed', {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });

export const useDelayedOrderCountsQuery = (params: {
  status?: string;
  minMinutes?: number;
}) =>
  useQuery({
    queryKey: [KEY, 'counts', params],
    queryFn: async () => {
      const { data } = await http.get<DelayedTabCounts>(
        '/orders/delayed/counts',
        { params },
      );
      return data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });

export const useDelayedUnassessableQuery = () =>
  useQuery({
    queryKey: [KEY, 'unassessable'],
    queryFn: async () => {
      const { data } = await http.get<DelayedUnassessableCount>(
        '/orders/delayed/unassessable-count',
      );
      return data;
    },
    refetchOnWindowFocus: true,
  });

export const useMarkDelayedOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      orderId: number;
      kind: DelayedMarkKind;
      /** true removes the mark instead of adding it. */
      undo?: boolean;
    }) => {
      if (payload.undo) {
        await http.delete(
          `/orders/delayed/${payload.orderId}/marks/${payload.kind}`,
        );
        return;
      }
      await http.post(`/orders/delayed/${payload.orderId}/marks`, {
        kind: payload.kind,
      });
    },
    onSuccess: () => invalidateAndWait(queryClient, [[KEY]]),
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, 'تعذر تنفيذ العملية'));
    },
  });
};
