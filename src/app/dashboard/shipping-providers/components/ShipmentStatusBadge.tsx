'use client';

import clsx from 'clsx';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { getStatusBadgeConfig } from '@/lib/status-badges';
import type { OrderStatus } from '@/types/orders';

export function ShipmentStatusBadge({ status }: { status: OrderStatus }) {
  const { getStatusLabel } = useStatusLabel();
  const { classes, Icon } = getStatusBadgeConfig(status);

  return (
    <span
      className={clsx(
        'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium w-fit whitespace-nowrap',
        classes,
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-medium">{getStatusLabel(status)}</span>
    </span>
  );
}
