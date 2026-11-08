'use client';

import { DateWithRelative } from '@/components/ui/date-with-relative';
import React, { useMemo } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Order, OrderEvent } from '@/types/orders';
import { PhoneOff, History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { OrderChangeBatchItem } from './ChangeHistory/OrderChangeBatchItem';
import {
  OrderChangeHistoryError,
  OrderChangeHistorySkeleton,
} from './ChangeHistory/OrderChangeHistoryStates';
import { lineProductNamesOf } from './ChangeHistory/lineProductNames';
import { OrderLedgerLifecycleRow } from './Ledger/OrderLedgerLifecycleRow';
import { useOrderLedger } from '@/services/orderLedger';
import { ORDER_LEDGER_ENTRY_KIND, type OrderLedgerEntry } from '@/types/orderLedger';
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
      return <History className="w-4 h-4 text-primary-text" />;
    default:
      return <History className="w-4 h-4 text-gray-600" />;
  }
};

function OrderEventRow({
  event,
  getStatusLabel,
  withTime,
}: {
  event: OrderEvent;
  getStatusLabel: (status: string) => string;
  withTime: boolean;
}) {
  const statusLabel = event.name
    ? (orderEventLabelOf(event.name) ?? getStatusLabel(event.name))
    : 'حدث';
  const note = event.note || statusLabel;

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 shrink-0 rounded-full bg-card flex items-center justify-center border-[3px] border-primary/40">
        {getEventIcon(event.name || 'default')}
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="text-base font-semibold text-foreground break-words">{statusLabel}</h3>
        {note !== statusLabel && <p className="text-sm text-primary-text break-words">{note}</p>}
        <p className="text-sm text-muted-foreground">
          <DateWithRelative value={event.createdAt} withTime={withTime} variant="inline" />
        </p>
      </div>
    </div>
  );
}

function renderLedgerEntry(
  entry: OrderLedgerEntry,
  getStatusLabel: (status: string) => string,
  lineProductNames: ReadonlyMap<number, string>
) {
  if (entry.kind === ORDER_LEDGER_ENTRY_KIND.EVENT && entry.event) {
    return (
      <OrderEventRow
        key={entry.key}
        event={entry.event}
        getStatusLabel={getStatusLabel}
        withTime
      />
    );
  }
  if (entry.kind === ORDER_LEDGER_ENTRY_KIND.CHANGE && entry.change) {
    return (
      <OrderChangeBatchItem
        key={entry.key}
        batch={entry.change}
        getStatusLabel={getStatusLabel}
        lineProductNames={lineProductNames}
      />
    );
  }
  if (entry.lifecycle) {
    return <OrderLedgerLifecycleRow key={entry.key} entry={entry} />;
  }
  return null;
}

function OrderHistoryList({ order, isOpen }: { order: Order; isOpen: boolean }) {
  const { getStatusLabel } = useStatusLabel();
  const ledger = useOrderLedger(order.id, isOpen);
  const lineProductNames = useMemo(() => lineProductNamesOf(order), [order]);
  const entries = ledger.data?.entries ?? [];

  return (
    <div className="flex flex-col gap-4">
      {ledger.isLoading && <OrderChangeHistorySkeleton />}
      {ledger.isError && (
        <OrderChangeHistoryError
          isRefetching={ledger.isRefetching}
          onRetry={() => ledger.refetch()}
        />
      )}
      {ledger.data && !ledger.data.changesVisible && (
        <p className="text-sm text-muted-foreground">سجل تعديل الحقول يحتاج صلاحية عرض السجل</p>
      )}
      {ledger.data && entries.length === 0 && (
        <div className="text-center text-gray-500 py-8">لا توجد أحداث لهذا الطلب</div>
      )}
      {entries.map((entry) => renderLedgerEntry(entry, getStatusLabel, lineProductNames))}
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
        <OrderHistoryList order={order} isOpen={isOpen} />
      </div>
    </BaseModal>
  );
}
