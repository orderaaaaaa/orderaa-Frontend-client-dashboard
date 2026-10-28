'use client';

import { useMemo, useState } from 'react';
import { Boxes, PackageX, SlidersHorizontal, Warehouse, X } from 'lucide-react';
import { AdjustStockForm, type AdjustStockGroup } from '@/components/stock/AdjustStockForm';
import { StockQuantityCell } from '@/components/stock/StockQuantityCell';
import { StockTimeline } from '@/components/stock/StockTimeline';
import { MOVEMENT_SOURCE_LABELS } from '@/components/stock/stockLabels';
import BaseModal from '@/components/ui/base-modal';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui/kpi-card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { ALL_WAREHOUSES_OPTION } from '@/constants/warehouses';
import type { ProductStockDto } from '@/lib/api/productStock';
import type { StockMovementSource, StockTimelineQueryParams } from '@/lib/api/warehouses';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useProductStockQuery, useStockTimelineQuery, useStockWarehouseOptions } from '@/services/productStock';
import { calculateDateRangeFromPeriod, type TimePeriod } from '@/utils/dateRangeUtils';
import { formatNumber } from '@/utils/format';

const TIMELINE_PAGE_SIZE = 50;
const SOURCE_OPTIONS = [
  { key: '', value: 'كل المصادر' },
  ...(Object.keys(MOVEMENT_SOURCE_LABELS) as StockMovementSource[]).map((source) => ({
    key: source,
    value: MOVEMENT_SOURCE_LABELS[source],
  })),
];
const HIDDEN_WAREHOUSE_LABEL = 'مخزن غير ظاهر';

interface OperationsProductPanelProps {
  productId: number;
  variantId: number | null;
  onVariantChange(variantId: number | null): void;
  onClose(): void;
  canAdjust: boolean;
  canHistory: boolean;
}

export function OperationsProductPanel({
  productId,
  variantId,
  onVariantChange,
  onClose,
  canAdjust,
  canHistory,
}: OperationsProductPanelProps) {
  const stockQuery = useProductStockQuery(productId);

  if (stockQuery.isError) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 md:p-5">
        <ErrorState
          error={stockQuery.error}
          fallback="تعذر تحميل مخزون المنتج"
          onRetry={() => void stockQuery.refetch()}
        />
      </section>
    );
  }

  if (stockQuery.isLoading || !stockQuery.data) {
    return (
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
        <Skeleton className="h-7 w-1/3" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }

  return (
    <ProductPanelBody
      key={productId}
      stock={stockQuery.data}
      productId={productId}
      variantId={variantId}
      onVariantChange={onVariantChange}
      onClose={onClose}
      canAdjust={canAdjust}
      canHistory={canHistory}
    />
  );
}

interface ProductPanelBodyProps {
  stock: ProductStockDto;
  productId: number;
  variantId: number | null;
  onVariantChange(variantId: number | null): void;
  onClose(): void;
  canAdjust: boolean;
  canHistory: boolean;
}

