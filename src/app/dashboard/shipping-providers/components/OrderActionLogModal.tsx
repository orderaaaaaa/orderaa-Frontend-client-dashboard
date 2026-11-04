'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CircleAlert, Flag, History, Info, PhoneCall, Send, type LucideIcon } from 'lucide-react';
import { OrderChangeBatchItem } from '@/components/OrderDetails/ChangeHistory/OrderChangeBatchItem';
import BaseModal from '@/components/ui/base-modal';
import { EmptyState } from '@/components/ui/state-panels';
import { Button } from '@/components/ui/button';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { FollowupActionEvent, FollowupActionEventSource } from '@/lib/api/followup';
import { PERMISSIONS } from '@/lib/permissions';
import { useOrderChangeHistory } from '@/services/orderChangeHistory';
import { useFollowupActionEventsQuery } from '@/services/followup';
import { orderDetailsQueryOptions } from '@/services/orders';
import type { OrderChangeBatch } from '@/types/orderChangeHistory';
import { getApiErrorStatus } from '@/utils/apiError';
import { formatDate, formatDateTime } from '@/utils/format';
import { getTimeAgo } from '@/utils/timeAgo';
import {
  ACTION_EVENT_NAME_LABELS,
  ACTION_EVENT_SOURCE_LABELS,
  ACTION_LOG_EMPTY,
  ACTION_LOG_EVENTS_ERROR,
  ACTION_LOG_HISTORY_ERROR_NOTICE,
  ACTION_LOG_HISTORY_FORBIDDEN_NOTICE,
  ACTION_LOG_SYSTEM_ACTOR,
  ACTION_LOG_TITLE,
  FOLLOWUP_NOTES_RETRY_LABEL,
  FOLLOWUP_TODAY_LABEL,
} from './followupNotesConstants';
import { NOTE_BODY_CLASS } from './NoteCard';

const FORBIDDEN_STATUS = 403;

const SOURCE_ICONS: Record<FollowupActionEventSource, LucideIcon> = {
  ORDER_EVENT: PhoneCall,
  LATE_MARK: Flag,
  CARRIER_SEND_AUDIT: Send,
};

const historyNoticeOf = (
  canReadHistory: boolean,
  isError: boolean,
  status: number | undefined
): string | null => {
  if (!canReadHistory) return ACTION_LOG_HISTORY_FORBIDDEN_NOTICE;
  if (!isError) return null;
  return status === FORBIDDEN_STATUS ? ACTION_LOG_HISTORY_FORBIDDEN_NOTICE : ACTION_LOG_HISTORY_ERROR_NOTICE;
};

type ActionLogEntry =
  | { key: string; at: string; isHistory: true; batch: OrderChangeBatch }
  | { key: string; at: string; isHistory: false; event: FollowupActionEvent };

interface DayGroup {
  key: string;
  at: string;
  entries: ActionLogEntry[];
}

const dayKeyOf = (value: string | Date): string => {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const groupByDay = (entries: ActionLogEntry[]): DayGroup[] =>
  entries.reduce<DayGroup[]>((groups, entry) => {
    const key = dayKeyOf(entry.at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, at: entry.at, entries: [entry] });
    }
    return groups;
  }, []);

function ActionEventRow({ event }: { event: FollowupActionEvent }) {
  const nameLabel = ACTION_EVENT_NAME_LABELS[event.name] ?? event.name;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="break-words text-sm font-semibold text-foreground">
          {event.employeeName ?? ACTION_LOG_SYSTEM_ACTOR}
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary-text">{nameLabel}</span>
        <span>{ACTION_EVENT_SOURCE_LABELS[event.source]}</span>
        <span className="ms-auto whitespace-nowrap">
          {formatDateTime(event.createdAt)} ({getTimeAgo(event.createdAt)})
        </span>
      </div>
      {event.note && <p className={NOTE_BODY_CLASS}>{event.note}</p>}
    </div>
  );
}

function TimelineItem({ icon: Icon, isLast, children }: { icon: LucideIcon; isLast: boolean; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
        {!isLast && <span aria-hidden="true" className="w-px flex-1 bg-border" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col pb-4">{children}</div>
    </li>
  );
}

function ActionLogSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex gap-3">
          <span className="size-9 shrink-0 rounded-md bg-muted" />
          <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
            <span className="h-3 w-1/3 rounded bg-muted" />
            <span className="h-4 w-4/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionLogEmpty() {
  return (
    <EmptyState
      icon={
        <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <History className="size-5 text-muted-foreground" />
        </span>
      }
      title={ACTION_LOG_EMPTY}
      className="py-8"
    />
  );
}

