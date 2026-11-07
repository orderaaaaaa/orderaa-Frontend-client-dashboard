'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Boxes, PackageX, SlidersHorizontal, Warehouse } from 'lucide-react';
import { AdjustStockForm, type AdjustStockGroup } from '@/components/stock/AdjustStockForm';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { StockTimeline } from '@/components/stock/StockTimeline';
import { preventEntryGridEscape } from '@/components/stock/useEntryGrid';
import { MOVEMENT_SOURCE_LABELS } from '@/components/stock/stockLabels';
import BaseModal from '@/components/ui/base-modal';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui/kpi-card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import { ALL_WAREHOUSES_OPTION } from '@/constants/warehouses';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import type { ProductStockDto } from '@/lib/api/productStock';
import type { StockMovementSource, StockTimelineQueryParams } from '@/lib/api/warehouses';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useProductStockQuery, useStockTimelineQuery, useStockWarehouseOptions } from '@/services/productStock';
import { calculateDateRangeFromPeriod, type TimePeriod } from '@/utils/dateRangeUtils';
import { formatStockNumber } from '@/utils/format';
import { STOCK_MANAGEMENT_BASE_PATH } from '../../../constants';
import { parsePositiveId } from '../../../utils/parsePositiveId';
import { AdjustVariantDialog } from './AdjustVariantDialog';
import { ProductWarehouseStock } from './ProductWarehouseStock';

const TIMELINE_PAGE_SIZE = 50;
const SOURCE_OPTIONS = [
  { key: '', value: 'كل المصادر' },
  ...(Object.keys(MOVEMENT_SOURCE_LABELS) as StockMovementSource[]).map((source) => ({
    key: source,
    value: MOVEMENT_SOURCE_LABELS[source],
  })),
];
const STOCK_PRODUCT_BREADCRUMBS = [
  { label: 'إدارة المخزن', href: STOCK_MANAGEMENT_BASE_PATH },
  { label: 'مخزون المنتج' },
];

interface ProductStockContentProps {
  productId: number;
}

export function ProductStockContent({ productId }: ProductStockContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variantId = parsePositiveId(searchParams.get('variantId'));
  const canAdjust = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_ADJUST);
  const canHistory = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_HISTORY_READ);
  const stockQuery = useProductStockQuery(productId);

  const onVariantChange = (id: number | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id === null) {
      next.delete('variantId');
    } else {
      next.set('variantId', String(id));
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (stockQuery.isError && !stockQuery.data) {
    return (
      <>
        <StockPageHeader title="مخزون المنتج" breadcrumbs={STOCK_PRODUCT_BREADCRUMBS} />
        <section className="rounded-xl border border-border bg-card p-4 md:p-5">
          <ErrorState
            error={stockQuery.error}
            fallback="تعذر تحميل مخزون المنتج"
            onRetry={() => void stockQuery.refetch()}
          />
        </section>
      </>
    );
  }

  if (stockQuery.isLoading || !stockQuery.data) {
    return (
      <>
        <StockPageHeader title="مخزون المنتج" breadcrumbs={STOCK_PRODUCT_BREADCRUMBS} />
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
          <Skeleton className="h-7 w-1/3" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </section>
      </>
    );
  }

  return (
    <ProductPanelBody
      stock={stockQuery.data}
      productId={productId}
      variantId={variantId}
      onVariantChange={onVariantChange}
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
  canAdjust: boolean;
  canHistory: boolean;
}

function ProductPanelBody({
  stock,
  productId,
  variantId,
  onVariantChange,
  canAdjust,
  canHistory,
}: ProductPanelBodyProps) {
  const [batchOpen, setBatchOpen] = useState(false);
  const [targetVariantId, setTargetVariantId] = useState<number | null>(null);
  const [source, setSource] = useState<StockMovementSource | ''>('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | ''>('');
  const canReadWarehouses = useHasPermissionStrict(PERMISSION_CODES.WAREHOUSES_STOCK_READ);
  const warehouses = useStockWarehouseOptions({ enabled: canReadWarehouses });

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
            productName: stock.product.name,
            sku: variant.sku,
            options: variant.options,
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
    <>
      <StockPageHeader
        title={stock.product.name}
        subtitle="المخزون في كل المخازن وسجل الحركات"
        breadcrumbs={STOCK_PRODUCT_BREADCRUMBS}
        actions={
          canAdjust && batchGroups.length > 0 && stock.variants.length > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setBatchOpen(true)}>
              <SlidersHorizontal aria-hidden="true" />
              تسوية عدة مخازن
            </Button>
          ) : undefined
        }
      />

      <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label="إجمالي الكمية"
            value={formatStockNumber(stock.summary.totalQuantity)}
            icon={<Boxes className="size-5" aria-hidden="true" />}
            accent="primary"
          />
          <KpiCard
            label="مخازن بها مخزون"
            value={formatStockNumber(stock.summary.warehousesWithStock)}
            icon={<Warehouse className="size-5" aria-hidden="true" />}
            accent="chart2"
          />
          <KpiCard
            label="متغيرات نافدة"
            value={formatStockNumber(stock.summary.outOfStockVariants)}
            icon={<PackageX className="size-5" aria-hidden="true" />}
            accent="chart5"
          />
        </div>

        <ProductWarehouseStock
          stock={stock}
          canAdjustRow={canAdjust && canReadWarehouses}
          onAdjust={(id) => setTargetVariantId(id)}
        />

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
                {canReadWarehouses && (
                  <SearchableSelect
                    options={[ALL_WAREHOUSES_OPTION, ...warehouses.options]}
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
            onEscapeKeyDown={preventEntryGridEscape}
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

        {targetVariantId !== null && (
          <AdjustVariantDialog
            key={targetVariantId}
            stock={stock}
            variantId={targetVariantId}
            warehouses={warehouses}
            onClose={() => setTargetVariantId(null)}
          />
        )}
      </section>
    </>
  );
}
