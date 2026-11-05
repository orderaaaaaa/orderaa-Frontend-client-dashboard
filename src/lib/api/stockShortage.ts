export const OUTBOUND_INSUFFICIENT_STOCK_CODE = 'OUTBOUND_INSUFFICIENT_STOCK';
export const AVAILABLE_WAREHOUSE_NOT_SET_CODE = 'AVAILABLE_WAREHOUSE_NOT_SET';
export const AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE = 'AVAILABLE_STOCK_WOULD_GO_NEGATIVE';
export const TRANSFER_WAREHOUSE_NOT_ALLOWED_CODE = 'TRANSFER_WAREHOUSE_NOT_ALLOWED';

export interface AvailableStockRefusalLine {
  variantId: number;
  productName: string;
  variantLabel: string;
  available: number;
  change: number;
  after: number;
}

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

export type BatchShortageOrder =
  | {
      orderCode: string;
      reason: 'SHORTAGE' | 'CONFIRMATION_BLOCKED' | typeof AVAILABLE_WAREHOUSE_NOT_SET_CODE;
      warehouseName?: string;
      lines: ShortageRenderLine[];
    }
  | {
      orderCode: string;
      reason: typeof AVAILABLE_STOCK_WOULD_GO_NEGATIVE_CODE;
      warehouseName?: string;
      lines: AvailableStockRefusalLine[];
    };

export interface BatchInsufficientStockBody {
  statusCode: number;
  code: 'BATCH_INSUFFICIENT_STOCK';
  message: string;
  orders: BatchShortageOrder[];
}
