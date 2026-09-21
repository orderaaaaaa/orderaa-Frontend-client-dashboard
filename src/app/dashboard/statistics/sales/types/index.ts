export interface SalesRange {
  from: string;
  to: string;
  timezone: string;
}

export type SalesBreakdownDimension = 'STORE' | 'CARRIER' | 'PAGE';

export interface SalesMetrics {
  totalOrders: number;
  collectedOrders: number;
  suppliedAmount: string;
  piecesSold: number;
  purchasesTotal: string | null;
  soldPiecesCost: string;
  averageOrderPrice: string | null;
  collectedWithoutSettlement: number;
  uncostedPieces: number;
  grossMargin: string;
}

export interface SalesBreakdownRow {
  dimension: SalesBreakdownDimension;
  key: string;
  label: string;
  metrics: SalesMetrics;
}

export interface SalesStatisticsResponse {
  range: SalesRange;
  previousRange: SalesRange;
  approvedOnly: boolean;
  totals: SalesMetrics;
  previousTotals: SalesMetrics;
  breakdown: SalesBreakdownRow[];
}

export interface FilterOption {
  key: string;
  label: string;
}

export interface SalesStatisticsFilterOptions {
  stores: FilterOption[];
  carriers: FilterOption[];
  pages: FilterOption[];
}

export interface SalesStatisticsParams {
  from: string;
  to: string;
  storeIds?: number[];
  carrierKeys?: string[];
  pageNames?: string[];
  approvedOnly: boolean;
}
