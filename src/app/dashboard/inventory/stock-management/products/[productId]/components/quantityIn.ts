import type { ProductStockVariantDto } from '@/lib/api/productStock';

export function quantityIn(variant: ProductStockVariantDto, warehouseId: number): number {
  return variant.byWarehouse.find((cell) => cell.warehouseId === warehouseId)?.quantity ?? 0;
}
