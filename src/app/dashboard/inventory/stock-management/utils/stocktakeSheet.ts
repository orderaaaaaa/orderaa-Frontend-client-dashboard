import type { CountSheetLine } from '@/components/stock/CountSheetTable';
import { isInvalidCountInput } from '@/components/stock/CountSheetTable';
import type { StocktakeLineDto } from '../types/stocktake';

export const STOCKTAKE_SAVE_BATCH_SIZE = 20;
export const STOCKTAKE_LINES_WRITE_LIMIT = 200;
export const STOCKTAKE_LINES_PAGE_SIZE = 50;

export const parseCountDraft = (raw: string): number | null | undefined => {
  if (raw.trim() === '') return null;
  if (isInvalidCountInput(raw)) return undefined;
  return Number(raw);
};

export const countedValueText = (countedQuantity: number | null): string =>
  countedQuantity === null ? '' : String(countedQuantity);

export const toStocktakeCountSheetLine = (line: StocktakeLineDto): CountSheetLine => ({
  variantId: line.variantId,
  productName: line.productName,
  sku: line.sku,
  options: [],
  optionsLabel: line.variantLabel,
  live: line.currentQuantity,
  expected: line.expectedQuantity,
  postedDelta: line.postedDelta,
});

export const netDeltaOf = (lines: StocktakeLineDto[]): number =>
  lines.reduce(
    (total, line) =>
      total + (line.countedQuantity ?? line.currentQuantity) - line.currentQuantity,
    0,
  );

export const chunkLines = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};
