import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StocktakeStatusWire } from '../../types/stocktake';

const STATUS_LABELS: Record<StocktakeStatusWire, string> = {
  OPEN: 'مفتوحة',
  POSTED: 'مرحّلة',
  CANCELLED: 'ملغاة',
};

const STATUS_CLASSES: Record<StocktakeStatusWire, string> = {
  OPEN: 'border-transparent bg-primary/10 text-primary',
  POSTED: 'border-transparent bg-success/10 text-success',
  CANCELLED: 'border-transparent bg-muted text-muted-foreground',
};

interface StocktakeStatusChipProps {
  status: StocktakeStatusWire;
  className?: string;
}

export function StocktakeStatusChip({ status, className }: StocktakeStatusChipProps) {
  return (
    <Badge className={cn('rounded-full px-2.5 py-1', STATUS_CLASSES[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