function ActionLogError({ isRetrying, onRetry }: { isRetrying: boolean; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
        <CircleAlert className="size-5 text-destructive" />
      </span>
      <p className="text-sm font-medium text-foreground">{ACTION_LOG_EVENTS_ERROR}</p>
      <Button type="button" variant="outline" size="sm" loading={isRetrying} onClick={onRetry}>
        {FOLLOWUP_NOTES_RETRY_LABEL}
      </Button>
    </div>
  );
}

function ActionLogContent({
  orderId,
  canReadHistory,
  orderCode,
}: {
  orderId: number;
  canReadHistory: boolean;
  orderCode?: string;
}) {
  const { getStatusLabel } = useStatusLabel();
  const historyQuery = useOrderChangeHistory(orderId, canReadHistory);
  const eventsQuery = useFollowupActionEventsQuery(orderId, true);
  const orderQuery = useQuery(orderDetailsQueryOptions(orderId));
  const lineProductNames = useMemo(
    () =>
      new Map(
        (orderQuery.data?.order_products ?? []).flatMap((line) =>
          line.products?.name ? [[line.id, line.products.name] as const] : []
        )
      ),
    [orderQuery.data]
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isError: isHistoryError } = historyQuery;

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isHistoryError) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isHistoryError]);

  const historyStatus = isHistoryError ? getApiErrorStatus(historyQuery.error) : undefined;
  const historyNotice = historyNoticeOf(canReadHistory, isHistoryError, historyStatus);

  const batches = useMemo(
    () =>
      canReadHistory && historyQuery.data
        ? [
            ...new Map(
              historyQuery.data.pages.flatMap((page) => page.data).map((batch) => [batch.id, batch])
            ).values(),
          ]
        : [],
    [canReadHistory, historyQuery.data]
  );

  const entries = useMemo<ActionLogEntry[]>(() => {
    const historyEntries: ActionLogEntry[] = batches.map((batch) => ({
      key: `history-${batch.id}`,
      at: batch.createdAt,
      isHistory: true,
      batch,
    }));
    const eventEntries: ActionLogEntry[] = (eventsQuery.data?.data ?? []).map((event) => ({
      key: `${event.source}-${event.id}`,
      at: event.createdAt,
      isHistory: false,
      event,
    }));
    return [...historyEntries, ...eventEntries].sort((a, b) => {
      const byTime = Date.parse(b.at) - Date.parse(a.at);
      if (byTime !== 0) return byTime;
      return Number(b.isHistory) - Number(a.isHistory);
    });
  }, [batches, eventsQuery.data]);

  const dayGroups = useMemo(() => groupByDay(entries), [entries]);

  if (eventsQuery.isError) {
    return <ActionLogError isRetrying={eventsQuery.isFetching} onRetry={() => void eventsQuery.refetch()} />;
  }

  const displayedCode = orderCode ?? orderQuery.data?.code;
  const isHistoryPending =
    canReadHistory && (historyQuery.isLoading || (historyQuery.hasNextPage && !isHistoryError));
  const isLoading = eventsQuery.isLoading || orderQuery.isLoading || isHistoryPending;
  const todayKey = dayKeyOf(new Date());

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      {displayedCode && (
        <p dir="ltr" className="font-mono text-sm font-semibold text-muted-foreground">
          {displayedCode}
        </p>
      )}
      {historyNotice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900"
        >
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>{historyNotice}</p>
        </div>
      )}

      {isLoading ? (
        <ActionLogSkeleton />
      ) : entries.length === 0 ? (
        <ActionLogEmpty />
      ) : (
        <div className="flex flex-col gap-5">
          {dayGroups.map((group) => (
            <section key={group.key} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                {group.key === todayKey ? FOLLOWUP_TODAY_LABEL : formatDate(group.at)}
              </h3>
              <ol className="flex flex-col">
                {group.entries.map((entry, index) => (
                  <TimelineItem
                    key={entry.key}
                    icon={entry.isHistory ? History : SOURCE_ICONS[entry.event.source]}
                    isLast={index === group.entries.length - 1}
                  >
                    {entry.isHistory ? (
                      <OrderChangeBatchItem
                        batch={entry.batch}
                        getStatusLabel={getStatusLabel}
                        lineProductNames={lineProductNames}
                      />
                    ) : (
                      <ActionEventRow event={entry.event} />
                    )}
                  </TimelineItem>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

interface OrderActionLogModalProps {
  orderId: number;
  orderCode?: string;
  onClose: () => void;
}

export function OrderActionLogModal({ orderId, orderCode, onClose }: OrderActionLogModalProps) {
  const { hasPermission } = usePermissionCheck();
  const canReadHistory = hasPermission(PERMISSIONS.ORDERS_HISTORY_READ);

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={ACTION_LOG_TITLE}
      showFooter={false}
      maxWidth="md:max-w-2xl"
    >
      <ActionLogContent orderId={orderId} canReadHistory={canReadHistory} orderCode={orderCode} />
    </BaseModal>
  );
}
