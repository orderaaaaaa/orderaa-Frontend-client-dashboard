import React from 'react';
import { Order, OrderStatus, OrderLockedBy } from '@/types/orders';

import OrderDetailsCardId from '@/components/OrderDetails/OrderDetailsCardId';
import OrderDetailsInfoStatus from '@/components/OrderDetails/OrderDetailsInfoStatus';
import OrderDetailsProductCard from '@/components/OrderDetails/OrderDetailsProductCard';
import OrderDetailsInfoComponent from '@/components/OrderDetails/OrderDetailsInfo';

interface OrderDetailsInfoProps {
  order: Order;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  onNoOrdersFound?: () => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: OrderStatus | null;
  isLockedByOther?: boolean;
  lockedBy?: OrderLockedBy | null;
  onUnlock?: () => Promise<void>;
}

function OrderDetailsInfo({
  order,
  onNavigateToNextOrder,
  onNoOrdersFound,
  dateRange,
  statusFilter,
  isLockedByOther,
  lockedBy,
  onUnlock,
}: OrderDetailsInfoProps) {
  return (
    <section className="mx-auto mt-3 p-4 bg-white rounded-lg shadow-sm">
      <OrderDetailsCardId
        order={order}
        isLockedByOther={isLockedByOther}
        lockedBy={lockedBy}
      />
      <OrderDetailsInfoStatus order={order} isLockedByOther={isLockedByOther} />
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
        isLockedByOther={isLockedByOther}
        onUnlock={onUnlock}
      />
    </section>
  );
}

export default OrderDetailsInfo;
