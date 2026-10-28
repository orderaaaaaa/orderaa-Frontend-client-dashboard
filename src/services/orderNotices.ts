import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getOrderNotices,
  getUnreadNoticeCount,
  markOrderNoticesRead,
} from '@/lib/api/orderNotices';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getApiErrorStatus } from '@/utils/apiError';
import type { MarkNoticesReadDto } from '@/types/orderSystemFailures';

const UNREAD_COUNT_STALE_TIME_MS = 30_000;

export const orderNoticesRootKey = [QUERY_KEYS.ORDER_NOTICES] as const;

export const unreadNoticeCountKey = () => [QUERY_KEYS.ORDER_NOTICES, 'unread-count'] as const;

export const orderNoticesKey = (orderId: number) =>
  [QUERY_KEYS.ORDER_NOTICES, 'order', orderId] as const;

const errorCodeOf = (err: unknown): string | undefined => {
  const code = (err as { response?: { data?: { code?: unknown } } })?.response?.data?.code;
  return typeof code === 'string' ? code : undefined;
};

export const noticeErrorMessageOf = (err: unknown, fallback: string): string => {
  const code = errorCodeOf(err);
  if (code === 'NOTICE_IDS_NOT_FOUND') {
    return 'بعض التنبيهات لم تعد تابعة لهذا الطلب، حدّث الصفحة وحاول مرة أخرى';
  }
  if (code === 'ORDER_NOT_FOUND' || getApiErrorStatus(err) === 404) {
    return 'الطلب غير موجود أو لا تملك صلاحية الوصول إليه';
  }
  if (getApiErrorStatus(err) === 403) {
    return 'ليس لديك صلاحية لهذا الإجراء';
  }
  return fallback;
};

export const useUnreadNoticeCountQuery = () =>
  useQuery({
    queryKey: unreadNoticeCountKey(),
    queryFn: getUnreadNoticeCount,
    staleTime: UNREAD_COUNT_STALE_TIME_MS,
  });

export const useOrderNoticesInfiniteQuery = (orderId: number) =>
  useInfiniteQuery({
    queryKey: orderNoticesKey(orderId),
    queryFn: ({ pageParam }) => getOrderNotices(orderId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const useMarkNoticesReadMutation = (orderId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: MarkNoticesReadDto) => markOrderNoticesRead(orderId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unreadNoticeCountKey() });
      queryClient.invalidateQueries({ queryKey: orderNoticesKey(orderId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
    onError: (err) => {
      toast.error(noticeErrorMessageOf(err, 'تعذر تعليم التنبيهات كمقروءة'));
    },
  });
};
