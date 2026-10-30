import { cn } from '@/lib/utils';
import { formatStockNumber } from '@/utils/format';

interface StockQuantityCellProps {
  quantity: number;
  tone?: 'auto' | 'muted';
}

export function StockQuantityCell({
  quantity,
  tone = 'auto',
}: StockQuantityCellProps) {
  const toneClass =
    quantity < 0
      ? 'text-destructive'
      : tone === 'muted' || quantity === 0
        ? 'text-muted-foreground'
        : 'text-foreground';

  return (
    <span dir="ltr" className={cn('font-semibold tabular-nums', toneClass)}>
      {formatStockNumber(quantity)}
    </span>
  );
}
