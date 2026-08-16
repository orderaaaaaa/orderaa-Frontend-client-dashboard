import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';
import type { Order } from '@/types/orders';

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

const KEY = 'delayed-orders';

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
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'تعذر حفظ الإعدادات');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'تعذر تنفيذ العملية');
    },
  });
};
