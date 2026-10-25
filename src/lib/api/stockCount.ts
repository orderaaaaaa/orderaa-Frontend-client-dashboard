import api from './index';
import type { WarehouseVariantOption } from './warehouses';

export interface CountSheetParams {
  warehouseId: number;
  search?: string;
  page: number;
  pageSize: number;
}

export interface CountSheetRowApi {
  variantId: number;
  productId: number;
  productName: string;
  sku: string | null;
  barcode: string | null;
  combinationKey: string;
  quantity: number;
  options: WarehouseVariantOption[];
}

export interface CountSheetPageApi {
  data: CountSheetRowApi[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getCountSheet(
  params: CountSheetParams
): Promise<CountSheetPageApi> {
  const response = await api.get('/stock-movements/count-sheet', { params });
  return response.data as CountSheetPageApi;
}
