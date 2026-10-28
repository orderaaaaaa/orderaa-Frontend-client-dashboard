import type {
  StockAdjustmentReason,
  StockMovementSource,
} from '@/lib/api/warehouses';

export const STOCK_ADJUSTMENT_REASON_LABELS: Record<StockAdjustmentReason, string> = {
  COUNT_CORRECTION: 'تصحيح الجرد',
  DAMAGED: 'تالف',
  LOST: 'مفقود',
  FOUND: 'فائض',
  OTHER: 'أخرى',
};

export const STOCK_ADJUSTMENT_REASON_OPTIONS = (
  Object.keys(STOCK_ADJUSTMENT_REASON_LABELS) as StockAdjustmentReason[]
).map((key) => ({ key, value: STOCK_ADJUSTMENT_REASON_LABELS[key] }));

export const STOCK_ADJUSTMENT_REASON_REQUIRING_NOTE: StockAdjustmentReason = 'OTHER';

export const OPENING_COUNT_ADJUSTMENT_REASON: StockAdjustmentReason = 'COUNT_CORRECTION';

export const MOVEMENT_SOURCE_LABELS: Record<StockMovementSource, string> = {
  INBOUND: 'وارد من مورد',
  WORKFLOW: 'حركة حالة طلب',
  ADJUSTMENT: 'تسوية',
  TRANSFER: 'نقل',
  OUTBOUND: 'صادر لمورد',
  MERGE: 'دمج متغيرات',
};

export const MOVEMENT_SOURCE_MARKER_CLASSES: Record<StockMovementSource, string> = {
  INBOUND: 'text-success',
  WORKFLOW: 'text-muted-foreground',
  ADJUSTMENT: 'text-primary',
  TRANSFER: 'text-chart-2',
  OUTBOUND: 'text-warning',
  MERGE: 'text-chart-4',
};

export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  SUPPLIER_INVOICE: 'فاتورة مورد',
  ORDER: 'طلب',
  ORDER_REVERT: 'عكس حركة طلب',
  ADJUSTMENT_BATCH: 'تسوية',
  TRANSFER_BATCH: 'نقل',
  VARIANT_MERGE: 'دمج متغيرات',
  VARIANT_MERGE_MARKER: 'دمج منتج',
  STOCKTAKE: 'جرد',
};
