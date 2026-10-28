import type { StockAdjustmentShortageApi } from '@/lib/api/warehouses';

export type StockAdjustmentShortage = StockAdjustmentShortageApi & { warehouseId: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const toText = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const shortageOf = (entry: unknown, fallbackWarehouseId: number | null): StockAdjustmentShortage | null => {
  if (!isRecord(entry)) return null;
  const warehouseId = toNumber(entry.warehouseId) ?? fallbackWarehouseId;
  const variantId = toNumber(entry.variantId);
  const available = toNumber(entry.available);
  const required = toNumber(entry.required);
  if (warehouseId === null || variantId === null || available === null || required === null) {
    return null;
  }
  return {
    warehouseId,
    variantId,
    available,
    required,
    productName: toText(entry.productName) ?? '',
    variantLabel: toText(entry.variantLabel) ?? '',
    warehouseName: toText(entry.warehouseName),
    sku: entry.sku === null ? null : toText(entry.sku),
  };
};

export const adjustmentShortagesOf = (
  err: unknown,
  mode: 'single' | 'batch'
): StockAdjustmentShortage[] => {
  const data = isRecord(err) && isRecord(err.response) ? err.response.data : undefined;
  if (!isRecord(data)) return [];
  const source =
    mode === 'batch'
      ? isRecord(data.details) && Array.isArray(data.details.shortages)
        ? data.details.shortages
        : []
      : Array.isArray(data.lines)
        ? data.lines
        : [];
  const fallbackWarehouseId = mode === 'single' ? toNumber(data.warehouseId) : null;
  return source
    .map((entry) => shortageOf(entry, fallbackWarehouseId))
    .filter((shortage): shortage is StockAdjustmentShortage => shortage !== null);
};
