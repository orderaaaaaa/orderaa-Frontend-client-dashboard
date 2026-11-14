'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { STOCK_FIELD_CLASS } from '@/components/stock/formStyles';
import { CARD_SCROLL_CLASS, VariantCards } from '@/components/stock/VariantCards';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import type { VariantCard } from '@/lib/api/products';
import { cn } from '@/lib/utils';
import { variantCardLabelOf } from '@/lib/variantOptionLabel';
import {
  useStockProducts,
  type StockProductApi,
  type StockVariantCombination,
} from '@/services/stock';
import { useDebounce } from '@/utils/debounce';

const PAGE_SIZE = 20;
const SKELETON_ROWS = 5;

export interface StockVariantPickerLabels {
  heading: string;
  searchLabel: string;
  searchPlaceholder: string;
  errorFallback: string;
  emptyTitle: string;
  emptyDescription: string;
  noMatchTitle: string;
  noMatchDescription: string;
}

interface StockVariantPickerProps {
  warehouseId?: number;
  selectedIds: ReadonlySet<number>;
  labels: StockVariantPickerLabels;
  scrollClassName: string;
  cardsScrollClassName?: string;
  isCardDisabled?(variant: StockVariantCombination, product: StockProductApi): boolean;
  noteOf?(variant: StockVariantCombination, product: StockProductApi): string | null;
  onToggle(variant: StockVariantCombination, product: StockProductApi): void;
  productAction?(product: StockProductApi): ReactNode;
}

export function StockVariantPicker({
  warehouseId,
  selectedIds,
  labels,
  scrollClassName,
  cardsScrollClassName,
  isCardDisabled,
  noteOf,
  onToggle,
  productAction,
}: StockVariantPickerProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const stockQuery = useStockProducts({
    ...(warehouseId === undefined ? {} : { warehouseId: String(warehouseId) }),
    search: debouncedSearch.trim() || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const products = stockQuery.data?.data ?? [];
  const groups = products.filter((product) => product.variants.length > 0);
  const entries = groups.flatMap((product) =>
    product.variants.map((variant) => ({ variant, product }))
  );
  const entryById = new Map(entries.map((entry) => [entry.variant.id, entry]));
  const disabledCardIds = new Set(
    entries
      .filter(({ variant, product }) => isCardDisabled?.(variant, product) ?? false)
      .map(({ variant }) => variant.id)
  );
  const totalPages = stockQuery.data?.totalPages ?? 1;
  const hasSearch = debouncedSearch.trim() !== '';

  useEffect(() => {
    if (stockQuery.data && page > totalPages) {
      setPage(Math.max(1, Math.min(page, totalPages)));
    }
  }, [page, totalPages, stockQuery.data]);

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <h2 className="text-base font-semibold text-foreground">{labels.heading}</h2>

      <input
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder={labels.searchPlaceholder}
        aria-label={labels.searchLabel}
        className={cn(STOCK_FIELD_CLASS, 'md:max-w-md')}
      />

      {stockQuery.isError && !stockQuery.data ? (
        <ErrorState
          error={stockQuery.error}
          fallback={labels.errorFallback}
          onRetry={() => void stockQuery.refetch()}
        />
      ) : stockQuery.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        hasSearch ? (
          <EmptyState title={labels.noMatchTitle} description={labels.noMatchDescription} />
        ) : (
          <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} />
        )
      ) : (
        <div
          key={`${page}:${debouncedSearch}`}
          className={scrollClassName}
        >
          {groups.map((product) => {
            const cards: VariantCard[] = product.variants.map((variant) => ({
              id: variant.id,
              label: variantCardLabelOf({
                productName: product.name,
                sku: variant.sku ?? null,
                options: variant.options,
              }),
              options: [],
            }));
            const heading = <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>;
            return (
              <div key={product.id} className="flex flex-col gap-3 p-3">
                {productAction ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {heading}
                    {productAction(product)}
                  </div>
                ) : (
                  heading
                )}
                <VariantCards
                  cards={cards}
                  rows={[]}
                  selection={{}}
                  selectedCardIds={selectedIds}
                  disabledCardIds={disabledCardIds}
                  onSelect={(card) => {
                    const entry = entryById.get(card.id);
                    if (entry) onToggle(entry.variant, entry.product);
                  }}
                  noteOf={(card) => {
                    const entry = entryById.get(card.id);
                    return entry && noteOf ? noteOf(entry.variant, entry.product) : null;
                  }}
                  scrollClassName={cardsScrollClassName ?? CARD_SCROLL_CLASS}
                />
              </div>
            );
          })}
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