function ProductPanelBody({
  stock,
  productId,
  variantId,
  onVariantChange,
  onClose,
  canAdjust,
  canHistory,
}: ProductPanelBodyProps) {
  const [batchOpen, setBatchOpen] = useState(false);
  const [source, setSource] = useState<StockMovementSource | ''>('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | ''>('');
  const canWarehouseFilter = useHasPermissionStrict(PERMISSION_CODES.WAREHOUSES_STOCK_READ);
  const { options: warehouseOptions } = useStockWarehouseOptions({ enabled: canWarehouseFilter });

  const timelineParams: StockTimelineQueryParams | null = canHistory
    ? {
        ...(variantId !== null ? { variantId } : { productId }),
        ...(warehouseFilter ? { warehouseId: Number(warehouseFilter) } : {}),
        ...(source ? { source } : {}),
        ...(fromDate ? { from: fromDate.toISOString() } : {}),
        ...(toDate ? { to: toDate.toISOString() } : {}),
        limit: TIMELINE_PAGE_SIZE,
      }
    : null;
  const timeline = useStockTimelineQuery(timelineParams);
  const timelineRows = timeline.data?.pages.flatMap((page) => page.data) ?? [];

  const batchGroups = useMemo<AdjustStockGroup[]>(
    () =>
      stock.warehouses
        .filter((warehouse) => warehouse.visibleToMerchant && warehouse.isActive)
        .map((warehouse) => ({
          warehouseId: warehouse.id,
          warehouseName: warehouse.name ?? '',
          lines: stock.variants.map((variant) => ({
            variantId: variant.variantId,
            label: variant.variantLabel || stock.product.name,
            current:
              variant.byWarehouse.find((cell) => cell.warehouseId === warehouse.id)?.quantity ?? 0,
          })),
        })),
    [stock]
  );

  const onFromDateChange = (date: Date | null) => {
    setFromDate(date);
    setTimePeriod('');
  };

  const onToDateChange = (date: Date | null) => {
    setToDate(date);
    setTimePeriod('');
  };

  const onTimePeriodChange = (period: TimePeriod | '') => {
    setTimePeriod(period);
    if (!period) {
      setFromDate(null);
      setToDate(null);
      return;
    }
    const range = calculateDateRangeFromPeriod(period);
    setFromDate(range?.from ?? null);
    setToDate(range?.to ?? null);
  };

  const variantOptions = [
    { key: '', value: 'كل المتغيرات' },
    ...stock.variants.map((variant) => ({
      key: String(variant.variantId),
      value: variant.variantLabel || stock.product.name,
    })),
  ];

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 md:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold text-foreground">{stock.product.name}</h2>
          <p className="text-sm text-muted-foreground">المخزون في كل المخازن وسجل الحركات</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {canAdjust && batchGroups.length > 0 && stock.variants.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setBatchOpen(true)}>
              <SlidersHorizontal aria-hidden="true" />
              تسوية عدة مخازن
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" aria-label="إغلاق اللوحة" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="إجمالي الكمية"
          value={formatNumber(stock.summary.totalQuantity)}
          icon={<Boxes className="size-5" aria-hidden="true" />}
          accent="primary"
        />
        <KpiCard
          label="مخازن بها مخزون"
          value={formatNumber(stock.summary.warehousesWithStock)}
          icon={<Warehouse className="size-5" aria-hidden="true" />}
          accent="chart2"
        />
        <KpiCard
          label="متغيرات نافدة"
          value={formatNumber(stock.summary.outOfStockVariants)}
          icon={<PackageX className="size-5" aria-hidden="true" />}
          accent="chart5"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">المخزون حسب المخزن</h3>
        {stock.variants.length === 0 ? (
          <EmptyState title="لا توجد متغيرات لهذا المنتج" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">
                    المتغير
                  </th>
                  {stock.warehouses.map((warehouse) => (
                    <th key={warehouse.id} scope="col" className="px-3 py-2.5 text-start font-medium">
                      <span className="break-words">{warehouse.name ?? HIDDEN_WAREHOUSE_LABEL}</span>
                      {!warehouse.isActive && (
                        <span className="block text-xs font-normal text-muted-foreground">غير نشط</span>
                      )}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stock.variants.map((variant) => (
                  <tr key={variant.variantId}>
                    <td className="px-3 py-2.5">
                      <span className="block break-words text-foreground">{variant.variantLabel || stock.product.name}</span>
                      {variant.sku && (
                        <span dir="ltr" className="font-mono text-xs text-muted-foreground">
                          {variant.sku}
                        </span>
                      )}
                    </td>
                    {stock.warehouses.map((warehouse) => (
                      <td key={warehouse.id} className="px-3 py-2.5">
                        <StockQuantityCell
                          quantity={
                            variant.byWarehouse.find((cell) => cell.warehouseId === warehouse.id)?.quantity ?? 0
                          }
                          tone="muted"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <StockQuantityCell quantity={variant.totalQuantity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">سجل الحركات</h3>
        {canHistory ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <SearchableSelect
                options={variantOptions}
                value={variantId === null ? '' : String(variantId)}
                onValueChange={(value) => onVariantChange(value ? Number(value) : null)}
                placeholder="كل المتغيرات"
              />
              <SearchableSelect
                options={SOURCE_OPTIONS}
                value={source}
                onValueChange={(value) => setSource(value as StockMovementSource | '')}
                placeholder="كل المصادر"
              />
              {canWarehouseFilter && (
                <SearchableSelect
                  options={[ALL_WAREHOUSES_OPTION, ...warehouseOptions]}
                  value={warehouseFilter}
                  onValueChange={setWarehouseFilter}
                  placeholder="كل المخازن"
                />
              )}
            </div>
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              timePeriod={timePeriod}
              onFromDateChange={onFromDateChange}
              onToDateChange={onToDateChange}
              onTimePeriodChange={onTimePeriodChange}
              className="!justify-start"
            />
            {timeline.isError ? (
              <ErrorState
                error={timeline.error}
                fallback="تعذر تحميل سجل الحركات"
                onRetry={() => void timeline.refetch()}
              />
            ) : (
              <StockTimeline
                rows={timelineRows}
                hasNext={timeline.hasNextPage ?? false}
                isLoading={timeline.isLoading}
                isLoadingMore={timeline.isFetchingNextPage}
                onLoadMore={() => void timeline.fetchNextPage()}
              />
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">ليس لديك صلاحية عرض سجل الحركات.</p>
        )}
      </div>

      {canAdjust && batchGroups.length > 0 && (
        <BaseModal
          isOpen={batchOpen}
          onClose={() => setBatchOpen(false)}
          title="تسوية المخزون عبر عدة مخازن"
          showFooter={false}
          maxWidth="md:max-w-[880px]"
        >
          {batchOpen && (
            <AdjustStockForm
              mode="batch"
              groups={batchGroups}
              onDone={() => setBatchOpen(false)}
              onCancel={() => setBatchOpen(false)}
            />
          )}
        </BaseModal>
      )}
    </section>
  );
}
