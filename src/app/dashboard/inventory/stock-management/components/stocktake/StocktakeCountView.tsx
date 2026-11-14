'use client';

import { ListChecks, PencilLine, Search, Sigma } from 'lucide-react';
import { LiaArrowRightSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { CountSheetTable } from '@/components/stock/CountSheetTable';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { StocktakeReviewDialog } from '@/components/stock/StocktakeReviewDialog';
import { VariantLabel } from '@/components/stock/VariantLabel';
import { VarianceChip } from '@/components/stock/VarianceChip';
import { KpiCard } from '@/components/ui/kpi-card';
import PaginationFooter from '@/components/ui/pagination-footer';
import { SlideUpFooter } from '@/components/ui/slide-up-footer';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import ToggleGroup from '@/components/ui/toggle-group';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { formatStockNumber } from '@/utils/format';
import type { StocktakeLineFilter } from '../../types/stocktake';
import { useStocktakeCountSheet } from '../../hooks/useStocktakeCountSheet';
import {
  netDeltaOf,
  STOCKTAKE_LINES_PAGE_SIZE,
} from '../../utils/stocktakeSheet';
import {
  STOCKTAKE_TYPE_LABELS,
  stocktakeTargetLabel,
} from '../../utils/stocktakeTypes';
import { StocktakeCancelButton, StocktakeCancelModal } from './StocktakeCancelControls';
import { StocktakeStatusChip } from './StocktakeStatusChip';
import { stocktakeSessionBreadcrumbs } from './stocktakeRoutes';

const FILTER_OPTIONS: { value: StocktakeLineFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'UNCOUNTED', label: 'غير معدود' },
  { value: 'CHANGED', label: 'متغيّر' },
];

interface StocktakeCountViewProps {
  stocktakeId: number;
  fullScreen: boolean;
  onBack?: () => void;
}

