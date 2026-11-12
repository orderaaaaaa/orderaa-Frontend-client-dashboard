'use client';

import { useEffect, useState } from 'react';
import type { MoveStockLine } from '@/components/stock/MoveStockForm';
import { STOCK_FIELD_CLASS } from '@/components/stock/formStyles';
import { CARD_SCROLL_CLASS, VariantCards } from '@/components/stock/VariantCards';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';
import type { VariantCard } from '@/lib/api/products';
import { variantCardLabelOf } from '@/lib/variantOptionLabel';
import { cn } from '@/lib/utils';
import { useStockProducts } from '@/services/stock';
import { toStockNumber } from '@/utils/format';
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
  const { t } = useI18n();
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
  const groups = products
    .map((product) => {
      const groupLines: MoveStockLine[] = product.variants.map((variant) => ({
        variantId: variant.id,
        productName: product.name,
        sku: variant.sku ?? null,
        options: variant.options,
        available: variant.availableCount,
      }));
      return {
        id: product.id,
        name: product.name,
        cards: groupLines.map(
          (line): VariantCard => ({
            id: line.variantId,
            label: variantCardLabelOf(line),
            options: [],
          })
        ),
        lines: groupLines,
      };
    })
    .filter((group) => group.lines.length > 0);
  const rows = groups.flatMap((group) => group.lines);
  const rowById = new Map(rows.map((row) => [row.variantId, row]));
  const totalPages = stockQuery.data?.totalPages ?? 1;
  const selectedIds = new Set(lines.map((line) => line.variantId));
  const disabledCardIds = new Set(
    rows
      .filter((row) => disabled || (!selectedIds.has(row.variantId) && row.available <= 0))
      .map((row) => row.variantId)
  );
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
        <div
          key={`${page}:${debouncedSearch}`}
          className="max-h-[60dvh] divide-y divide-border overflow-x-hidden overflow-y-auto rounded-lg border border-border"
        >
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-3 p-3">
              <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
              <VariantCards
                cards={group.cards}
                rows={[]}
                selection={{}}
                selectedCardIds={selectedIds}
                disabledCardIds={disabledCardIds}
                onSelect={(card) => {
                  const row = rowById.get(card.id);
                  if (row) onToggleLine(row);
                }}
                noteOf={(card) => {
                  const row = rowById.get(card.id);
                  return row
                    ? t('orderDetails.stock.available', { count: toStockNumber(row.available) })
                    : null;
                }}
                scrollClassName={CARD_SCROLL_CLASS}
              />
            </div>
          ))}
        </div>
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
