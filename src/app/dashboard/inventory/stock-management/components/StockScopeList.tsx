'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  LiaAngleLeftSolid,
  LiaBoxOpenSolid,
  LiaLayerGroupSolid,
  LiaLockSolid,
  LiaWarehouseSolid,
} from 'react-icons/lia';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useVirtualWarehouseSummaryQuery } from '@/services/virtualWarehouses';
import { useWarehouseSummaryQuery } from '@/services/warehouses';
import { getApiErrorMessage } from '@/utils/apiError';
import { STOCK_SCOPE_KINDS, stockScopeHref } from '../constants';
import { formatStockNumber } from '../utils/formatNumber';
import { resolveParentNames, sortScopeEntries } from '../utils/scopeOrder';
import { StockScopeListSkeleton } from './StockScopeListSkeleton';

type Tone = 'total' | 'warning' | 'danger';

interface ScopeRow {
  key: string;
  href: string;
  title: string;
  icon: IconType;
  isVirtual: boolean;
  isInactive: boolean;
  parentName?: string;
  total: number;
  low: number | null;
  out: number;
  shortfall: number | null;
}

function toneClass(value: number, tone: Tone) {
  if (value < 0) return 'text-red-600';
  if (value === 0) return 'text-gray-400';
  if (tone === 'warning') return 'text-amber-600';
  if (tone === 'danger') return 'text-red-600';
  return 'text-gray-900';
}

function MetricLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: Tone;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={clsx('text-base font-bold', toneClass(value, tone))}>
        {formatStockNumber(value)}
      </span>
    </div>
  );
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span
      className={clsx(
        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
    >
      {children}
    </span>
  );
}

function ScopeCard({ row }: { row: ScopeRow }) {
  const Icon = row.icon;
  const parentLabel = row.parentName ? `تابع لـ ${row.parentName}` : null;

  return (
    <li>
      <Link
        href={row.href}
        className={clsx(
          'group flex min-h-14 flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          row.isInactive && 'opacity-70'
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg bg-primary/10 p-2">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-gray-900 group-hover:text-primary md:text-base">
                {row.title}
              </span>
              {row.isVirtual && (
                <Badge className="bg-purple-100 text-purple-700">افتراضي</Badge>
              )}
              {row.isInactive && (
                <Badge className="bg-gray-100 text-gray-600">غير نشط</Badge>
              )}
            </div>
            {parentLabel && (
              <p className="truncate text-xs text-gray-500">{parentLabel}</p>
            )}
          </div>
          <LiaAngleLeftSolid className="size-4 shrink-0 text-gray-400" />
        </div>

        <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
          <MetricLine label="الكمية الكلية" value={row.total} tone="total" />
          {row.low !== null && (
            <MetricLine label="مخزون منخفض" value={row.low} tone="warning" />
          )}
          <MetricLine label="غير متوفر" value={row.out} tone="danger" />
          {row.shortfall !== null && (
            <MetricLine label="العجز" value={row.shortfall} tone="danger" />
          )}
        </div>
      </Link>
    </li>
  );
}

function ListMessage({
  icon: Icon,
  tone = 'neutral',
  message,
  action,
}: {
  icon: IconType;
  tone?: 'neutral' | 'error';
  message: string;
  action?: ReactNode;
}) {
  return (
    <li
      className={clsx(
        'flex min-h-14 flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm',
        tone === 'error' && 'bg-red-50/40'
      )}
    >
      <Icon
        className={clsx(
          'size-6 shrink-0',
          tone === 'error' ? 'text-red-300' : 'text-gray-300'
        )}
      />
      <p
        className={clsx(
          'min-w-0 flex-1 text-sm font-medium',
          tone === 'error' ? 'text-red-500' : 'text-gray-500'
        )}
      >
        {message}
      </p>
      {action}
    </li>
  );
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-10 min-w-10 sm:h-9"
      onClick={onRetry}
    >
      إعادة المحاولة
    </Button>
  );
}

export function StockScopeList() {
  const canReadPhysical = useHasPermission(
    PERMISSION_CODES.WAREHOUSES_STOCK_READ
  );
  const canReadVirtual = useHasPermission(
    PERMISSION_CODES.VIRTUAL_WAREHOUSES_READ
  );
  const physical = useWarehouseSummaryQuery({ enabled: canReadPhysical });
  const virtual = useVirtualWarehouseSummaryQuery({
    enabled: canReadPhysical && canReadVirtual,
  });

  if (!canReadPhysical) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-12 text-gray-400 shadow-sm">
        <LiaLockSolid className="mb-3 size-12" />
        <p className="text-base font-medium text-gray-600">
          ليس لديك صلاحية عرض المخزون
        </p>
        <p className="mt-1 text-sm text-gray-500">
          تواصل مع مسؤول الحساب لمنحك الصلاحية
        </p>
      </div>
    );
  }

  const physicalCards = physical.data ?? [];
  const virtualCards = canReadVirtual ? (virtual.data ?? []) : [];
  const entries = sortScopeEntries(physicalCards, virtualCards);
  const parentNames = resolveParentNames(entries);

  const rows: ScopeRow[] = entries.map((entry) =>
    entry.kind === STOCK_SCOPE_KINDS.PHYSICAL
      ? {
          key: `physical-${entry.card.id}`,
          href: stockScopeHref({
            kind: STOCK_SCOPE_KINDS.PHYSICAL,
            id: entry.card.id,
          }),
          title: entry.card.name,
          icon: LiaWarehouseSolid,
          isVirtual: false,
          isInactive: !entry.card.isActive,
          parentName: parentNames.get(entry.card.id),
          total: entry.card.totalQuantity,
          low: entry.card.lowStockVariantCount,
          out: entry.card.outOfStockVariantCount,
          shortfall: null,
        }
      : {
          key: `virtual-${entry.card.id}`,
          href: stockScopeHref({
            kind: STOCK_SCOPE_KINDS.VIRTUAL,
            id: entry.card.id,
          }),
          title: entry.card.name,
          icon: LiaLayerGroupSolid,
          isVirtual: true,
          isInactive: false,
          total: entry.card.totalQuantity,
          low: null,
          out: entry.card.outOfStockVariantCount,
          shortfall: entry.card.shortfallUnits,
        }
  );

  const virtualEnabled = canReadVirtual;
  const isEmpty =
    physical.isSuccess &&
    physicalCards.length === 0 &&
    (!virtualEnabled || (virtual.isSuccess && virtualCards.length === 0));

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <ScopeCard key={row.key} row={row} />
      ))}
      {physical.isLoading && <StockScopeListSkeleton count={6} />}
      {physical.isError && (
        <ListMessage
          icon={LiaBoxOpenSolid}
          tone="error"
          message={getApiErrorMessage(physical.error, 'تعذر تحميل المخازن')}
          action={<RetryButton onRetry={() => physical.refetch()} />}
        />
      )}
      {virtualEnabled && virtual.isLoading && !physical.isLoading && (
        <StockScopeListSkeleton count={2} />
      )}
      {virtualEnabled && virtual.isError && (
        <ListMessage
          icon={LiaBoxOpenSolid}
          tone="error"
          message={getApiErrorMessage(
            virtual.error,
            'تعذر تحميل المخازن الافتراضية'
          )}
          action={<RetryButton onRetry={() => virtual.refetch()} />}
        />
      )}
      {isEmpty && (
        <ListMessage
          icon={LiaWarehouseSolid}
          message="لا توجد مخازن ظاهرة — تُدار المخازن من قالب المخزون"
        />
      )}
    </ul>
  );
}
