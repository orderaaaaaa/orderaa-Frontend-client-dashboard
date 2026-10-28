import { STOCK_SHORTAGE_CODE_LABELS } from '@/constants/orderSystemFailures';
import { useWarehouseOptions } from '@/services/warehouses';
import type { FailureStockShortage, FailureStockShortageBlock } from '@/types/orderSystemFailures';

export function StockShortageDetails({ shortage }: { shortage: FailureStockShortage }) {
  const { warehouses } = useWarehouseOptions();

  const warehouseLabelOf = (block: FailureStockShortageBlock) => {
    if (block.warehouseName) return block.warehouseName;
    if (block.warehouseId === null) return 'بدون مخزن محدد';
    const name = warehouses.find((warehouse) => warehouse.id === block.warehouseId)?.name;
    return name ?? `المخزن رقم ${block.warehouseId}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-red-700 font-medium">
        {STOCK_SHORTAGE_CODE_LABELS[shortage.code] ?? shortage.code}
      </p>
      {shortage.blocks.map((block, blockIndex) => (
        <div key={`${block.warehouseId ?? 'none'}-${blockIndex}`} className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-600">
            {warehouseLabelOf(block)}
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
