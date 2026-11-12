'use client';

import React from 'react';
import ReturnSourceOrderCard from './ReturnSourceOrderCard';
import type { CustomerReturnSourceOrder } from '@/types/customer-return';

type ReturnSourceOrdersProps = {
  orders: CustomerReturnSourceOrder[];
  selectedIds: ReadonlySet<number>;
  onToggleUnit: (orderProductId: number) => void;
  onToggleOrder: (orderProductIds: number[], select: boolean) => void;
};

function ReturnSourceOrders({
  orders,
  selectedIds,
  onToggleUnit,
  onToggleOrder,
}: ReturnSourceOrdersProps) {
  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <ReturnSourceOrderCard
          key={order.id}
          order={order}
          selectedIds={selectedIds}
          onToggleUnit={onToggleUnit}
          onToggleOrder={onToggleOrder}
        />
      ))}
    </div>
  );
}

export default ReturnSourceOrders;
