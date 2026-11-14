'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { VariantLabel } from '@/components/stock/VariantLabel';
import { STOCK_FIELD_CLASS } from '@/components/stock/formStyles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PaginationFooter from '@/components/ui/pagination-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { useStocktakeLinesQuery } from '@/services/stocktake';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/utils/debounce';
import { formatStockNumber } from '@/utils/format';
import type { StocktakeLineDto } from '../../types/stocktake';
import { STOCKTAKE_LINES_PAGE_SIZE } from '../../utils/stocktakeSheet';

const SKELETON_ROWS = 5;

interface StocktakeSelectedListProps {
  stocktakeId: number;
  count: number;
  pendingIds: ReadonlySet<number>;
  onRemove: (line: StocktakeLineDto) => void;
}

export function StocktakeSelectedList({
  stocktakeId,
  count,
  pendingIds,
  onRemove,
}: StocktakeSelectedListProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const hasSearch = debouncedSearch.trim() !== '';

  const linesQuery = useStocktakeLinesQuery(
    stocktakeId,
    {
      search: debouncedSearch.trim() || undefined,
      filter: 'ALL',
      page,
      pageSize: STOCKTAKE_LINES_PAGE_SIZE,
    },
    true,
  );

  const lines = linesQuery.data?.data ?? [];
  const totalPages = linesQuery.data?.totalPages ?? 1;

  useEffect(() => {
    if (linesQuery.data && page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages, linesQuery.data]);

  const listBody = linesQuery.isError ? (
    <ErrorState
      error={linesQuery.error}
      fallback="تعذر تحميل أسطر الجرد"
      onRetry={() => void linesQuery.refetch()}
    />
  ) : linesQuery.isLoading ? (
    <div className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  ) : lines.length === 0 ? (
    count === 0 && !hasSearch ? (
      <EmptyState
        title="لم تختر أي منتج بعد"
        description="اختر المنتجات أو المتغيرات التي تريد جردها"
      />
    ) : (
      <EmptyState
        title="لا توجد أسطر مطابقة"
        description="غيّر البحث لعرض أسطر أخرى"
      />
    )
  ) : (
    <ul className="divide-y divide-border">
      {lines.map((line) => (
        <li key={line.variantId} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1 space-y-1">
            <VariantLabel
              productName={line.productName}
              sku={line.sku}
              options={[]}
              optionsLabel={line.variantLabel}
              size="sm"
            />
            <p className="text-xs text-muted-foreground">
              {'المخزون الحالي: '}
              <span dir="ltr" className="tabular-nums">
                {formatStockNumber(line.currentQuantity)}
              </span>
            </p>
          </div>
          {line.countedQuantity !== null && <Badge variant="secondary">معدود</Badge>}
          <Button
            type="button"
            variant="ghost"
            size="touch"
            className="shrink-0 sm:size-10"
            aria-label="إزالة"
            disabled={pendingIds.has(line.variantId)}
            onClick={() => onRemove(line)}
          >
            <X aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
      <h2 className="text-base font-semibold text-foreground">
        المنتجات المختارة{' '}
        <span className="text-muted-foreground">({formatStockNumber(count)})</span>
      </h2>

      <input
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="ابحث في المنتجات المختارة"
        aria-label="بحث في المنتجات المختارة"
        className={cn(STOCK_FIELD_CLASS, 'md:max-w-md')}
      />

      {listBody}

      {!linesQuery.isError && totalPages > 1 && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={linesQuery.data?.total ?? 0}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          currentPageSize={STOCKTAKE_LINES_PAGE_SIZE}
        />
      )}
    </section>
  );
}
