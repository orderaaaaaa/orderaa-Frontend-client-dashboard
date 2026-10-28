'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Ban, ListChecks, PencilLine, Search, Sigma } from 'lucide-react';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { CountSheetTable } from '@/components/stock/CountSheetTable';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { VariantLabel } from '@/components/stock/VariantLabel';
import { VarianceChip } from '@/components/stock/VarianceChip';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { KpiCard, KpiCardSkeleton } from '@/components/ui/kpi-card';
import PaginationFooter from '@/components/ui/pagination-footer';
import ToggleGroup from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { StocktakeReviewDialog } from '@/components/stock/StocktakeReviewDialog';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { PERMISSION_CODES } from '@/lib/permissions';
import {
  useCancelStocktakeMutation,
  useLoadChangedStocktakeLines,
  usePostStocktakeMutation,
  useStocktakeLinesQuery,
  useStocktakeQuery,
  useUpdateStocktakeLinesMutation,
} from '@/services/stocktake';
import { useDebounce } from '@/utils/debounce';
import { formatNumber } from '@/utils/format';
import type {
  StocktakeLineDto,
  StocktakeLineFilter,
  StocktakeLineInputDto,
  StocktakeRefusedLine,
} from '../../types/stocktake';
import {
  getStocktakeErrorMessage,
  getStocktakeShortageLines,
} from '../../utils/stocktakeErrors';
import {
  STOCKTAKE_LINES_PAGE_SIZE,
  STOCKTAKE_LINES_WRITE_LIMIT,
  STOCKTAKE_SAVE_BATCH_SIZE,
  chunkLines,
  countedValueText,
  netDeltaOf,
  parseCountDraft,
  toRefusedLines,
  toStocktakeCountSheetLine,
} from '../../utils/stocktakeSheet';
import { StocktakeAccessDenied } from './StocktakeAccessDenied';
import { StocktakeStatusChip } from './StocktakeStatusChip';
import { STOCKTAKE_LIST_HREF } from './stocktakeRoutes';

type Drafts = Record<number, string>;

interface ReviewState {
  lines: StocktakeLineDto[];
}

const FILTER_OPTIONS: { value: StocktakeLineFilter; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'UNCOUNTED', label: 'غير معدود' },
  { value: 'CHANGED', label: 'متغيّر' },
];

interface StocktakeSheetContentProps {
  stocktakeId: number;
}

