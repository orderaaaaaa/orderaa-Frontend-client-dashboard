'use client';

import { useState, type MouseEvent } from 'react';
import { ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { AdjustStockForm } from '@/components/stock/AdjustStockForm';
import { MoveStockForm } from '@/components/stock/MoveStockForm';
import { StockQuantityCell } from '@/components/stock/StockQuantityCell';
import { STOCK_FIELD_CLASS } from '@/components/stock/formStyles';
import { preventEntryGridEscape } from '@/components/stock/useEntryGrid';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { cn } from '@/lib/utils';
import { variantDisplayLabel } from '@/lib/variantOptionLabel';
import { useStockProducts, type StockProductApi, type StockVariantCombination } from '@/services/stock';
import { useDebounce } from '@/utils/debounce';

const PAGE_SIZE = 20;
const SKELETON_ROWS = 5;

interface OperationsProductTableProps {
  warehouseId: number;
  selectedProductId: number | null;
  onSelectProduct(productId: number): void;
  canTransfer: boolean;
  canAdjust: boolean;
}

interface OperationsRow {
  product: StockProductApi;
  variant: StockVariantCombination;
}

type SheetState =
  | { kind: 'move'; row: OperationsRow }
  | { kind: 'adjust'; row: OperationsRow };

export function OperationsProductTable({
  warehouseId,
  selectedProductId,
  onSelectProduct,
  canTransfer,
  canAdjust,
}: OperationsProductTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const stockQuery = useStockProducts({
    warehouseId: String(warehouseId),
    search: debouncedSearch.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const products = stockQuery.data?.data ?? [];
  const rows: OperationsRow[] = products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant }))
  );
  const totalPages = stockQuery.data?.totalPages ?? 1;

  const closeSheet = () => setSheet(null);

  const stopRowClick = (event: MouseEvent<HTMLButtonElement>, open: () => void) => {
    event.stopPropagation();
    open();
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">المنتجات في هذا المخزن</h2>
        <p className="text-sm text-muted-foreground">اضغط على المنتج لعرض مخزونه في كل المخازن وسجله</p>
      </div>

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

      {stockQuery.isError ? (
        <ErrorState
          error={stockQuery.error}
          fallback="تعذر تحميل منتجات المخزن"
          onRetry={() => void stockQuery.refetch()}
        />
      ) : stockQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد متغيرات مطابقة" description="جرّب كلمة بحث أخرى" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2.5 text-start font-medium">
                  المنتج / المتغير
                </th>
                <th scope="col" className="px-3 py-2.5 text-start font-medium">
                  SKU
                </th>
                <th scope="col" className="px-3 py-2.5 text-start font-medium">
                  المتاح في المخزن
                </th>
                <th scope="col" className="px-3 py-2.5 text-end font-medium">
                  <span className="sr-only">الإجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const selected = row.product.id === selectedProductId;
                return (
                  <tr
                    key={row.variant.id}
                    onClick={() => onSelectProduct(row.product.id)}
                    aria-selected={selected}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/40',
                      selected && 'bg-primary/5'
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(row.product.id)}
                        className="block max-w-full break-words text-start font-medium text-foreground hover:text-primary-text"
                      >
                        {row.product.name}
                      </button>
                      {row.variant.options.length > 0 && (
                        <span className="block break-words text-xs text-muted-foreground">
                          {variantDisplayLabel(row.variant.options)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span dir="ltr" className="font-mono text-xs tabular-nums text-muted-foreground">
                        {row.variant.sku ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <StockQuantityCell quantity={row.variant.availableCount} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        {canTransfer && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(event) => stopRowClick(event, () => setSheet({ kind: 'move', row }))}
                          >
                            <ArrowLeftRight aria-hidden="true" />
                            نقل
                          </Button>
                        )}
                        {canAdjust && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(event) => stopRowClick(event, () => setSheet({ kind: 'adjust', row }))}
                          >
                            <SlidersHorizontal aria-hidden="true" />
                            تسوية
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!stockQuery.isError && totalPages > 1 && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={stockQuery.data?.totalItems ?? 0}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage(Math.max(1, page - 1))}
          onNext={() => setPage(Math.min(totalPages, page + 1))}
          currentPageSize={PAGE_SIZE}
        />
      )}

      <BaseModal
        isOpen={sheet !== null}
        onClose={closeSheet}
        title={sheet?.kind === 'move' ? 'نقل المخزون' : 'تسوية المخزون'}
        showFooter={false}
        maxWidth="md:max-w-[720px]"
        onEscapeKeyDown={preventEntryGridEscape}
      >
        {sheet?.kind === 'move' && (
          <MoveStockForm
            fromWarehouseId={warehouseId}
            lines={[
              {
                variantId: sheet.row.variant.id,
                productName: sheet.row.product.name,
                sku: sheet.row.variant.sku ?? null,
                options: sheet.row.variant.options,
                available: sheet.row.variant.availableCount,
              },
            ]}
            onDone={closeSheet}
            onCancel={closeSheet}
          />
        )}
        {sheet?.kind === 'adjust' && (
          <AdjustStockForm
            mode="single"
            warehouseId={warehouseId}
            lines={[
              {
                variantId: sheet.row.variant.id,
                productName: sheet.row.product.name,
                sku: sheet.row.variant.sku ?? null,
                options: sheet.row.variant.options,
                current: sheet.row.variant.availableCount,
              },
            ]}
            onDone={closeSheet}
            onCancel={closeSheet}
          />
        )}
      </BaseModal>
    </section>
  );
}
