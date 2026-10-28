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
  const requested = toNumber(entry.requested) ?? toNumber(entry.required);
  if (warehouseId === null || variantId === null || available === null || requested === null) {
    return null;
  }
  return { warehouseId, variantId, available, requested };
};

export const adjustmentShortagesOf = (err: unknown): StockAdjustmentShortageApi[] => {
  const data = isRecord(err) && isRecord(err.response) ? err.response.data : undefined;
  if (!isRecord(data)) return [];
  const details = isRecord(data.details) ? data.details.shortages : undefined;
  const source: unknown[] = Array.isArray(details)
    ? details
    : Array.isArray(data.lines)
      ? data.lines
      : [];
  return source
    .map(shortageOf)
    .filter((shortage): shortage is StockAdjustmentShortageApi => shortage !== null);
};
