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

export interface OrderStockRepairResult {
  orderId: number;
  status: string;
  repaired: RepairedVariant[];
}
