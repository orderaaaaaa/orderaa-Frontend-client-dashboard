import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/format';

interface VarianceChipProps {
  delta: number | null;
}

export function VarianceChip({ delta }: VarianceChipProps) {
  if (delta === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const toneClass =
    delta > 0
      ? 'bg-success/10 text-success'
      : delta < 0
        ? 'bg-destructive/10 text-destructive'
        : 'bg-muted text-muted-foreground';
  const text = delta > 0 ? `+${formatNumber(delta)}` : formatNumber(delta);

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
