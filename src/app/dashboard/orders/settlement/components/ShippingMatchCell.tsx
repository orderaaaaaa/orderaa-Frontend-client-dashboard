'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ShippingMatch, SettlementShippingInfo } from '@/lib/api/settlement';

const SHIPPING_MATCH_STYLES: Record<ShippingMatch, { className: string; suffix: string }> = {
  MATCH: { className: 'text-green-700 bg-green-50', suffix: '' },
  MISMATCH: { className: 'text-amber-800 bg-amber-50', suffix: '' },
  UNKNOWN: { className: 'text-gray-500 bg-gray-100', suffix: '؟' },
};

interface ShippingMatchCellProps {
  shipping: SettlementShippingInfo | null;
}

export default function ShippingMatchCell({ shipping }: ShippingMatchCellProps) {
  if (!shipping) return null;

  const style = SHIPPING_MATCH_STYLES[shipping.shippingMatch];
  const tooltipText =
    shipping.expectedShippingCost !== null
      ? `التكلفة المتوقعة ${shipping.expectedShippingCost} جنيه`
      : 'لم يتم ضبط تكلفة الشحن لهذه المحافظة';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${style.className}`}
        >
          {shipping.sheetShippingCost} {style.suffix}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
