'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  StockVariantPicker,
  type StockVariantPickerLabels,
} from '@/components/stock/StockVariantPicker';
import { CARD_SCROLL_CLASS } from '@/components/stock/VariantCards';
import { StockPageHeader } from '@/components/stock/StockPageHeader';
import { Button } from '@/components/ui/button';
import { SlideUpFooter } from '@/components/ui/slide-up-footer';
import ToggleGroup from '@/components/ui/toggle-group';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { StockProductApi, StockVariantCombination } from '@/services/stock';
import { useStocktakeSelectionQuery } from '@/services/stocktake';
import { formatStockNumber } from '@/utils/format';
import { useStocktakeCancel } from '../../hooks/useStocktakeCancel';
import { useStocktakeSelectionChanges } from '../../hooks/useStocktakeSelectionChanges';
import type { StocktakeLineDto, StocktakeSummaryDto } from '../../types/stocktake';
import {
  getStocktakeErrorCode,
  getStocktakeErrorMessage,
} from '../../utils/stocktakeErrors';
import { stocktakeTargetLabel } from '../../utils/stocktakeTypes';
import { StocktakeCancelButton, StocktakeCancelModal } from './StocktakeCancelControls';
import { StocktakeRemoveCountedModal } from './StocktakeRemoveCountedModal';
import { StocktakeSelectedList } from './StocktakeSelectedList';
import { StocktakeStatusChip } from './StocktakeStatusChip';
import { stocktakeSessionBreadcrumbs } from './stocktakeRoutes';

interface StocktakeItemsStepProps {
  stocktakeId: number;
  summary: StocktakeSummaryDto;
  onNext: () => void;
}

type ItemsPane = 'picker' | 'selected';
type Overlay = ReadonlyMap<number, boolean>;

const PICKER_LABELS: StockVariantPickerLabels = {
  heading: 'المنتجات',
  searchLabel: 'ابحث باسم المنتج',
  searchPlaceholder: 'ابحث باسم المنتج',
  errorFallback: 'تعذر تحميل المنتجات',
  emptyTitle: 'لا توجد منتجات',
  emptyDescription: 'أضف منتجات أولاً',
  noMatchTitle: 'لا توجد نتائج مطابقة',
  noMatchDescription: 'جرّب كلمة بحث أخرى',
};

const PICKER_SCROLL_CLASS =
  'divide-y divide-border overflow-x-hidden rounded-lg border border-border sm:max-h-[60dvh] sm:overflow-y-auto';

const withOverlay = (overlay: Overlay, ids: number[], selected: boolean): Overlay => {
  const next = new Map<number, boolean>(overlay);
  ids.forEach((id) => next.set(id, selected));
  return next;
};

const withoutOverlay = (overlay: Overlay, ids: number[]): Overlay => {
  const next = new Map<number, boolean>(overlay);
  ids.forEach((id) => next.delete(id));
  return next;
};

