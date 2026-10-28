import type { OtherOptionVariant, ProductVariantRow, VariantCell } from '../types';
import { sumVisibleQuantity, type StockIndicators } from './stockIndicators';

export interface ProductStockTotals {
  byRow: number[];
  byColor: number[];
  otherTotal: number;
  grandTotal: number;
}

const otherCell = (variant: OtherOptionVariant): VariantCell => ({
  quantity: variant.quantity,
  status: variant.status,
});

export function productStockTotals(
  colors: string[],
  variants: ProductVariantRow[],
  otherVariants: OtherOptionVariant[],
  indicators: StockIndicators
): ProductStockTotals {
  const byRow = variants.map((row) =>
    sumVisibleQuantity(
      [
        ...colors.map((color) => row.stocks[color]),
        ...otherVariants
          .filter((variant) => variant.size === row.size)
          .map(otherCell),
      ],
      indicators
    )
  );

  const byColor = colors.map((color) =>
    sumVisibleQuantity(
      [
        ...variants.map((row) => row.stocks[color]),
        ...otherVariants
          .filter((variant) => variant.color === color)
          .map(otherCell),
      ],
      indicators
    )
  );

  const otherTotal = sumVisibleQuantity(
    otherVariants.map(otherCell),
    indicators
  );

  const gridTotal = sumVisibleQuantity(
    variants.flatMap((row) => colors.map((color) => row.stocks[color])),
    indicators
  );

  return {
    byRow,
    byColor,
    otherTotal,
    grandTotal: gridTotal + otherTotal,
  };
}
