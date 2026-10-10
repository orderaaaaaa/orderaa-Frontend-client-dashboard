import React from 'react';
import { actorTypeLabelOf } from '@/constants/orderSystemFailures';
import { orderChangeOriginLabelOf, orderFieldLabelOf } from '@/constants/orderFieldLabels';
import type { OrderChangeBatch, OrderChangeEntry } from '@/types/orderChangeHistory';
import { getTimeAgo } from '@/utils/timeAgo';
import { OrderChangeValue, isLineValue, lineValueText } from './OrderChangeValue';

const formatDateTime = (value: string) => new Date(value).toLocaleString('ar-EG');

const LINE_KIND_LABELS = {
  LINE_ADDED: 'أُضيف',
  LINE_REMOVED: 'حُذف',
} as const;

function LineMembershipEntry({ entry }: { entry: OrderChangeEntry }) {
  const isAdded = entry.kind === 'LINE_ADDED';
  const value = isAdded ? entry.newValue : entry.oldValue;
  return (
    <li className="text-sm break-words">
      <span className={isAdded ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
        {isAdded ? LINE_KIND_LABELS.LINE_ADDED : LINE_KIND_LABELS.LINE_REMOVED}:
      </span>{' '}
      <span className="text-[#1F1F1F]">
        {isLineValue(value) ? lineValueText(value) : orderFieldLabelOf(entry.field)}
      </span>
    </li>
  );
}

function FieldEntry({
  entry,
  getStatusLabel,
  lineProductNames,
}: {
  entry: OrderChangeEntry;
  getStatusLabel: (status: string) => string;
  lineProductNames: ReadonlyMap<number, string>;
}) {
  const productName =
    entry.kind === 'LINE_CHANGED' && entry.lineId !== null ? lineProductNames.get(entry.lineId) : undefined;
  const label = productName
    ? `${orderFieldLabelOf(entry.field)} (${productName})`
    : orderFieldLabelOf(entry.field);
  return (
    <li className="text-sm break-words">
      <span className="text-gray-600">{label}:</span>{' '}
      <OrderChangeValue
        valueType={entry.valueType}
        value={entry.oldValue}
        getStatusLabel={getStatusLabel}
        className="text-gray-500"
      />
      <span className="mx-1 text-gray-400">←</span>
      <OrderChangeValue
        valueType={entry.valueType}
        value={entry.newValue}
        getStatusLabel={getStatusLabel}
        className="font-semibold text-[#1F1F1F]"
      />
    </li>
  );
}

export interface OrderChangeBatchItemProps {
  batch: OrderChangeBatch;
  getStatusLabel: (status: string) => string;
  lineProductNames: ReadonlyMap<number, string>;
}

export function OrderChangeBatchItem({ batch, getStatusLabel, lineProductNames }: OrderChangeBatchItemProps) {
  const actorLabel = batch.actorName ?? actorTypeLabelOf(batch.actorType) ?? batch.actorType;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="text-sm font-bold text-[#1F1F1F] break-words">{actorLabel}</span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {orderChangeOriginLabelOf(batch.origin)}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatDateTime(batch.createdAt)} ({getTimeAgo(batch.createdAt)})
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {batch.entries.map((entry) =>
          entry.kind === 'LINE_ADDED' || entry.kind === 'LINE_REMOVED' ? (
            <LineMembershipEntry key={entry.id} entry={entry} />
          ) : (
            <FieldEntry
              key={entry.id}
              entry={entry}
              getStatusLabel={getStatusLabel}
              lineProductNames={lineProductNames}
            />
          )
        )}
      </ul>
    </div>
  );
}

export default OrderChangeBatchItem;
