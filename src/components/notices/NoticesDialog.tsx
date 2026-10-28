'use client';

import { Check } from 'lucide-react';
import { OrderChip } from '@/components/stock/OrderChip';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { orderSystemFailureLabelOf } from '@/constants/orderSystemFailures';
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
  return (
    <BaseModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="تنبيهات الطلب"
      showFooter={false}
      maxWidth="md:max-w-[560px]"
    >
      <NoticesDialogBody orderId={orderId} canAcknowledge={canAcknowledge} />
    </BaseModal>
  );
}

function NoticesDialogBody({ orderId, canAcknowledge }: { orderId: number; canAcknowledge: boolean }) {
  const query = useOrderNoticesInfiniteQuery(orderId);
  const markRead = useMarkNoticesReadMutation(orderId);

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
        fallback={noticeErrorMessageOf(query.error, 'تعذر تحميل التنبيهات')}
      />
    );
  }

  const notices = query.data.pages.flatMap((page) => page.data).filter((notice) => !notice.read);
  const hasMore = query.hasNextPage;

  if (notices.length === 0 && !hasMore) {
    return <EmptyState title="لا توجد تنبيهات غير مقروءة" />;
  }

  const pendingNoticeId = markRead.isPending ? markRead.variables?.noticeIds?.[0] : undefined;
  const markingAll = markRead.isPending && markRead.variables?.noticeIds === undefined;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {notices.map((notice) => (
          <NoticeRow
            key={notice.id}
            notice={notice}
            canAcknowledge={canAcknowledge}
            isPending={pendingNoticeId === notice.id}
            onAcknowledge={() => markRead.mutate({ noticeIds: [notice.id] })}
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
          عرض المزيد
        </Button>
      )}

      {canAcknowledge && notices.length > 0 && (
        <div className="flex justify-end border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            loading={markingAll}
            onClick={() => markRead.mutate({})}
          >
            تعليم الكل كمقروء
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
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-semibold break-words text-foreground">
            {orderSystemFailureLabelOf(notice.code)}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <OrderChip order={{ id: notice.orderId, code: notice.orderCode }} />
            {notice.occurrenceCount > 1 && (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                تكرر{' '}
                <span dir="ltr" className="tabular-nums">
                  {formatNumber(notice.occurrenceCount)}
                </span>{' '}
                مرة
              </span>
            )}
          </div>
        </div>
        {canAcknowledge && (
          <Button type="button" variant="outline" size="sm" loading={isPending} onClick={onAcknowledge}>
            <Check aria-hidden="true" />
            تم الاطلاع
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        <span dir="ltr" className="tabular-nums">
          {formatDateTime(notice.lastOccurredAt)}
        </span>{' '}
        · {getTimeAgo(notice.lastOccurredAt)}
      </p>
    </li>
  );
}
