'use client';

import type { MoveStockLine } from '@/components/stock/MoveStockForm';
import {
  StockVariantPicker,
  type StockVariantPickerLabels,
} from '@/components/stock/StockVariantPicker';
import { useI18n } from '@/i18n/I18nProvider';
import type { StockProductApi, StockVariantCombination } from '@/services/stock';
import { toStockNumber } from '@/utils/format';

const TRANSFER_PICKER_LABELS: StockVariantPickerLabels = {
  heading: 'المنتجات في هذا المخزن',
  searchLabel: 'ابحث باسم المنتج',
  searchPlaceholder: 'ابحث باسم المنتج',
  errorFallback: 'تعذر تحميل منتجات المخزن',
  emptyTitle: 'لا توجد متغيرات في هذا المخزن',
  emptyDescription: 'لا يوجد مخزون متاح للنقل في هذا المخزن',
  noMatchTitle: 'لا توجد متغيرات مطابقة',
  noMatchDescription: 'جرّب كلمة بحث أخرى',
};

const TRANSFER_SCROLL_CLASS =
  'max-h-[60dvh] divide-y divide-border overflow-x-hidden overflow-y-auto rounded-lg border border-border';

const toMoveStockLine = (variant: StockVariantCombination, product: StockProductApi): MoveStockLine => ({
  variantId: variant.id,
  productName: product.name,
  sku: variant.sku ?? null,
  options: variant.options,
  available: variant.availableCount,
});

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
  const selectedIds = new Set(lines.map((line) => line.variantId));

  return (
    <StockVariantPicker
      warehouseId={warehouseId}
      selectedIds={selectedIds}
      labels={TRANSFER_PICKER_LABELS}
      scrollClassName={TRANSFER_SCROLL_CLASS}
      isCardDisabled={(variant) =>
        disabled || (!selectedIds.has(variant.id) && variant.availableCount <= 0)
      }
      noteOf={(variant) =>
        t('orderDetails.stock.available', { count: toStockNumber(variant.availableCount) })
      }
      onToggle={(variant, product) => onToggleLine(toMoveStockLine(variant, product))}
    />
  );
}
