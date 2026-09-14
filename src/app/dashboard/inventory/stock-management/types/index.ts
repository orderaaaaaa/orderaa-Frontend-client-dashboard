export type StockStatus = 'high' | 'medium' | 'low' | 'out_of_stock' | 'shortage';

export type StockScope =
  | { kind: 'all' }
  | { kind: 'physical'; id: number }
  | { kind: 'virtual'; id: number };

export type StockScopeKind = StockScope['kind'];

export interface VariantStock {
  quantity: number;
  status: StockStatus;
}

export interface ProductVariantRow {
  size: string;
  stocks: Record<string, VariantStock | null>;
}

export interface StockProduct {
  id: number;
  name: string;
  sku: string;
  image: string;
  colors: string[];
  sizes: string[];
  variants: ProductVariantRow[];
}

export interface StockFilters {
  searchQuery: string;
  color: string;
  size: string;
  warehouseId: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: '' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}
