export const OUTBOUND_INSUFFICIENT_STOCK_CODE = 'OUTBOUND_INSUFFICIENT_STOCK';

export interface ShortageLineApi {
  variantId: number;
  warehouseId: number;
  warehouseName: string;
  productName: string;
  variantLabel: string;
  required: number;
  available: number;
}

export type ShortageRenderLine = Pick<
  ShortageLineApi,
  'variantId' | 'productName' | 'variantLabel' | 'required' | 'available'
> & { warehouseName?: string };

export interface InsufficientStockBody {
  statusCode: number;
  code: 'INSUFFICIENT_STOCK_FOR_VARIANT';
  message: string;
  warehouseId: number;
  warehouseName: string;
  lines: ShortageLineApi[];
  orderCode?: string;
}

export interface OutboundShortageLineApi extends Omit<ShortageLineApi, 'variantId'> {
  variantId: number | null;
}

export interface OutboundInsufficientStockBody {
  statusCode: number;
  code: typeof OUTBOUND_INSUFFICIENT_STOCK_CODE;
  message: string;
  warehouseId: number;
  warehouseName: string;
  lines: OutboundShortageLineApi[];
  orderCode?: string;
}

export interface BatchShortageOrder {
  orderCode: string;
  reason: 'SHORTAGE' | 'CONFIRMATION_BLOCKED';
  warehouseName?: string;
  lines: ShortageRenderLine[];
}

export interface BatchInsufficientStockBody {
  statusCode: number;
  code: 'BATCH_INSUFFICIENT_STOCK';
  message: string;
  orders: BatchShortageOrder[];
}
