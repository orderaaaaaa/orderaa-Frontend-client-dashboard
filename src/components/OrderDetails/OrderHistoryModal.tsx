'use client';

import { formatDate } from '@/utils/format';
import React, { useMemo } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Order, OrderEvent } from '@/types/orders';
import type { OrderChangeBatch } from '@/types/orderChangeHistory';
import { PhoneOff, History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getTimeAgo } from '@/utils/timeAgo';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { OrderChangeBatchItem } from './ChangeHistory/OrderChangeBatchItem';
import {
  OrderChangeHistoryError,
  OrderChangeHistoryLoadMore,
  OrderChangeHistorySkeleton,
} from './ChangeHistory/OrderChangeHistoryStates';
import { useOrderChangeBatches } from './ChangeHistory/useOrderChangeBatches';
import { orderEventLabelOf } from '@/app/dashboard/orders/constants/orderEventLabels';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const getEventIcon = (eventType?: string) => {
  if (!eventType) {
    return <History className="w-4 h-4 text-gray-600" />;
  }

  switch (eventType) {
    case 'CONFIRMED':
    case 'DELIVERED':
    case 'PREPARED':
    case 'REGISTERED':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'CANCELLED':
    case 'STOPPED':
    case 'RETURNED_DELIVERED':
    case 'MISSING':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'POSTPONED':
    case 'WAITING_FOR_PAYMENT':
    case 'UNCOMPLETED':
    case 'PARTIAL_DELIVERY':
      return <Clock className="w-4 h-4 text-orange-600" />;
    case 'ATTEMPTED':
    case 'CALL_AGAIN':
    case 'WHATSAPP':
      return <PhoneOff className="w-4 h-4 text-blue-600" />;
    case 'SHIPPING':
      return <History className="w-4 h-4 text-purple-600" />;
    case 'NEW_ORDER':
      return <History className="w-4 h-4 text-primary" />;
    default:
      return <History className="w-4 h-4 text-gray-600" />;
  }
};

type HistoryEntry =
  | { key: string; at: string; kind: 'batch'; batch: OrderChangeBatch }
  | { key: string; at: string; kind: 'event'; event: OrderEvent };

function OrderEventRow({
  event,
  getStatusLabel,
}: {
  event: OrderEvent;
  getStatusLabel: (status: string) => string;
}) {
  const statusLabel = event.name
    ? (orderEventLabelOf(event.name) ?? getStatusLabel(event.name))
    : 'حدث';
  const note = event.note || statusLabel;

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 shrink-0 rounded-full bg-white flex items-center justify-center border-[3px] border-[#CBB5FD]">
        {getEventIcon(event.name || 'default')}
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="text-base font-semibold text-[#1F1F1F] break-words">{statusLabel}</h3>
        {note !== statusLabel && <p className="text-sm text-primary break-words">{note}</p>}
        <p className="text-sm text-[#5F5E5E]">
          {formatDate(event.createdAt)}{' '}
          <span className="text-xs text-[#888]">({getTimeAgo(event.createdAt)})</span>
        </p>
      </div>
    </div>
  );
}

function OrderHistoryList({ order }: { order: Order }) {
  const { getStatusLabel } = useStatusLabel();
  const canReadHistory = useHasPermission(PERMISSION_CODES.ORDERS_HISTORY_READ);
  const { query, batches, lineProductNames, isFailed, isLoading } = useOrderChangeBatches(
    order,
    canReadHistory
  );

  const entries = useMemo<HistoryEntry[]>(
    () =>
      [
        ...batches.map((batch): HistoryEntry => ({
          key: `batch-${batch.id}`,
          at: batch.createdAt,
          kind: 'batch',
          batch,
        })),
        ...(order.order_events ?? []).map((event): HistoryEntry => ({
          key: `event-${event.id}`,
          at: event.createdAt,
          kind: 'event',
          event,
        })),
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [batches, order.order_events]
  );

  if (entries.length === 0 && !isLoading && !isFailed) {
    return <div className="text-center text-gray-500 py-8">لا توجد أحداث لهذا الطلب</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <OrderChangeHistorySkeleton />}
      {isFailed && (
        <OrderChangeHistoryError isRefetching={query.isRefetching} onRetry={() => query.refetch()} />
      )}
      {entries.map((entry) =>
        entry.kind === 'batch' ? (
          <OrderChangeBatchItem
            key={entry.key}
            batch={entry.batch}
            getStatusLabel={getStatusLabel}
            lineProductNames={lineProductNames}
          />
        ) : (
          <OrderEventRow key={entry.key} event={entry.event} getStatusLabel={getStatusLabel} />
        )
      )}
      {query.hasNextPage && (
        <OrderChangeHistoryLoadMore
          isFetchingNextPage={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
        />
      )}
    </div>
  );
}

export default function OrderHistoryModal({ isOpen, onClose, order }: OrderHistoryModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="سجل الطلبات"
      showFooter={false}
      maxWidth="w-[900px]"
    >
      <div className="py-8 px-4">
        <OrderHistoryList order={order} />
      </div>
    </BaseModal>
  );
}
