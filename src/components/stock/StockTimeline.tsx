'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { ActorChip } from '@/components/audit/ActorChip';
import { OrderChip } from '@/components/stock/OrderChip';
import {
  MOVEMENT_SOURCE_LABELS,
  MOVEMENT_SOURCE_MARKER_CLASSES,
  REFERENCE_TYPE_LABELS,
  STOCK_ADJUSTMENT_REASON_LABELS,
} from '@/components/stock/stockLabels';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { StockTimelineReferenceDto, StockTimelineRowDto, StockTimelineWarehouseDto } from '@/lib/api/warehouses';
import { formatNumber, formatTime } from '@/utils/format';

interface StockTimelineProps {
  rows: StockTimelineRowDto[];
  hasNext: boolean;
  isLoading: boolean;
  isLoadingMore?: boolean;
  onLoadMore(): void;
}

interface DayGroup {
  key: string;
  label: string;
  rows: StockTimelineRowDto[];
}

interface QuantityView {
  magnitude: number;
  sign: '+' | '-' | '';
  tone: string;
}

const dayKeyOf = (iso: string) => format(new Date(iso), 'yyyy-MM-dd');

const dayLabelOf = (iso: string) => format(new Date(iso), 'd MMMM yyyy', { locale: ar });

const groupByDay = (rows: StockTimelineRowDto[]): DayGroup[] => {
  const groups: DayGroup[] = [];
  rows.forEach((row) => {
    const key = dayKeyOf(row.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.rows.push(row);
    } else {
      groups.push({ key, label: dayLabelOf(row.createdAt), rows: [row] });
    }
  });
  return groups;
};

const quantityViewOf = (row: StockTimelineRowDto): QuantityView => {
  const magnitude = Math.abs(row.quantity);
  if (row.source === 'ADJUSTMENT') {
    if (row.quantity > 0) return { magnitude, sign: '+', tone: 'text-success' };
    if (row.quantity < 0) return { magnitude, sign: '-', tone: 'text-destructive' };
    return { magnitude, sign: '', tone: 'text-muted-foreground' };
  }
  switch (row.direction) {
    case 'IN':
      return { magnitude, sign: '+', tone: 'text-success' };
    case 'OUT':
      return { magnitude, sign: '-', tone: 'text-destructive' };
    case 'ZERO':
      return { magnitude: 0, sign: '', tone: 'text-muted-foreground' };
    default:
      return { magnitude, sign: '', tone: 'text-foreground' };
  }
};

function WarehouseSide({
  label,
  warehouse,
  balance,
}: {
  label: string;
  warehouse: StockTimelineWarehouseDto;
  balance: number | null;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span>{label}</span>
      <span className="font-medium text-foreground">{warehouse.name}</span>
      {balance !== null && (
        <span className="text-xs">
          رصيد{' '}
          <span dir="ltr" className="font-semibold tabular-nums text-foreground">
            {formatNumber(balance)}
          </span>
        </span>
      )}
    </span>
  );
}

function WarehouseFlow({ row }: { row: StockTimelineRowDto }) {
  if (!row.fromWarehouse && !row.toWarehouse) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      {row.fromWarehouse && (
        <WarehouseSide label="من" warehouse={row.fromWarehouse} balance={row.fromBalanceAfter} />
      )}
      {row.fromWarehouse && row.toWarehouse && (
        <ArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
      )}
      {row.toWarehouse && (
        <WarehouseSide label="إلى" warehouse={row.toWarehouse} balance={row.toBalanceAfter} />
      )}
    </div>
  );
}

function ReferenceLabel({ reference }: { reference: StockTimelineReferenceDto }) {
  const text = reference.label ?? REFERENCE_TYPE_LABELS[reference.type] ?? reference.type;
  if (!reference.href) {
    return <span className="text-xs text-muted-foreground">{text}</span>;
  }
  return (
    <Link href={reference.href} className="text-xs font-medium text-primary hover:underline">
      {text}
    </Link>
  );
}

function TimelineRow({ row }: { row: StockTimelineRowDto }) {
  const quantity = quantityViewOf(row);
  const hasVariantLine = row.variant.label !== '' && row.variant.label !== row.variant.productName;

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-2 shrink-0 rounded-full bg-current', MOVEMENT_SOURCE_MARKER_CLASSES[row.source])}
          />
          <span className="text-sm font-semibold text-foreground">{MOVEMENT_SOURCE_LABELS[row.source]}</span>
          {row.reason && (
            <span className="text-xs text-muted-foreground">{STOCK_ADJUSTMENT_REASON_LABELS[row.reason]}</span>
          )}
          <span dir="ltr" className="text-xs tabular-nums text-muted-foreground">
            #{row.id}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">{formatTime(row.createdAt)}</span>
        </div>
        <span dir="ltr" className={cn('text-base font-bold tabular-nums', quantity.tone)}>
          {quantity.sign}
          {formatNumber(quantity.magnitude)}
        </span>
      </div>

      <div className="flex min-w-0 flex-col">
        <span className="break-words text-sm text-foreground">{row.variant.productName}</span>
        {hasVariantLine && (
          <span className="break-words text-xs text-muted-foreground">{row.variant.label}</span>
        )}
      </div>

      <WarehouseFlow row={row} />

      <div className="flex flex-wrap items-center gap-2">
        <ActorChip actor={row.actor} />
        <OrderChip order={row.order} />
        <ReferenceLabel reference={row.reference} />
      </div>

      {row.note && <p className="text-xs text-muted-foreground">{row.note}</p>}
    </li>
  );
}

export function StockTimeline({ rows, hasNext, isLoading, isLoadingMore = false, onLoadMore }: StockTimelineProps) {
  const groups = useMemo(() => groupByDay(rows), [rows]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="لا توجد حركات مخزون" description="ستظهر الحركات هنا بعد أول عملية على المنتج" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col">
          <h3 className="sticky top-0 z-[1] bg-card py-2 text-xs font-semibold text-muted-foreground">
            {group.label}
          </h3>
          <ul className="flex flex-col divide-y divide-border">
            {group.rows.map((row) => (
              <TimelineRow key={row.id} row={row} />
            ))}
          </ul>
        </section>
      ))}
      {hasNext && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={onLoadMore} loading={isLoadingMore}>
            تحميل المزيد
          </Button>
        </div>
      )}
    </div>
  );
}
