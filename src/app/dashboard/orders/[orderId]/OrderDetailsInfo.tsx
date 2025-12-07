import React from "react";
import { Order, OrderStatus } from "@/types/orders";

import OrderDetailsCardId from "@/components/OrderDetails/OrderDetailsCardId";
import OrderDetailsInfoStatus from "@/components/OrderDetails/OrderDetailsInfoStatus";
import OrderDetailsProductCard from "@/components/OrderDetails/OrderDetailsProductCard";
import OrderDetailsInfoComponent from "@/components/OrderDetails/OrderDetailsInfo";

interface OrderDetailsInfoProps {
  order: Order;
  onOrderUpdate?: (updatedOrder: Order) => void;
  onNavigateToNextOrder?: (nextOrderId: number) => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: OrderStatus | null;
}

function OrderDetailsInfo({
  order,
  onOrderUpdate,
  onNavigateToNextOrder,
  dateRange,
  statusFilter
}: OrderDetailsInfoProps) {
  return (
    <section className="mx-auto mt-3 p-4 bg-white rounded-lg shadow-sm">
      <OrderDetailsCardId order={order} />
      <OrderDetailsInfoStatus order={order} />
      <OrderDetailsProductCard order={order} />
      <OrderDetailsInfoComponent
        order={order}
        onOrderUpdate={onOrderUpdate}
        onNavigateToNextOrder={onNavigateToNextOrder}
        dateRange={dateRange}
        statusFilter={statusFilter}
      />
    </section>
  );
}

export default OrderDetailsInfo;
