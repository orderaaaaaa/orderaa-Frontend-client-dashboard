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
  runningOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  returnsExpense: string;
  returnsWithoutSettlement: number;
  expenses: string;
  netProfit: string;
  runningNormalOrders: number;
  returnedNormalOrders: number;
  pendingCollectionAmount: string;
  ordersWithoutFee: number;
  deliveredProductsCost: string;
  ordersWithoutCost: number;
  pendingProfit: string;
  pendingProfitExcludedOrders: number;
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

export type SalesOrderSet =
  | 'TOTAL'
  | 'RUNNING'
  | 'DELIVERED'
  | 'COLLECTED'
  | 'CANCELLED'
  | 'RETURNS'
  | 'RETURNS_EXPENSES'
  | 'DELIVERED_COST'
  | 'PENDING_PROFIT';

export type SalesPieceSet = 'PIECES_SOLD' | 'PIECES_COST';

export type SalesSubPageSet = SalesOrderSet | SalesPieceSet;

export type SalesDerivedKind = 'PARTIAL_REMAINDER' | 'REPLACEMENT' | 'EXCHANGE_RETURN';

export type SalesExclusionReason = 'NO_FEE' | 'NO_COST' | 'NO_FEE_NO_COST';

export interface SalesOrderRow {
  orderId: number;
  code: string;
  status: string;
  derivedKind: SalesDerivedKind | null;
  createdAt: string;
  customerName: string;
  customerPhone: string | null;
  governorate: string | null;
  city: string | null;
  totalCost: string;
  shippingCost: string | null;
  storeName: string | null;
  pageName: string | null;
  carrierKey: string | null;
  carrierName: string | null;
  shippingCode: string | null;
  legCode: string | null;
  cancelReason: string | null;
  cancelNotes: string | null;
  settlementAmount: string | null;
  settlementRecordedAt: string | null;
  settlementCode: string | null;
  collectedAmount: string | null;
  isCollected: boolean;
  confirmedByName: string | null;
  deliveredAt: string | null;
  returnReason: string | null;
  returnNotes: string | null;
  shippingCancelReason: string | null;
  shippingCancelNotes: string | null;
  governorateFee: string | null;
  productsCost: string | null;
  pendingProfit: string | null;
  uncostedPieces: number | null;
  feeMissing: boolean | null;
  costMissing: boolean | null;
  exclusionReason: SalesExclusionReason | null;
}

export interface SalesOrdersSummary {
  count: number;
  amount: string | null;
  withoutAmount: number;
  eligibleCount: number | null;
  excludedCount: number | null;
  feeMissingCount: number | null;
  costMissingCount: number | null;
}

export interface SalesOrdersResponse {
  set: SalesOrderSet;
  range: SalesRange;
  approvedOnly: boolean;
  includesDerived: boolean;
  summary: SalesOrdersSummary;
  rows: SalesOrderRow[];
}

export interface SalesPiecesTotals {
  piecesSold: number;
  soldPiecesCost: string;
  uncostedPieces: number;
}

export interface SalesPieceVariant {
  variantId: number;
  label: string;
  sku: string | null;
  piecesSold: number;
  avgUnitCost: string | null;
  soldPiecesCost: string;
  uncostedPieces: number;
}

export interface SalesPieceProduct {
  productId: number;
  name: string;
  piecesSold: number;
  soldPiecesCost: string;
  uncostedPieces: number;
  variants: SalesPieceVariant[];
}

export interface SalesPiecesResponse {
  range: SalesRange;
  approvedOnly: boolean;
  totals: SalesPiecesTotals;
  products: SalesPieceProduct[];
}

export type SalesLifetimePiecesResponse = Omit<SalesPiecesResponse, 'range'>;

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
