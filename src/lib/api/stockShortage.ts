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

export interface InsufficientStockBody<Code extends string = 'INSUFFICIENT_STOCK_FOR_VARIANT'> {
  statusCode: number;
  code: Code;
  message: string;
  warehouseId: number;
  warehouseName: string;
  lines: ShortageLineApi[];
  orderCode?: string;
}

export type OutboundInsufficientStockBody = InsufficientStockBody<typeof OUTBOUND_INSUFFICIENT_STOCK_CODE>;

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
