'use client';

import Input from '@/components/ui/Input';
import type { CountSheetRowApi } from '@/lib/api/stockCount';

interface OpeningCountTableProps {
  rows: CountSheetRowApi[];
  countedValueOf: (row: CountSheetRowApi) => string;
  isInvalid: (raw: string) => boolean;
  onCountedChange: (row: CountSheetRowApi, raw: string) => void;
}

export function OpeningCountTable({
  rows,
  countedValueOf,
  isInvalid,
  onCountedChange,
}: OpeningCountTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" dir="rtl">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
              المنتج / المتغير
            </th>
            <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
              SKU
            </th>
            <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
              الكمية بالنظام
            </th>
            <th className="py-2.5 px-3 text-right font-semibold text-gray-700">
              العدد الفعلي
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const raw = countedValueOf(row);
            return (
              <tr key={row.variantId} className="border-b border-gray-100">
                <td className="py-2 px-3">
                  <p className="font-medium text-gray-900">{row.productName}</p>
                  <p className="text-xs text-gray-400">{row.combinationKey}</p>
                </td>
                <td className="py-2 px-3 text-gray-600">{row.sku ?? '—'}</td>
                <td className="py-2 px-3 text-gray-600">{row.quantity}</td>
                <td className="py-2 px-3">
                  <Input
                    type="number"
                    value={raw}
                    onChange={(e) => onCountedChange(row, e.target.value)}
                    error={isInvalid(raw) ? 'رقم صحيح غير سالب' : undefined}
                    inputClassName="w-28 border-gray-200 px-3 py-2 text-sm"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
