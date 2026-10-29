import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getOrderNotices,
  getUnreadNoticeCount,
  markOrderNoticesRead,
} from '@/lib/api/orderNotices';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { useI18n } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import { getApiErrorStatus } from '@/utils/apiError';

const UNREAD_COUNT_STALE_TIME_MS = 30_000;
const UNREAD_COUNT_POLL_INTERVAL_MS = 30_000;
const MARK_NOTICES_READ_MAX_IDS = 200;

export const orderNoticesRootKey = [QUERY_KEYS.ORDER_NOTICES] as const;

export const unreadNoticeCountKey = () => [QUERY_KEYS.ORDER_NOTICES, 'unread-count'] as const;

export const orderNoticesKey = (orderId: number) =>
  [QUERY_KEYS.ORDER_NOTICES, 'order', orderId] as const;

const errorCodeOf = (err: unknown): string | undefined => {
  const code = (err as { response?: { data?: { code?: unknown } } })?.response?.data?.code;
  return typeof code === 'string' ? code : undefined;
};

export const noticeErrorMessageOf = (err: unknown, locale: Locale, fallback: string): string => {
  const code = errorCodeOf(err);
  if (code === 'NOTICE_IDS_NOT_FOUND') {
    return translate(locale, 'orderNotices.error.idsNotFound');
  }
  if (code === 'ORDER_NOT_FOUND' || getApiErrorStatus(err) === 404) {
    return translate(locale, 'orderNotices.error.orderNotFound');
  }
  if (getApiErrorStatus(err) === 403) {
    return translate(locale, 'orderNotices.error.forbidden');
  }
  return fallback;
};

export const useUnreadNoticeCountQuery = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: unreadNoticeCountKey(),
    queryFn: getUnreadNoticeCount,
    staleTime: UNREAD_COUNT_STALE_TIME_MS,
    enabled,
    refetchInterval: enabled ? UNREAD_COUNT_POLL_INTERVAL_MS : false,
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
  const { locale } = useI18n();

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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_ORDERS] });
    },
    onError: (err) => {
      toast.error(
        noticeErrorMessageOf(
          err,
          locale,
          translate(locale, 'orderNotices.error.markReadFailed')
        )
      );
    },
  });
};
