'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/utils/format';
import { ActorChip } from './ActorChip';
import { actorRefToChip, type ActorRef } from './actors';

interface AuditHistoryListProps<T extends { id: number }> {
  items: T[];
  hasNext: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  getActor: (item: T) => ActorRef | null;
  getAction: (item: T) => string;
  getCreatedAt: (item: T) => string;
  renderBody: (item: T) => ReactNode;
  emptyTitle?: string;
}

export function AuditHistoryList<T extends { id: number }>({
  items,
  hasNext,
  isLoading,
  onLoadMore,
  getActor,
  getAction,
  getCreatedAt,
  renderBody,
  emptyTitle = 'لا يوجد سجل بعد',
}: AuditHistoryListProps<T>) {
  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-foreground">{getAction(item)}</span>
              <time
                dateTime={getCreatedAt(item)}
                className="text-sm tabular-nums text-muted-foreground"
              >
                {formatDateTime(getCreatedAt(item))}
              </time>
            </div>
            <div>
              <ActorChip actor={actorRefToChip(getActor(item))} />
            </div>
            <div className="text-sm text-foreground">{renderBody(item)}</div>
          </li>
        ))}
      </ol>
      {hasNext && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isLoading}
            onClick={onLoadMore}
          >
            {isLoading ? 'جارٍ التحميل...' : 'تحميل المزيد'}
          </Button>
        </div>
      )}
    </div>
  );
}
