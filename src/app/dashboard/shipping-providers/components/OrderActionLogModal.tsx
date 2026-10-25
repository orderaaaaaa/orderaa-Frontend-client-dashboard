'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderChangeBatchItem } from '@/components/OrderDetails/ChangeHistory/OrderChangeBatchItem';
import { OrderChangeHistorySkeleton } from '@/components/OrderDetails/ChangeHistory/OrderChangeHistoryStates';
import BaseModal from '@/components/ui/base-modal';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { FollowupActionEvent } from '@/lib/api/followup';
import { PERMISSIONS } from '@/lib/permissions';
import { useOrderChangeHistory } from '@/services/orderChangeHistory';
import { useFollowupActionEventsQuery } from '@/services/followup';
import { orderDetailsQueryOptions } from '@/services/orders';
import type { OrderChangeBatch } from '@/types/orderChangeHistory';
import { getApiErrorStatus } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';
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
} from './followupNotesConstants';

const FORBIDDEN_STATUS = 403;

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

function ActionEventRow({ event }: { event: FollowupActionEvent }) {
  const nameLabel = ACTION_EVENT_NAME_LABELS[event.name] ?? event.name;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="break-words text-sm font-bold text-[#1F1F1F]">
            {event.employeeName ?? ACTION_LOG_SYSTEM_ACTOR}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {nameLabel}
          </span>
          <span className="text-xs text-gray-500">{ACTION_EVENT_SOURCE_LABELS[event.source]}</span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDateTime(event.createdAt)} ({getTimeAgo(event.createdAt)})
        </span>
      </div>
      {event.note && (
        <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{event.note}</p>
      )}
    </div>
  );
}

function ActionLogContent({ orderId, canReadHistory }: { orderId: number; canReadHistory: boolean }) {
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

  if (eventsQuery.isError) {
    return <p className="py-6 text-center text-sm text-red-600">{ACTION_LOG_EVENTS_ERROR}</p>;
  }

  const isHistoryPending =
    canReadHistory && (historyQuery.isLoading || (historyQuery.hasNextPage && !isHistoryError));
  const isLoading = eventsQuery.isLoading || orderQuery.isLoading || isHistoryPending;

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {historyNotice && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{historyNotice}</p>
      )}

      {isLoading ? (
        <OrderChangeHistorySkeleton />
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">{ACTION_LOG_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) =>
            entry.isHistory ? (
              <OrderChangeBatchItem
                key={entry.key}
                batch={entry.batch}
                getStatusLabel={getStatusLabel}
                lineProductNames={lineProductNames}
              />
            ) : (
              <ActionEventRow key={entry.key} event={entry.event} />
            )
          )}
        </div>
      )}
    </div>
  );
}

interface OrderActionLogModalProps {
  orderId: number;
  onClose: () => void;
}

export function OrderActionLogModal({ orderId, onClose }: OrderActionLogModalProps) {
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
      <ActionLogContent orderId={orderId} canReadHistory={canReadHistory} />
    </BaseModal>
  );
}