export function StocktakeCountView({ stocktakeId, fullScreen, onBack }: StocktakeCountViewProps) {
  const sheet = useStocktakeCountSheet(stocktakeId);
  useBodyScrollLock(fullScreen);
  const {
    summary,
    isEditable,
    search,
    onSearchChange,
    filter,
    onFilterChange,
    page,
    setPage,
    linesQuery,
    sheetLines,
    valueOf,
    onCountedChange,
    onCancelEdit,
    flushDrafts,
    pendingCount,
    hasInvalidDraft,
    review,
    setReview,
    refused,
    onReview,
    onPost,
    cancelOpen,
    setCancelOpen,
    onCancel,
    updateLines,
    postStocktake,
    cancelStocktake,
  } = sheet;

  if (!summary) return null;

  const totalPages = linesQuery.data?.totalPages ?? 1;
  const fullTitle =
    summary.type === null
      ? `جرد ${summary.warehouse.name}`
      : `جرد ${STOCKTAKE_TYPE_LABELS[summary.type]} — ${summary.warehouse.name}`;
  const draftStatus =
    pendingCount > 0
      ? `${formatStockNumber(pendingCount)} سطر بانتظار الحفظ`
      : `تم عد ${formatStockNumber(summary.countedCount)} من ${formatStockNumber(summary.lineCount)} سطر`;

  const onBackClick = async () => {
    const saved = await flushDrafts();
    if (saved) onBack?.();
  };

  const cancelButton = isEditable && (
    <StocktakeCancelButton
      onClick={() => setCancelOpen(true)}
      disabled={cancelStocktake.isPending}
    />
  );

  const kpiRow = (
    <div
      className={
        fullScreen
          ? 'grid grid-cols-2 gap-3 md:grid-cols-4'
          : 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'
      }
    >
      <KpiCard
        label="الأسطر"
        value={<span dir="ltr">{formatStockNumber(summary.lineCount)}</span>}
        icon={<ListChecks className="size-5" aria-hidden="true" />}
        accent="primary"
      />
      <KpiCard
        label="تم عدها"
        value={<span dir="ltr">{formatStockNumber(summary.countedCount)}</span>}
        icon={<PencilLine className="size-5" aria-hidden="true" />}
        accent="chart2"
      />
      <KpiCard
        label="متغيرة"
        value={<span dir="ltr">{formatStockNumber(summary.changedCount)}</span>}
        icon={<Sigma className="size-5" aria-hidden="true" />}
        accent="chart3"
      />
      <KpiCard
        label="صافي الفرق"
        value={
          summary.status === 'CANCELLED' ? (
            <span className="text-gray-400">—</span>
          ) : (
            <VarianceChip delta={summary.netDelta} />
          )
        }
        icon={<Sigma className="size-5" aria-hidden="true" />}
        accent="chart4"
      />
    </div>
  );

  const searchRow = (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ابحث باسم المنتج أو SKU"
          aria-label="بحث في أسطر الجرد"
          className="h-10 w-full rounded-lg border border-input bg-card ps-9 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <ToggleGroup
        options={FILTER_OPTIONS}
        value={filter}
        onChange={onFilterChange}
      />
    </div>
  );

  const keyboardHint = isEditable && (
    <p
      className={
        fullScreen
          ? 'hidden text-xs text-muted-foreground md:block'
          : 'text-xs text-muted-foreground'
      }
    >
      Enter أو السهم لأسفل للانتقال إلى السطر التالي، وEsc لإلغاء تعديل السطر، وCtrl+S لحفظ
      الأعداد.
    </p>
  );

  const linesSection = linesQuery.isError ? (
    <ErrorState
      error={linesQuery.error}
      fallback="تعذر تحميل أسطر الجرد"
      onRetry={() => linesQuery.refetch()}
    />
  ) : linesQuery.isLoading ? (
    <Skeleton className="h-64 w-full rounded-xl" />
  ) : sheetLines.length === 0 ? (
    <EmptyState
      title="لا توجد أسطر مطابقة"
      description="غيّر البحث أو الفلتر لعرض أسطر أخرى"
    />
  ) : (
    <>
      {refused.length > 0 && !review && (
        <div
          role="alert"
          className="space-y-2 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <p className="font-semibold text-destructive">
            تعذر ترحيل الجرد: الرصيد الحالي لا يكفي للأسطر التالية، ولم يتم ترحيل أي سطر
          </p>
          <ul className="space-y-1">
            {refused.map((line) => (
              <li key={line.variantId} className="flex flex-col gap-0.5 text-muted-foreground">
                <VariantLabel
                  productName={line.productName}
                  sku={line.sku}
                  options={[]}
                  optionsLabel={line.variantLabel}
                  size="sm"
                />
                <span className="text-muted-foreground">
                  {'الكمية بالنظام '}
                  <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                    {formatStockNumber(line.live)}
                  </span>
                  {' · المعدود '}
                  {line.countedAt === null ? (
                    <span className="text-gray-400">لم يُعد بعد</span>
                  ) : (
                    <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                      {formatStockNumber(line.counted)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <CountSheetTable
        lines={sheetLines}
        valueOf={valueOf}
        onCountedChange={onCountedChange}
        onCancelEdit={onCancelEdit}
        onCountBlur={() => void flushDrafts()}
        onSave={() => void flushDrafts()}
        allowBlank
        readOnly={!isEditable}
        flaggedVariantIds={refused.map((line) => line.variantId)}
        uncountedLabel="لم يُعد بعد"
        varianceUnavailable={summary.status === 'CANCELLED'}
        mobileCards={fullScreen}
      />
    </>
  );

  const pagination = !linesQuery.isError && sheetLines.length > 0 && (
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
  );

  const body = (
    <>
      {kpiRow}
      {searchRow}
      {keyboardHint}
      {linesSection}
      {pagination}
    </>
  );

  const modals = (
    <>
      {review && (
        <StocktakeReviewDialog
          open
          onOpenChange={(open) => {
            if (!open) setReview(null);
          }}
          lines={review.lines}
          netDelta={netDeltaOf(review.lines)}
          onConfirm={onPost}
          isPending={postStocktake.isPending}
          refused={refused}
        />
      )}

      {cancelOpen && (
        <StocktakeCancelModal
          onClose={() => setCancelOpen(false)}
          onConfirm={onCancel}
          isPending={cancelStocktake.isPending}
        />
      )}
    </>
  );

  if (!fullScreen) {
    return (
      <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-4">
        <StockPageHeader
          title={`جلسة جرد #${stocktakeId}`}
          subtitle={stocktakeTargetLabel(summary)}
          breadcrumbs={stocktakeSessionBreadcrumbs(stocktakeId)}
          actions={
            <>
              <StocktakeStatusChip status={summary.status} />
              {cancelButton}
            </>
          }
        />
        {body}
        {isEditable && (
          <StickyFormFooter
            isDirty={pendingCount > 0}
            isSaving={updateLines.isPending}
            status={draftStatus}
          >
            <Button
              variant="outline"
              onClick={() => void flushDrafts()}
              disabled={pendingCount === 0 || hasInvalidDraft || updateLines.isPending}
            >
              حفظ الأعداد
            </Button>
            <Button
              onClick={() => void onReview()}
              disabled={
                hasInvalidDraft ||
                summary.countedCount === 0 ||
                postStocktake.isPending ||
                updateLines.isPending
              }
            >
              مراجعة وترحيل
            </Button>
          </StickyFormFooter>
        )}
        {modals}
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={fullTitle}
      className="fixed inset-0 z-(--z-fullscreen-page) flex flex-col bg-background"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" onClick={() => void onBackClick()}>
            <LiaArrowRightSolid className="size-4" aria-hidden="true" />
            رجوع للقائمة
          </Button>
          <h1 className="min-w-0 truncate text-base font-bold text-foreground">{fullTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StocktakeStatusChip status={summary.status} />
          {cancelButton}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl space-y-4 p-4">{body}</div>
      </div>
      <SlideUpFooter inShell={false} visible status={draftStatus}>
        <Button variant="outline" onClick={() => void onBackClick()}>
          رجوع للقائمة
        </Button>
        <Button
          variant="outline"
          onClick={() => void flushDrafts()}
          disabled={pendingCount === 0 || hasInvalidDraft || updateLines.isPending}
        >
          حفظ الأعداد
        </Button>
        <Button
          onClick={() => void onReview()}
          disabled={
            hasInvalidDraft ||
            summary.countedCount === 0 ||
            postStocktake.isPending ||
            updateLines.isPending
          }
        >
          مراجعة وترحيل
        </Button>
      </SlideUpFooter>
      {modals}
    </div>
  );
}
