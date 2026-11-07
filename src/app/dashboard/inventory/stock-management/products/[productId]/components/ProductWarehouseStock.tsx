'use client';

import { StockQuantityCell } from '@/components/stock/StockQuantityCell';
import { EmptyState } from '@/components/ui/state-panels';
import type { ProductStockDto } from '@/lib/api/productStock';
import { AdjustRowButton, VariantIdentity } from './VariantParts';
import { quantityIn } from './quantityIn';

const HIDDEN_WAREHOUSE_LABEL = 'مخزن غير ظاهر';

interface ProductWarehouseStockProps {
  stock: ProductStockDto;
  canAdjustRow: boolean;
  onAdjust(variantId: number): void;
}

export function ProductWarehouseStock({ stock, canAdjustRow, onAdjust }: ProductWarehouseStockProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">المخزون حسب المخزن</h3>
      {stock.variants.length === 0 ? (
        <EmptyState title="لا توجد متغيرات لهذا المنتج" />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">
                    المتغير
                  </th>
                  {stock.warehouses.map((warehouse) => (
                    <th key={warehouse.id} scope="col" className="px-3 py-2.5 text-start font-medium">
                      <span className="break-words">{warehouse.name ?? HIDDEN_WAREHOUSE_LABEL}</span>
                      {!warehouse.isActive && (
                        <span className="block text-xs font-normal text-muted-foreground">غير نشط</span>
                      )}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2.5 text-start font-medium">
                    الإجمالي
                  </th>
                  {canAdjustRow && (
                    <th scope="col" className="sticky end-0 z-[1] bg-muted px-3 py-2.5 text-end font-medium">
                      الإجراءات
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stock.variants.map((variant) => (
                  <tr key={variant.variantId}>
                    <td className="px-3 py-2.5">
                      <VariantIdentity label={variant.variantLabel || stock.product.name} sku={variant.sku} />
                    </td>
                    {stock.warehouses.map((warehouse) => (
                      <td key={warehouse.id} className="px-3 py-2.5">
                        <StockQuantityCell quantity={quantityIn(variant, warehouse.id)} tone="muted" />
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <StockQuantityCell quantity={variant.totalQuantity} />
                    </td>
                    {canAdjustRow && (
                      <td className="sticky end-0 z-[1] bg-card px-3 py-2.5 text-end">
                        <AdjustRowButton onClick={() => onAdjust(variant.variantId)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {stock.variants.map((variant) => (
              <div key={variant.variantId} className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <VariantIdentity label={variant.variantLabel || stock.product.name} sku={variant.sku} breakSku />
                  </div>
                  {canAdjustRow && (
                    <AdjustRowButton className="shrink-0" onClick={() => onAdjust(variant.variantId)} />
                  )}
                </div>
                <ul className="flex flex-col divide-y divide-border">
                  {stock.warehouses.map((warehouse) => (
                    <li key={warehouse.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="break-words text-sm text-foreground">
                          {warehouse.name ?? HIDDEN_WAREHOUSE_LABEL}
                        </span>
                        {!warehouse.isActive && (
                          <span className="text-xs text-muted-foreground">غير نشط</span>
                        )}
                      </div>
                      <StockQuantityCell quantity={quantityIn(variant, warehouse.id)} tone="muted" />
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-2 text-sm">
                  <span className="font-semibold text-foreground">الإجمالي</span>
                  <StockQuantityCell quantity={variant.totalQuantity} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
