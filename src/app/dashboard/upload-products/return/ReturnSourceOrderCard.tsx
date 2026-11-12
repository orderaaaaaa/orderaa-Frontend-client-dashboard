'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Lock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useI18n } from '@/i18n/I18nProvider';
import { DateWithRelative } from '@/components/ui/date-with-relative';
import { formatMoney } from '@/utils/formatMoney';
import { selectableUnitIdsOf } from '@/utils/customerReturn/selection';
import { customerReturnUnitVariantLabelOf } from '@/utils/customerReturn/returnContent';
import type {
  CustomerReturnSourceOrder,
  CustomerReturnUnit,
} from '@/types/customer-return';

type ReturnSourceOrderCardProps = {
  order: CustomerReturnSourceOrder;
  selectedIds: ReadonlySet<number>;
  onToggleUnit: (orderProductId: number) => void;
  onToggleOrder: (orderProductIds: number[], select: boolean) => void;
};

function StatusBadge({
  status,
}: {
  status: CustomerReturnSourceOrder['status'];
}) {
  const { getStatusLabel } = useStatusLabel();
  const { classes, Icon } = getStatusBadgeConfig(status);
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        classes,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {getStatusLabel(status)}
    </span>
  );
}

function UnitThumbnail({ unit }: { unit: CustomerReturnUnit }) {
  if (!unit.imageUrl) {
    return (
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Package className="size-5" />
      </span>
    );
  }
  return (
    <Image
      src={unit.imageUrl}
      alt={unit.productName ?? unit.sku ?? ''}
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-md border object-cover"
    />
  );
}

function UnitChip({
  unit,
  index,
  selected,
  onToggle,
}: {
  unit: CustomerReturnUnit;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const { t } = useI18n();
  const variantLine =
    customerReturnUnitVariantLabelOf(unit) || unit.variantLabel;
  const detailLine = [unit.productName ? unit.sku : null, variantLine]
    .filter(Boolean)
    .join(' · ');
  const fallbackLine =
    !unit.sku && !unit.variantLabel
      ? t('customerReturn.unit.indexLabel', { index })
      : null;
  const details = (
    <span className="flex min-w-0 flex-col text-start">
      <span className="truncate text-sm font-medium text-foreground">
        {unit.productName ?? unit.sku ?? '—'}
      </span>
      {(detailLine || fallbackLine) && (
        <span
          className={cn(
            'truncate text-xs text-muted-foreground',
            detailLine && 'font-mono',
          )}
        >
          {detailLine || fallbackLine}
        </span>
      )}
      <span className="text-xs text-muted-foreground">
        {formatMoney(String(unit.price))}
      </span>
    </span>
  );

  if (unit.state === 'SELECTABLE') {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onToggle}
        className={cn(
          'flex items-center gap-3 rounded-lg border px-3 py-2 text-start transition-colors',
          selected
            ? 'border-primary bg-primary/10 ring-1 ring-primary'
            : 'border-border bg-card hover:border-primary/50',
        )}
      >
        <Check
          className={cn(
            'size-4 shrink-0 text-primary-text',
            !selected && 'invisible',
          )}
          aria-hidden="true"
        />
        <UnitThumbnail unit={unit} />
        {details}
      </button>
    );
  }

  return (
    <div
      aria-disabled="true"
      className="flex flex-col gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-muted-foreground cursor-not-allowed"
    >
      <div className="flex items-center gap-3">
        <Lock className="size-4 shrink-0" aria-hidden="true" />
        <UnitThumbnail unit={unit} />
        {details}
      </div>
      {unit.holder && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">
            {unit.state === 'IN_EXCHANGE'
              ? t('customerReturn.unit.inExchange')
              : t('customerReturn.unit.inReturn')}
          </span>
          <span dir="ltr" className="font-semibold text-foreground">
            {unit.holder.code}
          </span>
          <StatusBadge status={unit.holder.status} />
        </div>
      )}
    </div>
  );
}

function ReturnSourceOrderCard({
  order,
  selectedIds,
  onToggleUnit,
  onToggleOrder,
}: ReturnSourceOrderCardProps) {
  const { t } = useI18n();
  const selectableIds = selectableUnitIdsOf(order);
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedIds.has(id));

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span dir="ltr" className="font-bold text-foreground">
            {order.code}
          </span>
          <StatusBadge status={order.status} />
          <DateWithRelative value={order.createdAt} className="text-sm text-muted-foreground" />
          {order.shippingCompanyName && (
            <span className="text-sm text-muted-foreground">
              {order.shippingCompanyName}
            </span>
          )}
          {typeof order.settlementAmount === 'string' && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              محصل {order.settlementAmount} جنيه
            </span>
          )}
        </div>
        {selectableIds.length > 0 ? (
          <button
            type="button"
            onClick={() => onToggleOrder(selectableIds, !allSelected)}
            className="text-sm font-medium text-primary-text hover:underline"
          >
            {allSelected
              ? t('customerReturn.unit.clearAll')
              : t('customerReturn.unit.selectAll')}
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {t('customerReturn.unit.noneAvailable')}
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {order.units.map((unit, index) => (
          <UnitChip
            key={unit.orderProductId}
            unit={unit}
            index={index + 1}
            selected={selectedIds.has(unit.orderProductId)}
            onToggle={() => onToggleUnit(unit.orderProductId)}
          />
        ))}
      </div>
    </article>
  );
}

export default ReturnSourceOrderCard;
