'use client';

import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  LiaBoxOpenSolid,
  LiaLayerGroupSolid,
  LiaWarehouseSolid,
  LiaStoreAltSolid,
} from 'react-icons/lia';
import clsx from 'clsx';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useVirtualWarehouseSummaryQuery } from '@/services/virtualWarehouses';
import { useWarehouseSummaryQuery } from '@/services/warehouses';
import { getApiErrorMessage } from '@/utils/apiError';
import { STOCK_SCOPE_KINDS, stockScopeHref } from '../constants';
import { StockScopeCardsSkeleton } from './StockScopeCardsSkeleton';

interface CardMetric {
  label: string;
  value: number;
  tone?: 'default' | 'warning' | 'danger';
}

interface ScopeCardProps {
  href: string;
  title: string;
  icon: IconType;
  badge?: string;
  description?: string;
  metrics: CardMetric[];
}

const formatNumber = (value: number) => value.toLocaleString('ar-EG');

function ScopeCard({
  href,
  title,
  icon: Icon,
  badge,
  description,
  metrics,
}: ScopeCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="size-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-gray-900 group-hover:text-primary">
            {title}
          </p>
          {description && (
            <p className="truncate text-xs text-gray-500">{description}</p>
          )}
        </div>
        {badge && (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            {badge}
          </span>
        )}
      </div>
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-xs text-gray-500">{metric.label}</p>
              <p
                className={clsx(
                  'text-xl font-bold',
                  metric.value < 0 || metric.tone === 'danger'
                    ? 'text-red-600'
                    : metric.tone === 'warning'
                      ? 'text-amber-600'
                      : 'text-gray-900'
                )}
              >
                {formatNumber(metric.value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}

function SectionError({ error, fallback }: { error: unknown; fallback: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/40 py-8 text-gray-400">
      <LiaBoxOpenSolid className="mb-2 size-10 text-red-300" />
      <p className="text-sm font-medium text-red-500">
        {getApiErrorMessage(error, fallback)}
      </p>
    </div>
  );
}

export function StockScopeCards() {
  const canReadVirtual = useHasPermission(
    PERMISSION_CODES.VIRTUAL_WAREHOUSES_READ
  );
  const physical = useWarehouseSummaryQuery();
  const virtual = useVirtualWarehouseSummaryQuery({ enabled: canReadVirtual });

  const physicalCards = physical.data ?? [];
  const virtualCards = canReadVirtual ? (virtual.data ?? []) : [];
  const isEmpty =
    physical.isSuccess &&
    physicalCards.length === 0 &&
    (!canReadVirtual || (virtual.isSuccess && virtualCards.length === 0));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ScopeCard
          href={stockScopeHref({ kind: STOCK_SCOPE_KINDS.ALL })}
          title="كل المخازن"
          description="إجمالي المخزون في جميع المخازن"
          icon={LiaStoreAltSolid}
          metrics={[]}
        />
        {physicalCards.map((card) => (
          <ScopeCard
            key={`physical-${card.id}`}
            href={stockScopeHref({
              kind: STOCK_SCOPE_KINDS.PHYSICAL,
              id: card.id,
            })}
            title={card.name}
            description={card.isActive ? undefined : 'غير نشط'}
            icon={LiaWarehouseSolid}
            metrics={[
              { label: 'الكمية الكلية', value: card.totalQuantity },
              {
                label: 'مخزون منخفض',
                value: card.lowStockVariantCount,
                tone: 'warning',
              },
              {
                label: 'غير متوفر',
                value: card.outOfStockVariantCount,
                tone: 'danger',
              },
            ]}
          />
        ))}
      </div>

      {physical.isLoading && <StockScopeCardsSkeleton count={3} />}
      {physical.isError && (
        <SectionError error={physical.error} fallback="تعذر تحميل المخازن" />
      )}

      {canReadVirtual && virtual.isLoading && (
        <StockScopeCardsSkeleton count={3} />
      )}
      {canReadVirtual && virtual.isError && (
        <SectionError
          error={virtual.error}
          fallback="تعذر تحميل المخازن الافتراضية"
        />
      )}
      {virtualCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {virtualCards.map((card) => (
            <ScopeCard
              key={`virtual-${card.id}`}
              href={stockScopeHref({
                kind: STOCK_SCOPE_KINDS.VIRTUAL,
                id: card.id,
              })}
              title={card.name}
              badge="افتراضي"
              icon={LiaLayerGroupSolid}
              metrics={[
                { label: 'الكمية الكلية', value: card.totalQuantity },
                {
                  label: 'غير متوفر',
                  value: card.outOfStockVariantCount,
                  tone: 'warning',
                },
                {
                  label: 'العجز',
                  value: card.shortfallUnits,
                  tone: card.shortfallUnits > 0 ? 'danger' : 'default',
                },
              ]}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <LiaWarehouseSolid className="mb-4 size-14" />
          <p className="text-lg font-medium text-gray-500">لا توجد مخازن ظاهرة</p>
        </div>
      )}
    </div>
  );
}
