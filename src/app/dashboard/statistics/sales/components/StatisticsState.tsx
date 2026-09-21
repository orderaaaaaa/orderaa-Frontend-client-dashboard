import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StatisticsStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function StatisticsState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
}: StatisticsStateProps) {
  return (
    <div
      className={cn(
        'bg-card border border-dashed border-border rounded-2xl p-10 text-center',
        className,
      )}
    >
      {Icon && <Icon className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />}
      <p className="mt-4 text-base font-medium text-foreground">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
