import api from './index';
import type {
  AdjustStockBatchDto,
  StockBatchResult,
  StockTimelinePageDto,
  StockTimelineQueryParams,
} from './warehouses';

export interface ProductStockCellDto {
  warehouseId: number;
  warehouseName: string | null;
  visibleToMerchant: boolean;
  quantity: number;
}

export interface ProductStockOptionDto {
  attribute: { id: number; name: string };
  option: { id: number; name: string };
}

export interface ProductStockVariantDto {
  variantId: number;
  variantLabel: string;
  sku: string | null;
  options: ProductStockOptionDto[];
  totalQuantity: number;
  byWarehouse: ProductStockCellDto[];
}

export interface ProductStockWarehouseDto {
  id: number;
  name: string | null;
  visibleToMerchant: boolean;
  isActive: boolean;
}

export interface ProductStockDto {
  product: { id: number; name: string };
  warehouses: ProductStockWarehouseDto[];
  variants: ProductStockVariantDto[];
  summary: {
    totalQuantity: number;
    warehousesWithStock: number;
    outOfStockVariants: number;
  };
}

export async function getProductStock(productId: number): Promise<ProductStockDto> {
  const response = await api.get(`/stock-movements/products/${productId}/stock`);
  return response.data as ProductStockDto;
}

export async function getStockTimelinePage(
  params: StockTimelineQueryParams
): Promise<StockTimelinePageDto> {
  const response = await api.get('/stock-movements/timeline', { params });
  return response.data as StockTimelinePageDto;
}

export async function adjustStockBatch(
  body: AdjustStockBatchDto
): Promise<StockBatchResult> {
  const response = await api.post('/stock-movements/adjustments/batch', body);
  return response.data as StockBatchResult;
}
