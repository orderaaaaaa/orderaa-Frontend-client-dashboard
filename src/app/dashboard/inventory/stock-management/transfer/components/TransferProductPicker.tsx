'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { MoveStockLine } from '@/components/stock/MoveStockForm';
import { StockQuantityCell } from '@/components/stock/StockQuantityCell';
import { VariantLabel } from '@/components/stock/VariantLabel';
import { STOCK_FIELD_CLASS } from '@/components/stock/formStyles';
import { Button } from '@/components/ui/button';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { cn } from '@/lib/utils';
import { useStockProducts } from '@/services/stock';
import { useDebounce } from '@/utils/debounce';

const PAGE_SIZE = 20;
const SKELETON_ROWS = 5;

interface TransferProductPickerProps {
  warehouseId: number;
  lines: MoveStockLine[];
  disabled: boolean;
  onToggleLine(line: MoveStockLine): void;
}

export function TransferProductPicker({
  warehouseId,
  lines,
  disabled,
  onToggleLine,
}: TransferProductPickerProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const stockQuery = useStockProducts({
    warehouseId: String(warehouseId),
    search: debouncedSearch.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const products = stockQuery.data?.data ?? [];
  const rows: MoveStockLine[] = products.flatMap((product) =>
    product.variants.map((variant) => ({
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku ?? null,
      options: variant.options,
      available: variant.availableCount,
    }))
  );
  const totalPages = stockQuery.data?.totalPages ?? 1;
  const selectedIds = new Set(lines.map((line) => line.variantId));
  const hasSearch = debouncedSearch.trim() !== '';

  useEffect(() => {
    if (stockQuery.data && page > totalPages) {
      setPage(Math.max(1, Math.min(page, totalPages)));
    }
  }, [page, totalPages, stockQuery.data]);

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <h2 className="text-base font-semibold text-foreground">المنتجات في هذا المخزن</h2>

      <input
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="ابحث باسم المنتج"
        aria-label="ابحث باسم المنتج"
        className={cn(STOCK_FIELD_CLASS, 'md:max-w-md')}
      />

      {stockQuery.isError && !stockQuery.data ? (
        <ErrorState
          error={stockQuery.error}
          fallback="تعذر تحميل منتجات المخزن"
          onRetry={() => void stockQuery.refetch()}
        />
      ) : stockQuery.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        hasSearch ? (
          <EmptyState title="لا توجد متغيرات مطابقة" description="جرّب كلمة بحث أخرى" />
        ) : (
          <EmptyState
            title="لا توجد متغيرات في هذا المخزن"
            description="لا يوجد مخزون متاح للنقل في هذا المخزن"
          />
        )
      ) : (
        <ul
          key={`${page}:${debouncedSearch}`}
          className="max-h-[60dvh] divide-y divide-border overflow-x-hidden overflow-y-auto rounded-lg border border-border"
        >
          {rows.map((row) => {
            const selected = selectedIds.has(row.variantId);
            return (
              <li
                key={row.variantId}
                className={cn('flex items-center gap-3 px-3 py-2.5', selected && 'bg-primary/5')}
              >
                <div className="min-w-0 flex-1">
                  <VariantLabel productName={row.productName} sku={row.sku} options={row.options} size="sm" />
                </div>
                <StockQuantityCell quantity={row.available} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={disabled || (!selected && row.available <= 0)}
                  onClick={() => onToggleLine(row)}
                >
                  {selected ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
                  {selected ? 'إزالة' : 'إضافة'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {stockQuery.data && totalPages > 1 && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={stockQuery.data.totalItems ?? 0}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage(Math.max(1, page - 1))}
          onNext={() => setPage(Math.min(totalPages, page + 1))}
          currentPageSize={PAGE_SIZE}
        />
      )}
    </section>
  );
}
