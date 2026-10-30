import { cn } from '@/lib/utils';
import { formatStockNumber, toStockNumber } from '@/utils/format';

interface VarianceChipProps {
  delta: number | null;
}

export function VarianceChip({ delta }: VarianceChipProps) {
  const amount = toStockNumber(delta);
  const toneClass =
    amount > 0
      ? 'bg-success/10 text-success'
      : amount < 0
        ? 'bg-destructive/10 text-destructive'
        : 'bg-muted text-muted-foreground';
  const text = amount > 0 ? `+${formatStockNumber(amount)}` : formatStockNumber(amount);

  return (
    <span
      dir="ltr"
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        toneClass
      )}
    >
      {text}
    </span>
  );
}
