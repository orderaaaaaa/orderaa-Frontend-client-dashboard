import { STOCK_SHORTAGE_CODE_LABELS } from '@/constants/orderSystemFailures';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useWarehousesQuery } from '@/services/warehouses';
import type { FailureStockShortage } from '@/types/orderSystemFailures';

export function StockShortageDetails({ shortage }: { shortage: FailureStockShortage }) {
  const canReadWarehouses = useHasPermission(PERMISSION_CODES.WAREHOUSES_READ);
  const hasWarehouseBlock = shortage.blocks.some((block) => block.warehouseId !== null);
  const { data: warehouses } = useWarehousesQuery(
    { limit: 1000 },
    { enabled: canReadWarehouses && hasWarehouseBlock }
  );

  const warehouseLabelOf = (warehouseId: number | null) => {
    if (warehouseId === null) return 'بدون مخزن محدد';
    const name = warehouses?.data?.find((warehouse) => warehouse.id === warehouseId)?.name;
    return name ?? `المخزن رقم ${warehouseId}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-red-700 font-medium">
        {STOCK_SHORTAGE_CODE_LABELS[shortage.code] ?? shortage.code}
      </p>
      {shortage.blocks.map((block, blockIndex) => (
        <div key={`${block.warehouseId ?? 'none'}-${blockIndex}`} className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">
            {warehouseLabelOf(block.warehouseId)}
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 text-start">
                  <th className="py-1 text-start font-normal">المنتج</th>
                  <th className="py-1 text-start font-normal">النوع</th>
                  <th className="py-1 text-start font-normal">المطلوب</th>
                  <th className="py-1 text-start font-normal">المتاح</th>
                </tr>
              </thead>
              <tbody>
                {block.lines.map((line, lineIndex) => (
                  <tr key={`${line.variantId}-${lineIndex}`} className="border-t border-gray-100">
                    <td className="py-1">{line.productName}</td>
                    <td className="py-1">{line.variantLabel || '—'}</td>
                    <td className="py-1">{line.required}</td>
                    <td className="py-1 text-red-600">{Math.max(0, line.available)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
