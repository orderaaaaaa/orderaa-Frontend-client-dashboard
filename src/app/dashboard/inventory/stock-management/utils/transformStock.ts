import type {
  StockAttribute,
  StockProductApi,
  StockVariantCombination,
} from '@/services/stock';
import { LOW_STOCK_THRESHOLD } from '../constants';
import type {
  ProductVariantRow,
  StockProduct,
  StockStatus,
  VariantCell,
} from '../types';

const SIZE_ATTR_PATTERN = /مقاس|size/i;
const COLOR_ATTR_PATTERN = /لون|لوان|color/i;

const PLACEHOLDER_SIZE = '-';
const PLACEHOLDER_COLOR = '-';

type Axis = 'size' | 'color' | null;

function statusFromQuantity(quantity: number): StockStatus {
  if (quantity < 0) return 'shortage';
  if (quantity === 0) return 'out_of_stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low';
  if (quantity < LOW_STOCK_THRESHOLD * 2) return 'medium';
  return 'high';
}

function classifyAttribute(name: string | undefined | null): Axis {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) return null;
  if (SIZE_ATTR_PATTERN.test(trimmed)) return 'size';
  if (COLOR_ATTR_PATTERN.test(trimmed)) return 'color';
  return null;
}

interface AxisIndex {
  optionIdToName: Map<number, string>;
  names: string[];
}

function emptyAxis(): AxisIndex {
  return { optionIdToName: new Map(), names: [] };
}

function buildAxes(attributes: StockAttribute[] | undefined | null) {
  const sizeAxis = emptyAxis();
  const colorAxis = emptyAxis();
  const sizeSeen = new Set<string>();
  const colorSeen = new Set<string>();

  for (const attr of attributes ?? []) {
    const axis = classifyAttribute(attr?.name);
    if (!axis) continue;
    const target = axis === 'size' ? sizeAxis : colorAxis;
    const seen = axis === 'size' ? sizeSeen : colorSeen;
    for (const opt of attr.options ?? []) {
      const name = typeof opt?.name === 'string' ? opt.name.trim() : '';
      if (!name || typeof opt?.id !== 'number') continue;
      target.optionIdToName.set(opt.id, name);
      if (!seen.has(name)) {
        seen.add(name);
        target.names.push(name);
      }
    }
  }

  return { sizeAxis, colorAxis };
}

function resolveVariantAxisValues(
  variant: StockVariantCombination,
  sizeAxis: AxisIndex,
  colorAxis: AxisIndex
): { size: string | null; color: string | null } {
  let size: string | null = null;
  let color: string | null = null;
  for (const pair of variant?.options ?? []) {
    const optionId = pair?.option?.id;
    if (typeof optionId !== 'number') continue;
    if (size == null && sizeAxis.optionIdToName.has(optionId)) {
      size = sizeAxis.optionIdToName.get(optionId) ?? null;
    }
    if (color == null && colorAxis.optionIdToName.has(optionId)) {
      color = colorAxis.optionIdToName.get(optionId) ?? null;
    }
  }
  return { size, color };
}

function buildVariantRows(
  variants: StockVariantCombination[] | undefined | null,
  sizeAxis: AxisIndex,
  colorAxis: AxisIndex
): { rows: ProductVariantRow[]; sizes: string[]; colors: string[] } {
  const sizes = sizeAxis.names.length > 0 ? [...sizeAxis.names] : [PLACEHOLDER_SIZE];
  const colors =
    colorAxis.names.length > 0 ? [...colorAxis.names] : [PLACEHOLDER_COLOR];

  const stocksBySize = new Map<string, Record<string, VariantCell>>();
  for (const size of sizes) {
    const row: Record<string, VariantCell> = {};
    for (const color of colors) {
      row[color] = 'missing';
    }
    stocksBySize.set(size, row);
  }

  for (const variant of variants ?? []) {
    const { size, color } = resolveVariantAxisValues(variant, sizeAxis, colorAxis);
    const sizeKey = size ?? (sizeAxis.names.length === 0 ? PLACEHOLDER_SIZE : null);
    const colorKey =
      color ?? (colorAxis.names.length === 0 ? PLACEHOLDER_COLOR : null);
    if (!sizeKey || !colorKey) continue;

    const row = stocksBySize.get(sizeKey);
    if (!row || !(colorKey in row)) continue;

    const quantity = typeof variant.availableCount === 'number'
      ? variant.availableCount
      : 0;
    row[colorKey] = { quantity, status: statusFromQuantity(quantity) };
  }

  const rows: ProductVariantRow[] = sizes.map((size) => ({
    size,
    stocks: stocksBySize.get(size) ?? {},
  }));

  return { rows, sizes, colors };
}

export function apiSkuOrEmpty(api: StockProductApi): string {
  return typeof api.sku === 'string' ? api.sku : '';
}

export interface StockProductTransformOptions {
  dropEmptyAxes: boolean;
}

const DEFAULT_TRANSFORM_OPTIONS: StockProductTransformOptions = {
  dropEmptyAxes: false,
};

function isMissingCell(cell: VariantCell | undefined): boolean {
  return cell === undefined || cell === 'missing';
}

function dropEmptyAxisValues(
  sizes: string[],
  colors: string[],
  rows: ProductVariantRow[]
): { sizes: string[]; colors: string[]; variants: ProductVariantRow[] } {
  const keptColors = colors.filter((color) =>
    rows.some((row) => !isMissingCell(row.stocks[color]))
  );
  const variants = rows
    .map((row) => ({
      size: row.size,
      stocks: Object.fromEntries(
        keptColors.map((color) => [color, row.stocks[color]] as const)
      ),
    }))
    .filter((row) =>
      keptColors.some((color) => !isMissingCell(row.stocks[color]))
    );
  const keptSizes = sizes.filter((size) =>
    variants.some((row) => row.size === size)
  );
  return { sizes: keptSizes, colors: keptColors, variants };
}

export function apiToStockProduct(
  api: StockProductApi,
  options: StockProductTransformOptions = DEFAULT_TRANSFORM_OPTIONS
): StockProduct {
  const { sizeAxis, colorAxis } = buildAxes(api.attributes);
  const built = buildVariantRows(api.variants, sizeAxis, colorAxis);
  const axes = options.dropEmptyAxes
    ? dropEmptyAxisValues(built.sizes, built.colors, built.rows)
    : { sizes: built.sizes, colors: built.colors, variants: built.rows };

  return {
    id: api.id,
    name: api.name,
    sku: apiSkuOrEmpty(api),
    image: api.image,
    colors: axes.colors,
    sizes: axes.sizes,
    variants: axes.variants,
  };
}

export function apiListToStockProducts(
  list: StockProductApi[],
  options: StockProductTransformOptions = DEFAULT_TRANSFORM_OPTIONS
): StockProduct[] {
  return list.map((api) => apiToStockProduct(api, options));
}
