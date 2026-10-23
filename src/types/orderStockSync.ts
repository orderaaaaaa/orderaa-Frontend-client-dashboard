export interface OrderStockDriftItem {
  orderId: number;
  orderCode: string;
  variantId: number;
  productName: string;
  variantLabel: string;
  fromWarehouseId: number | null;
  toWarehouseId: number | null;
  lines: number;
  net: number;
  difference: number;
}

export interface PreparedDriftPage {
  items: OrderStockDriftItem[];
  nextCursor: number | null;
}

export interface RepairedVariant {
  variantId: number;
  difference: number;
  fromWarehouseId: number;
  toWarehouseId: number;
}

export const STOCK_REPAIR_KIND = {
  PREPARED_DRIFT: 'PREPARED_DRIFT',
  RETURN_TO_CREATION: 'RETURN_TO_CREATION',
} as const;

export type StockRepairKind =
  (typeof STOCK_REPAIR_KIND)[keyof typeof STOCK_REPAIR_KIND];

export interface OrderStockRepairResult {
  orderId: number;
  status: string;
  kind: StockRepairKind;
  repaired: RepairedVariant[];
}
