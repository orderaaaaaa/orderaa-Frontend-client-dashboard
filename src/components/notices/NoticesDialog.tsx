'use client';

import { useEffect, useRef, useState } from 'react';
import { OrderChip } from '@/components/stock/OrderChip';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { orderSystemFailureLabelKeyOf } from '@/constants/orderSystemFailures';
import { StockTransitionBlockedDetails } from '@/components/OrderDetails/SystemFailures/details/StockTransitionBlockedDetails';
import { narrowFailureDetails } from '@/components/OrderDetails/SystemFailures/details/guards';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { AVAILABLE_WAREHOUSE_NOT_SET_CODE } from '@/lib/api/stockShortage';
import { cn } from '@/lib/utils';
import {
  noticeErrorMessageOf,
  useMarkNoticesReadMutation,
  useOrderNoticesInfiniteQuery,
} from '@/services/orderNotices';
import type { OrderNoticeDto } from '@/types/orderSystemFailures';
import { formatDateTime, formatNumber } from '@/utils/format';
import { getTimeAgo } from '@/utils/timeAgo';

interface NoticesDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  orderId: number;
  canAcknowledge: boolean;
}

export function NoticesDialog({ open, onOpenChange, orderId, canAcknowledge }: NoticesDialogProps) {
  const { t } = useI18n();
  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={t('orderNotices.dialog.title')}
      showFooter={false}
      maxWidth="md:max-w-[560px]"
    >
      <NoticesDialogBody orderId={orderId} canAcknowledge={canAcknowledge} />
    </BaseModal>
  );
}

function NoticesDialogBody({ orderId, canAcknowledge }: { orderId: number; canAcknowledge: boolean }) {
  const { t, locale } = useI18n();
  const query = useOrderNoticesInfiniteQuery(orderId);
  const { mutate: markNoticesRead } = useMarkNoticesReadMutation(orderId);
  const [unreadAtOpen, setUnreadAtOpen] = useState<Set<number> | null>(null);
  const snapshotTakenRef = useRef(false);
  const markedOnOpenRef = useRef(false);
  const { data, isFetchedAfterMount, isFetching } = query;

  useEffect(() => {
    if (!data || !isFetchedAfterMount || isFetching || snapshotTakenRef.current) return;
    snapshotTakenRef.current = true;
    setUnreadAtOpen(
      new Set(
        data.pages
          .flatMap((page) => page.data)
          .filter((notice) => !notice.read)
          .map((notice) => notice.id)
      )
    );
  }, [data, isFetchedAfterMount, isFetching]);

  useEffect(() => {
    if (!canAcknowledge || !unreadAtOpen || unreadAtOpen.size === 0 || markedOnOpenRef.current) return;
    markedOnOpenRef.current = true;
    markNoticesRead(undefined);
  }, [canAcknowledge, unreadAtOpen, markNoticesRead]);

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        fallback={noticeErrorMessageOf(query.error, locale, t('orderNotices.dialog.loadError'))}
        onRetry={() => query.refetch()}
      />
    );
  }

  const notices = query.data.pages.flatMap((page) => page.data);
  const hasMore = query.hasNextPage;

  if (notices.length === 0 && !hasMore) {
    return <EmptyState title={t('orderNotices.dialog.empty')} />;
  }

  const isUnread = (notice: OrderNoticeDto) =>
    canAcknowledge && unreadAtOpen ? unreadAtOpen.has(notice.id) : !notice.read;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {notices.map((notice) => (
          <NoticeRow key={notice.id} notice={notice} unread={isUnread(notice)} />
        ))}
      </ul>

      {hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-center text-primary-text"
          loading={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {t('orderNotices.dialog.loadMore')}
        </Button>
      )}
    </div>
  );
}

function NoticeRow({ notice, unread }: { notice: OrderNoticeDto; unread: boolean }) {
  const { t, locale } = useI18n();
  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-3',
        unread ? 'border-destructive/40 bg-destructive/5' : 'border-border bg-card'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm font-semibold break-words text-foreground">
            {unread && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-destructive" />}
            {t(noticeTitleKeyOf(notice))}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <OrderChip order={{ id: notice.orderId, code: notice.orderCode }} />
            {notice.occurrenceCount > 1 && (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                {t('orderNotices.dialog.repeatedBefore')}{' '}
                <span dir="ltr" className="tabular-nums">
                  {formatNumber(notice.occurrenceCount)}
                </span>{' '}
                {t('orderNotices.dialog.repeatedAfter')}
              </span>
            )}
          </div>
        </div>
      </div>
      <NoticeDetails notice={notice} />
      <p className="text-xs text-muted-foreground">
        <span dir="ltr" className="tabular-nums">
          {formatDateTime(notice.lastOccurredAt)}
        </span>{' '}
        · {getTimeAgo(notice.lastOccurredAt, locale)}
      </p>
    </li>
  );
}

function narrowedTransitionOf(notice: OrderNoticeDto) {
  if (notice.code !== 'STOCK_TRANSITION_BLOCKED' || !notice.details) return null;
  const narrowed = narrowFailureDetails({ code: 'STOCK_TRANSITION_BLOCKED', details: notice.details });
  return narrowed?.code === 'STOCK_TRANSITION_BLOCKED' ? narrowed.details : null;
}

function noticeTitleKeyOf(notice: OrderNoticeDto): TranslationKey {
  const transition = narrowedTransitionOf(notice);
  if (transition?.errorCode === AVAILABLE_WAREHOUSE_NOT_SET_CODE) {
    return 'orderSystemFailures.label.STOCK_TRANSITION_BLOCKED_WAREHOUSE_NOT_SET';
  }
  return orderSystemFailureLabelKeyOf(notice.code);
}

function NoticeDetails({ notice }: { notice: OrderNoticeDto }) {
  const transition = narrowedTransitionOf(notice);
  if (!transition) return null;
  return <StockTransitionBlockedDetails details={transition} />;
}
