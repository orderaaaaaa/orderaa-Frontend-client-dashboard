import type { VariantCell, VariantStock } from '../types';

export interface StockIndicators {
  shortage: boolean;
  outOfStock: boolean;
  lowStock: boolean;
}

export interface StockIndicatorFlags {
  showShortageIndicator: boolean;
  showOutOfStockIndicator: boolean;
  showLowStockIndicator: boolean;
}

export const ALL_STOCK_INDICATORS: StockIndicators = {
  shortage: true,
  outOfStock: true,
  lowStock: true,
};

export function indicatorsFromFlags(flags: StockIndicatorFlags): StockIndicators {
  return {
    shortage: flags.showShortageIndicator,
    outOfStock: flags.showOutOfStockIndicator,
    lowStock: flags.showLowStockIndicator,
  };
}

export function resolveIndicators(
  flags: StockIndicatorFlags | undefined,
  settled: boolean
): StockIndicators | null {
  if (flags) return indicatorsFromFlags(flags);
  return settled ? ALL_STOCK_INDICATORS : null;
}

export type StockCellView =
  | { kind: 'hidden' }
  | { kind: 'missing' }
  | { kind: 'plain'; stock: VariantStock }
  | { kind: 'badge'; stock: VariantStock };

export function displayCell(
  cell: VariantCell | undefined,
  indicators: StockIndicators
): StockCellView {
  if (cell === undefined) return { kind: 'hidden' };
  if (cell === 'missing') return { kind: 'missing' };
  if (cell.status === 'shortage' && !indicators.shortage) {
    return { kind: 'hidden' };
  }
  if (cell.status === 'out_of_stock' && !indicators.outOfStock) {
    return { kind: 'hidden' };
  }
  if (cell.status === 'low' && !indicators.lowStock) {
    return { kind: 'plain', stock: cell };
  }
  return { kind: 'badge', stock: cell };
}

export function visibleQuantity(
  cell: VariantCell | undefined,
  indicators: StockIndicators
): number {
  const view = displayCell(cell, indicators);
  return view.kind === 'plain' || view.kind === 'badge'
    ? view.stock.quantity
    : 0;
}

export function sumVisibleQuantity(
  cells: (VariantCell | undefined)[],
  indicators: StockIndicators
): number {
  return cells.reduce(
    (sum, cell) => sum + visibleQuantity(cell, indicators),
    0
  );
}

export function effectiveOutOfStockOnly(
  requested: boolean,
  indicators: StockIndicators | null
): boolean {
  return requested && indicators !== null && indicators.outOfStock;
}
