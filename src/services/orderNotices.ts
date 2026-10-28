import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getOrderNotices,
  getUnreadNoticeCount,
  markOrderNoticesRead,
} from '@/lib/api/orderNotices';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getApiErrorStatus } from '@/utils/apiError';

const UNREAD_COUNT_STALE_TIME_MS = 30_000;
const MARK_NOTICES_READ_MAX_IDS = 200;

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

const chunkNoticeIds = (noticeIds: number[]): number[][] => {
  const chunks: number[][] = [];
  for (let index = 0; index < noticeIds.length; index += MARK_NOTICES_READ_MAX_IDS) {
    chunks.push(noticeIds.slice(index, index + MARK_NOTICES_READ_MAX_IDS));
  }
  return chunks;
};

export const useMarkNoticesReadMutation = (orderId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noticeIds: number[]) => {
      for (const chunk of chunkNoticeIds(noticeIds)) {
        await markOrderNoticesRead(orderId, { noticeIds: chunk });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: unreadNoticeCountKey() });
      queryClient.invalidateQueries({ queryKey: orderNoticesKey(orderId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELAYED_ORDERS] });
    },
    onError: (err) => {
      toast.error(noticeErrorMessageOf(err, 'تعذر تعليم التنبيهات كمقروءة'));
    },
  });
};
