import ShippingMatchCell from './ShippingMatchCell';
import type { SettlementShippingInfo } from '@/lib/api/settlement';

export function SettlementShippingColumnHeaders() {
  return (
    <>
      <th className="px-4 py-2 text-right font-medium">المحافظة</th>
      <th className="px-4 py-2 text-right font-medium">إجمالي الطلب</th>
      <th className="px-4 py-2 text-right font-medium">تكلفة الشحن</th>
    </>
  );
}

interface SettlementShippingColumnCellsProps {
  shipping: SettlementShippingInfo | null;
}

export function SettlementShippingColumnCells({ shipping }: SettlementShippingColumnCellsProps) {
  return (
    <>
      <td className="px-4 py-2">{shipping?.governorate ?? '—'}</td>
      <td className="px-4 py-2">{shipping?.totalCost ?? '—'}</td>
      <td className="px-4 py-2">
        <ShippingMatchCell shipping={shipping} />
      </td>
    </>
  );
}
