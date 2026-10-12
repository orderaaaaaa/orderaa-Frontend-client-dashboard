'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
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

export function shippingExpectationText(shipping: SettlementShippingInfo): string {
  return shipping.expectedShippingCost !== null
    ? `التكلفة المتوقعة ${shipping.expectedShippingCost} جنيه`
    : 'لم يتم ضبط تكلفة الشحن لهذه المحافظة';
}

interface ShippingMatchBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  shipping: SettlementShippingInfo;
}

export const ShippingMatchBadge = forwardRef<HTMLSpanElement, ShippingMatchBadgeProps>(
  function ShippingMatchBadge({ shipping, className, ...rest }, ref) {
    const style = SHIPPING_MATCH_STYLES[shipping.shippingMatch];
    return (
      <span
        ref={ref}
        {...rest}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold',
          style.className,
          className,
        )}
      >
        {shipping.sheetShippingCost} {style.suffix}
      </span>
    );
  },
);

export default function ShippingMatchCell({ shipping }: ShippingMatchCellProps) {
  if (!shipping) return null;

  const tooltipText = shippingExpectationText(shipping);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ShippingMatchBadge shipping={shipping} />
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
