import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OrderChipProps {
  order: { id: number; code: string } | null;
}

export const orderHrefOf = (orderId: number) => `/dashboard/orders/${orderId}`;

export function OrderChip({ order }: OrderChipProps) {
  if (!order) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <Link
      href={orderHrefOf(order.id)}
      className={cn(
        'inline-flex max-w-full items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-primary-text transition-colors hover:bg-primary/5'
      )}
    >
      <span dir="ltr" className="truncate tabular-nums">
        {order.code}
      </span>
    </Link>
  );
}
