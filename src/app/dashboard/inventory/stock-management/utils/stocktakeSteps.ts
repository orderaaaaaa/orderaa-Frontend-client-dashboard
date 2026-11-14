import type { StocktakeSummaryDto } from '../types/stocktake';

export const STOCKTAKE_STEPS = ['items', 'count'] as const;

export type StocktakeStep = (typeof STOCKTAKE_STEPS)[number];

export function parseStocktakeStep(raw: string | null): StocktakeStep | null {
  return STOCKTAKE_STEPS.find((step) => step === raw) ?? null;
}

export function defaultStocktakeStep(summary: StocktakeSummaryDto): StocktakeStep {
  return summary.lineCount === 0 ? 'items' : 'count';
}
