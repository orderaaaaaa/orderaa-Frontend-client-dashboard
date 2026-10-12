import { ChevronDown } from 'lucide-react';
import ShippingMatchCell, { ShippingMatchBadge, shippingExpectationText } from './ShippingMatchCell';
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

export function SettlementShippingDisclosure({ shipping }: SettlementShippingColumnCellsProps) {
  if (!shipping) return null;
  return (
    <details className="group rounded-md bg-gray-50 px-3">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
        بيانات الشحن
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 pb-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">المحافظة</dt>
          <dd className="font-medium break-words">{shipping.governorate ?? '—'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">إجمالي الطلب</dt>
          <dd className="font-medium">{shipping.totalCost}</dd>
        </div>
        <div className="col-span-2 min-w-0">
          <dt className="text-xs text-muted-foreground">تكلفة الشحن</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <ShippingMatchBadge shipping={shipping} />
            <span className="text-xs text-muted-foreground">{shippingExpectationText(shipping)}</span>
          </dd>
        </div>
      </dl>
    </details>
  );
}
