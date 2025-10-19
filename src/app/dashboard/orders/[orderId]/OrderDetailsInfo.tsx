import React from "react";
import { Order } from "@/types/orders";

import OrderDetailsCardId from "@/components/OrderDetails/OrderDetailsCardId";
import OrderDetailsInfoStatus from "@/components/OrderDetails/OrderDetailsInfoStatus";
import OrderDetailsProductCard from "@/components/OrderDetails/OrderDetailsProductCard";
import OrderDetailsInfoComponent from "@/components/OrderDetails/OrderDetailsInfo";

interface OrderDetailsInfoProps {
  order: Order;
}

function OrderDetailsInfo({ order }: OrderDetailsInfoProps) {
  return (
    <section className="mx-auto p-4 bg-white rounded-lg shadow-sm">
      <OrderDetailsCardId order={order} />
      <OrderDetailsInfoStatus order={order} />
      <OrderDetailsProductCard order={order} />
      <OrderDetailsInfoComponent order={order} />
    </section>
  );
}

export default OrderDetailsInfo;
