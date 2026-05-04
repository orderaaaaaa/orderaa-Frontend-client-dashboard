import uniq from 'lodash/uniq';
import type { StockProductApi, StockVariantOption } from '@/services/stock';
import { LOW_STOCK_THRESHOLD } from '../constants';
import type {
  StockProduct,
  StockStatus,
  ProductVariantRow,
  VariantStock,
} from '../types';

const SIZE_GROUP_PATTERN = /مقاس|size/i;
const COLOR_GROUP_PATTERN = /لون|color/i;

const PLACEHOLDER_SIZE = '-';
const PLACEHOLDER_COLOR = '-';

function normalizeGroupLabel(label: string): string {
  return label.trim();
}

function statusFromQuantity(quantity: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low';
  if (quantity < LOW_STOCK_THRESHOLD * 2) return 'medium';
  return 'high';
}

function groupVariants(variants: StockVariantOption[]) {
  const sizeOptions: StockVariantOption[] = [];
  const colorOptions: StockVariantOption[] = [];

  for (const variant of variants) {
    const label = normalizeGroupLabel(variant.groupLabel);
    if (SIZE_GROUP_PATTERN.test(label)) {
      sizeOptions.push(variant);
    } else if (COLOR_GROUP_PATTERN.test(label)) {
      colorOptions.push(variant);
    }
  }

  return { sizeOptions, colorOptions };
}

function buildVariantRows(
  sizeOptions: StockVariantOption[],
  colorOptions: StockVariantOption[]
): ProductVariantRow[] {
  const sizes =
    sizeOptions.length > 0
      ? uniq(sizeOptions.map((o) => o.value))
      : [PLACEHOLDER_SIZE];
  const colors =
    colorOptions.length > 0
      ? uniq(colorOptions.map((o) => o.value))
      : [PLACEHOLDER_COLOR];

  return sizes.map((size) => {
    const sizeOption =
      size === PLACEHOLDER_SIZE
        ? null
        : sizeOptions.find((o) => o.value === size) ?? null;

    const cellQuantity = sizeOption ? sizeOption.availableCount : 0;
    const cellStatus = statusFromQuantity(cellQuantity);

    const stocks: Record<string, VariantStock> = {};
    for (const color of colors) {
      stocks[color] = {
        quantity: cellQuantity,
        status: cellStatus,
      };
    }

    return { size, stocks };
  });
}

export function apiSkuOrEmpty(api: StockProductApi): string {
  return typeof api.sku === 'string' ? api.sku : '';
}

export function apiToStockProduct(api: StockProductApi): StockProduct {
  const { sizeOptions, colorOptions } = groupVariants(api.variants ?? []);

  const sizes =
    sizeOptions.length > 0
      ? uniq(sizeOptions.map((o) => o.value))
      : [PLACEHOLDER_SIZE];
  const colors =
    colorOptions.length > 0
      ? uniq(colorOptions.map((o) => o.value))
      : [PLACEHOLDER_COLOR];

  return {
    id: api.id,
    name: api.name,
    sku: apiSkuOrEmpty(api),
    image: api.image,
    colors,
    sizes,
    variants: buildVariantRows(sizeOptions, colorOptions),
  };
}

export function apiListToStockProducts(
  list: StockProductApi[]
): StockProduct[] {
  return list.map(apiToStockProduct);
}
