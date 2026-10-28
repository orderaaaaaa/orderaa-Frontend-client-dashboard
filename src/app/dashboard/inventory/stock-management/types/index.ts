import type { VariantDisplayItem } from '@/lib/variantOptionLabel';

export type StockStatus = 'high' | 'medium' | 'low' | 'out_of_stock' | 'shortage';

export type StockScope =
  | { kind: 'physical'; id: number }
  | { kind: 'virtual'; id: number };

export type StockScopeKind = StockScope['kind'];

export interface VariantStock {
  quantity: number;
  status: StockStatus;
}

export type VariantCell = VariantStock | 'missing';

export interface ProductVariantRow {
  size: string;
  stocks: Record<string, VariantCell>;
}

export interface OtherOptionVariant {
  variantId: number;
  size: string | null;
  color: string | null;
  options: VariantDisplayItem[];
  quantity: number;
  status: StockStatus;
}

export interface StockProduct {
  id: number;
  name: string;
  sku: string;
  image: string;
  colors: string[];
  sizes: string[];
  variants: ProductVariantRow[];
  otherVariants: OtherOptionVariant[];
}

export interface StockFilters {
  searchQuery: string;
  color: string;
  size: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