export function StocktakeSheetContent({ stocktakeId }: StocktakeSheetContentProps) {
  const queryClient = useQueryClient();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_READ);
  const canManage = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_STOCKTAKE_MANAGE);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filter, setFilter] = useState<StocktakeLineFilter>('ALL');
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Drafts>({});
  const draftsRef = useRef<Drafts>(drafts);
  const [review, setReview] = useState<ReviewState | null>(null);
  const [refused, setRefused] = useState<StocktakeRefusedLine[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);

  const summaryQuery = useStocktakeQuery(stocktakeId, canRead);
  const linesQuery = useStocktakeLinesQuery(
    stocktakeId,
    {
      search: debouncedSearch.trim() || undefined,
      filter,
      page,
      pageSize: STOCKTAKE_LINES_PAGE_SIZE,
    },
    canRead,
  );
  const updateLines = useUpdateStocktakeLinesMutation();
  const postStocktake = usePostStocktakeMutation();
  const cancelStocktake = useCancelStocktakeMutation();
  const loadChangedLines = useLoadChangedStocktakeLines();

  const summary = summaryQuery.data;
  const isOpen = summary?.status === 'OPEN';
  const isEditable = isOpen && canManage;

  const rawLines = useMemo(() => linesQuery.data?.data ?? [], [linesQuery.data]);
  const linesById = useMemo(
    () => new Map(rawLines.map((line) => [line.variantId, line])),
    [rawLines],
  );
  const sheetLines = useMemo(() => rawLines.map(toStocktakeCountSheetLine), [rawLines]);

  const updateDrafts = useCallback((next: Drafts) => {
    draftsRef.current = next;
    setDrafts(next);
  }, []);

  const saveDrafts = useCallback(async (): Promise<boolean> => {
    const sent = Object.entries(draftsRef.current)
      .map(([key, raw]) => ({ variantId: Number(key), raw, counted: parseCountDraft(raw) }))
      .filter((entry) => entry.counted !== undefined);
    if (sent.length === 0) return true;

    const payload: StocktakeLineInputDto[] = sent.map((entry) => ({
      variantId: entry.variantId,
      countedQuantity: entry.counted ?? null,
    }));
    try {
      for (const chunk of chunkLines(payload, STOCKTAKE_LINES_WRITE_LIMIT)) {
        await updateLines.mutateAsync({ id: stocktakeId, body: { lines: chunk } });
      }
    } catch (err: unknown) {
      toast.error(getStocktakeErrorMessage(err, 'تعذر حفظ الأعداد'));
      return false;
    }

    await queryClient.refetchQueries({
      queryKey: [QUERY_KEYS.STOCKTAKE_LINES, stocktakeId],
      type: 'active',
    });
    const remaining = { ...draftsRef.current };
    sent.forEach((entry) => {
      if (remaining[entry.variantId] === entry.raw) delete remaining[entry.variantId];
    });
    updateDrafts(remaining);
    return true;
  }, [queryClient, stocktakeId, updateLines, updateDrafts]);

  const chainRef = useRef<Promise<boolean>>(Promise.resolve(true));
  const flushDrafts = useCallback(() => {
    chainRef.current = chainRef.current.then(saveDrafts);
    return chainRef.current;
  }, [saveDrafts]);

  const valueOf = (line: { variantId: number }) => {
    const draft = drafts[line.variantId];
    if (draft !== undefined) return draft;
    return countedValueText(linesById.get(line.variantId)?.countedQuantity ?? null);
  };

  const onCountedChange = (variantId: number, raw: string) => {
    const next = { ...draftsRef.current, [variantId]: raw };
    updateDrafts(next);
    if (Object.keys(next).length >= STOCKTAKE_SAVE_BATCH_SIZE) {
      void flushDrafts();
    }
  };

  const onCancelEdit = (variantId: number) => {
    const next = { ...draftsRef.current };
    delete next[variantId];
    updateDrafts(next);
  };

  const pendingCount = Object.keys(drafts).length;
  const hasInvalidDraft = Object.values(drafts).some(
    (raw) => parseCountDraft(raw) === undefined,
  );

  const onReview = async () => {
    setRefused([]);
    const saved = await flushDrafts();
    if (!saved) return;
    if (Object.keys(draftsRef.current).length > 0) {
      toast.error('ما زالت بعض الأعداد قيد الحفظ، أعد المحاولة بعد لحظات');
      return;
    }
    try {
      const lines = await loadChangedLines(stocktakeId);
      setReview({ lines });
    } catch (err: unknown) {
      toast.error(getStocktakeErrorMessage(err, 'تعذر تحميل الفروقات'));
    }
  };

  const onPost = (note: string) => {
    postStocktake.mutate(
      { id: stocktakeId, body: { note: note || null } },
      {
        onSuccess: (result) => {
          toast.success(`تم ترحيل الجرد (${formatNumber(result.movementCount)} حركة)`);
          setRefused([]);
          setReview(null);
        },
        onError: (err: unknown) => {
          toast.error(getStocktakeErrorMessage(err, 'تعذر ترحيل الجرد'));
          const shortages = getStocktakeShortageLines(err);
          if (shortages.length > 0) {
            setRefused(toRefusedLines(shortages, review?.lines ?? []));
            return;
          }
          setReview(null);
        },
      },
    );
  };

  const onCancel = () => {
    cancelStocktake.mutate(stocktakeId, {
      onSuccess: () => {
        toast.success('تم إلغاء جلسة الجرد');
        setCancelOpen(false);
      },
      onError: (err: unknown) => {
        toast.error(getStocktakeErrorMessage(err, 'تعذر إلغاء الجلسة'));
        setCancelOpen(false);
      },
    });
  };

  if (!canRead) {
    return <StocktakeAccessDenied />;
  }

  if (summaryQuery.isError) {
    return (
      <ErrorState
        error={summaryQuery.error}
        fallback="تعذر تحميل جلسة الجرد"
        onRetry={() => summaryQuery.refetch()}
      />
    );
  }

  const title = `جلسة جرد #${stocktakeId}`;
  const breadcrumbs = [
    { label: 'إدارة المخزن', href: '/dashboard/inventory/stock-management' },
    { label: 'جرد المخزون', href: STOCKTAKE_LIST_HREF },
    { label: `#${stocktakeId}` },
  ];

  if (summaryQuery.isLoading || !summary) {
    return (
      <div className="w-full max-w-full space-y-6 overflow-x-hidden">
        <StockPageHeader title={title} breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const totalPages = linesQuery.data?.totalPages ?? 1;

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-4">
      <StockPageHeader
        title={title}
        subtitle={summary.warehouse.name}
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <StocktakeStatusChip status={summary.status} />
            {isEditable && (
              <Button
                variant="outline"
                onClick={() => setCancelOpen(true)}
                disabled={cancelStocktake.isPending}
              >
                <Ban className="size-4" aria-hidden="true" />
                إلغاء الجلسة
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="الأسطر"
          value={<span dir="ltr">{formatNumber(summary.lineCount)}</span>}
          icon={<ListChecks className="size-5" aria-hidden="true" />}
          accent="primary"
        />
        <KpiCard
          label="تم عدها"
          value={<span dir="ltr">{formatNumber(summary.countedCount)}</span>}
          icon={<PencilLine className="size-5" aria-hidden="true" />}
          accent="chart2"
        />
        <KpiCard
          label="متغيرة"
          value={<span dir="ltr">{formatNumber(summary.changedCount)}</span>}
          icon={<Sigma className="size-5" aria-hidden="true" />}
          accent="chart3"
        />
        <KpiCard
          label="صافي الفرق"
          value={<VarianceChip delta={summary.netDelta} />}
          icon={<Sigma className="size-5" aria-hidden="true" />}
          accent="chart4"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="ابحث باسم المنتج أو SKU"
            aria-label="بحث في أسطر الجرد"
            className="h-10 w-full rounded-lg border border-input bg-card ps-9 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <ToggleGroup
          options={FILTER_OPTIONS}
          value={filter}
          onChange={(next) => {
            setFilter(next);
            setPage(1);
          }}
        />
      </div>

      {isEditable && (
        <p className="text-xs text-muted-foreground">
          Enter أو السهم لأسفل للانتقال إلى السطر التالي، وEsc لإلغاء تعديل السطر، وCtrl+S لحفظ
          الأعداد.
        </p>
      )}

      {linesQuery.isError ? (
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
                    {' · '}الكمية بالنظام{' '}
                    <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                      {formatNumber(line.live)}
                    </span>
                    {' · '}المعدود{' '}
                    <span dir="ltr" className="font-semibold tabular-nums text-foreground">
                      {line.counted === null ? '—' : formatNumber(line.counted)}
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
          />
        </>
      )}

      {!linesQuery.isError && sheetLines.length > 0 && (
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

      {isEditable && (
        <StickyFormFooter
          isDirty={pendingCount > 0}
          isSaving={updateLines.isPending}
          status={
            pendingCount > 0
              ? `${formatNumber(pendingCount)} سطر بانتظار الحفظ`
              : `تم عد ${formatNumber(summary.countedCount)} من ${formatNumber(summary.lineCount)} سطر`
          }
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
        <BaseModal
          isOpen
          onClose={() => setCancelOpen(false)}
          title="إلغاء جلسة الجرد"
          onConfirm={onCancel}
          confirmText="إلغاء الجلسة"
          isLoading={cancelStocktake.isPending}
          maxWidth="md:max-w-[440px]"
        >
          <p className="text-sm text-muted-foreground">
            سيتم إلغاء هذه الجلسة دون أي تعديل على المخزون. لا يمكن التراجع عن الإلغاء.
          </p>
        </BaseModal>
      )}
    </div>
  );
}
