'use client';

import { Check } from 'lucide-react';
import { OrderChip } from '@/components/stock/OrderChip';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { orderSystemFailureLabelKeyOf } from '@/constants/orderSystemFailures';
import { useI18n } from '@/i18n/I18nProvider';
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
  const { t } = useI18n();
  const query = useOrderNoticesInfiniteQuery(orderId);
  const markOne = useMarkNoticesReadMutation(orderId);
  const markAll = useMarkNoticesReadMutation(orderId);

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
        fallback={noticeErrorMessageOf(query.error, t('orderNotices.dialog.loadError'))}
        onRetry={() => query.refetch()}
      />
    );
  }

  const notices = query.data.pages.flatMap((page) => page.data).filter((notice) => !notice.read);
  const hasMore = query.hasNextPage;

  if (notices.length === 0 && !hasMore) {
    return <EmptyState title={t('orderNotices.dialog.empty')} />;
  }

  const pendingNoticeId = markOne.isPending ? markOne.variables?.[0] : undefined;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {notices.map((notice) => (
          <NoticeRow
            key={notice.id}
            notice={notice}
            canAcknowledge={canAcknowledge}
            isPending={pendingNoticeId === notice.id}
            onAcknowledge={() => markOne.mutate([notice.id])}
          />
        ))}
      </ul>

      {hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-center text-primary"
          loading={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {t('orderNotices.dialog.loadMore')}
        </Button>
      )}

      {canAcknowledge && (
        <div className="flex justify-end border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={notices.length === 0}
            loading={markAll.isPending}
            onClick={() => markAll.mutate(notices.map((notice) => notice.id))}
          >
            {t('orderNotices.dialog.markAll')}
          </Button>
        </div>
      )}
    </div>
  );
}

function NoticeRow({
  notice,
  canAcknowledge,
  isPending,
  onAcknowledge,
}: {
  notice: OrderNoticeDto;
  canAcknowledge: boolean;
  isPending: boolean;
  onAcknowledge(): void;
}) {
  const { t, locale } = useI18n();
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-semibold break-words text-foreground">
            {t(orderSystemFailureLabelKeyOf(notice.code))}
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
        {canAcknowledge && (
          <Button type="button" variant="outline" size="sm" loading={isPending} onClick={onAcknowledge}>
            <Check aria-hidden="true" />
            {t('orderNotices.dialog.acknowledge')}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        <span dir="ltr" className="tabular-nums">
          {formatDateTime(notice.lastOccurredAt)}
        </span>{' '}
        · {getTimeAgo(notice.lastOccurredAt, locale)}
      </p>
    </li>
  );
}