export function StocktakeItemsStep({ stocktakeId, summary, onNext }: StocktakeItemsStepProps) {
  const canBrowseProducts = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_STOCK_READ);
  const selectionQuery = useStocktakeSelectionQuery(stocktakeId);
  const { add, remove, pendingIds } = useStocktakeSelectionChanges(stocktakeId);
  const cancel = useStocktakeCancel(stocktakeId);
  const [overlay, setOverlay] = useState<Overlay>(() => new Map<number, boolean>());
  const [pane, setPane] = useState<ItemsPane>('picker');
  const [pendingRemoval, setPendingRemoval] = useState<number[] | null>(null);

  const selectedIds = useMemo(() => {
    const next = new Set<number>(selectionQuery.data?.variantIds ?? []);
    overlay.forEach((selected, id) => {
      if (selected) next.add(id);
      else next.delete(id);
    });
    return next;
  }, [selectionQuery.data, overlay]);

  const countedIds = useMemo(
    () => new Set<number>(selectionQuery.data?.countedVariantIds ?? []),
    [selectionQuery.data],
  );

  const lineCount = summary.lineCount;
  const saving = pendingIds.size > 0;

  const runChange = (ids: number[], selected: boolean, discardCounted = false) => {
    if (ids.length === 0) return;
    setOverlay((current) => withOverlay(current, ids, selected));
    const request = selected ? add(ids) : remove(ids, discardCounted);
    request
      .catch(async (err: unknown) => {
        if (!selected && getStocktakeErrorCode(err) === 'STOCKTAKE_REMOVE_COUNTED') {
          await selectionQuery.refetch();
          setPendingRemoval(ids);
          return;
        }
        toast.error(
          getStocktakeErrorMessage(
            err,
            selected ? 'تعذر إضافة المنتجات إلى الجرد' : 'تعذر حذف المنتجات من الجرد',
          ),
        );
      })
      .finally(() => setOverlay((current) => withoutOverlay(current, ids)));
  };

  const onToggle = (variant: StockVariantCombination) => {
    const id = variant.id;
    if (!selectedIds.has(id)) {
      runChange([id], true);
      return;
    }
    if (countedIds.has(id)) {
      setPendingRemoval([id]);
      return;
    }
    runChange([id], false);
  };

  const onRemoveLine = (line: StocktakeLineDto) => {
    if (line.countedQuantity !== null) {
      setPendingRemoval([line.variantId]);
      return;
    }
    runChange([line.variantId], false);
  };

  const confirmDiscard = () => {
    const ids = pendingRemoval;
    setPendingRemoval(null);
    if (ids) runChange(ids, false, true);
  };

  const productAction = (product: StockProductApi) => {
    const ids = product.variants.map((variant) => variant.id);
    const allSelected = ids.every((id) => selectedIds.has(id));
    if (allSelected) {
      const targets = ids.filter((id) => !pendingIds.has(id));
      const hasCounted = targets.some((id) => countedIds.has(id));
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={targets.length === 0}
          onClick={() => (hasCounted ? setPendingRemoval(targets) : runChange(targets, false))}
        >
          إزالة الكل
        </Button>
      );
    }
    const targets = ids.filter((id) => !selectedIds.has(id) && !pendingIds.has(id));
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={targets.length === 0}
        onClick={() => runChange(targets, true)}
      >
        إضافة الكل
      </Button>
    );
  };

  const paneOptions: { value: ItemsPane; label: string }[] = [
    { value: 'picker', label: 'إضافة منتجات' },
    { value: 'selected', label: `المختارة (${formatStockNumber(lineCount)})` },
  ];

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-4">
      <StockPageHeader
        title="اختيار منتجات الجرد"
        subtitle={stocktakeTargetLabel(summary)}
        breadcrumbs={stocktakeSessionBreadcrumbs(stocktakeId)}
        actions={
          <>
            <StocktakeStatusChip status={summary.status} />
            <StocktakeCancelButton
              onClick={() => cancel.setCancelOpen(true)}
              disabled={cancel.cancelStocktake.isPending}
            />
          </>
        }
      />

      <ToggleGroup
        options={paneOptions}
        value={pane}
        onChange={setPane}
        className="lg:hidden"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn('min-w-0 lg:block', pane === 'picker' ? 'block' : 'hidden')}>
          {canBrowseProducts ? (
            <StockVariantPicker
              selectedIds={selectedIds}
              labels={PICKER_LABELS}
              scrollClassName={PICKER_SCROLL_CLASS}
              cardsScrollClassName={CARD_SCROLL_CLASS}
              isCardDisabled={(variant) => pendingIds.has(variant.id)}
              onToggle={onToggle}
              productAction={productAction}
            />
          ) : (
            <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-5">
              <h2 className="text-base font-semibold text-foreground">المنتجات</h2>
              <p className="text-sm text-muted-foreground">
                لا تملك صلاحية عرض المنتجات، اطلب من المسؤول صلاحية عرض المخزون
              </p>
            </section>
          )}
        </div>

        <div className={cn('min-w-0 lg:block', pane === 'selected' ? 'block' : 'hidden')}>
          <StocktakeSelectedList
            stocktakeId={stocktakeId}
            count={lineCount}
            pendingIds={pendingIds}
            onRemove={onRemoveLine}
          />
        </div>
      </div>

      <SlideUpFooter
        visible={lineCount > 0 || selectedIds.size > 0}
        status={saving ? 'جارٍ الحفظ...' : `تم اختيار ${formatStockNumber(lineCount)} منتج`}
      >
        <Button onClick={onNext} disabled={saving}>
          التالي
        </Button>
      </SlideUpFooter>

      {pendingRemoval && (
        <StocktakeRemoveCountedModal
          total={pendingRemoval.length}
          counted={pendingRemoval.filter((id) => countedIds.has(id)).length}
          onClose={() => setPendingRemoval(null)}
          onConfirm={confirmDiscard}
        />
      )}

      {cancel.cancelOpen && (
        <StocktakeCancelModal
          onClose={() => cancel.setCancelOpen(false)}
          onConfirm={cancel.onCancel}
          isPending={cancel.cancelStocktake.isPending}
        />
      )}
    </div>
  );
}
