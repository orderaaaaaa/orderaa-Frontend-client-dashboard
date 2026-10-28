import type { StockAdjustmentShortageApi } from '@/lib/api/warehouses';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const shortageOf = (entry: unknown): StockAdjustmentShortageApi | null => {
  if (!isRecord(entry)) return null;
  const warehouseId = toNumber(entry.warehouseId);
  const variantId = toNumber(entry.variantId);
  const available = toNumber(entry.available);
  const required = toNumber(entry.required);
  if (warehouseId === null || variantId === null || available === null || required === null) {
    return null;
  }
  return { warehouseId, variantId, available, required };
};

export const adjustmentShortagesOf = (
  err: unknown,
  mode: 'single' | 'batch'
): StockAdjustmentShortageApi[] => {
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
  return source
    .map(shortageOf)
    .filter((shortage): shortage is StockAdjustmentShortageApi => shortage !== null);
};
