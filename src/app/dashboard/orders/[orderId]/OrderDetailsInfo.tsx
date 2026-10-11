import React from 'react';
import { Order, OrderStatus, OrderLockedBy, FilterOrdersDto } from '@/types/orders';

import OrderDetailsCardId from '@/components/OrderDetails/OrderDetailsCardId';
import OrderDetailsInfoStatus from '@/components/OrderDetails/OrderDetailsInfoStatus';
import OrderDetailsProductCard from '@/components/OrderDetails/OrderDetailsProductCard';
import OrderDetailsInfoComponent from '@/components/OrderDetails/OrderDetailsInfo';
import OrderSystemFailuresPanel from '@/components/OrderDetails/SystemFailures/OrderSystemFailuresPanel';
import OrderChangeHistoryCard from '@/components/OrderDetails/ChangeHistory/OrderChangeHistoryCard';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';

interface OrderDetailsInfoProps {
  order: Order;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  onNoOrdersFound?: () => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: string | null;
  navigationFilters?: FilterOrdersDto;
  isLockedByOther?: boolean;
  lockedBy?: OrderLockedBy | null;
  bypassedLockedBy?: OrderLockedBy | null;
  onForceUnlock?: () => void;
  isForceUnlocking?: boolean;
  isBlocked?: boolean;
  onUnlock?: () => Promise<void>;
}

function OrderDetailsInfo({
  order,
  onNavigateToNextOrder,
  onNoOrdersFound,
  dateRange,
  statusFilter,
  navigationFilters,
  isLockedByOther,
  lockedBy,
  bypassedLockedBy,
  onForceUnlock,
  isForceUnlocking,
  isBlocked,
  onUnlock,
}: OrderDetailsInfoProps) {
  const canReadHistory = useHasPermission(PERMISSION_CODES.ORDERS_HISTORY_READ);

  return (
    <section className="mx-auto mt-3 p-4 bg-white rounded-lg shadow-sm">
      <OrderDetailsCardId
        order={order}
        isLockedByOther={isLockedByOther}
        lockedBy={lockedBy}
        bypassedLockedBy={bypassedLockedBy}
        onForceUnlock={onForceUnlock}
        isForceUnlocking={isForceUnlocking}
      />
      <OrderDetailsInfoStatus order={order} isLockedByOther={isLockedByOther} />
      <OrderSystemFailuresPanel order={order} />
      {canReadHistory && <OrderChangeHistoryCard order={order} />}
      <OrderDetailsProductCard
        order={order}
        isLockedByOther={isLockedByOther}
      />
      <OrderDetailsInfoComponent
        order={order}
        onNavigateToNextOrder={onNavigateToNextOrder}
        onNoOrdersFound={onNoOrdersFound}
        dateRange={dateRange}
        statusFilter={statusFilter}
        navigationFilters={navigationFilters}
        onUnlock={onUnlock}
      />
    </section>
  );
}

export default OrderDetailsInfo;
