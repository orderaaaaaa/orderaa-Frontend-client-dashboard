import {
  STOCKTAKE_TYPES,
  type StocktakeSummaryDto,
  type StocktakeType,
} from '../types/stocktake';

export const STOCKTAKE_TYPE_LABELS: Record<StocktakeType, string> = {
  MAIN: 'المخزن الرئيسي',
  RETURNS: 'المرتجعات',
};

export function parseStocktakeType(raw: string | null): StocktakeType | null {
  return STOCKTAKE_TYPES.find((type) => type === raw) ?? null;
}

export function stocktakeTargetLabel(summary: StocktakeSummaryDto): string {
  return summary.type === null
    ? summary.warehouse.name
    : STOCKTAKE_TYPE_LABELS[summary.type];
}
