import React from "react";

import OrderDetailsCardId from "@/components/OrderDetails/OrderDetailsCardId";
import OrderDetailsInfoStatus from "@/components/OrderDetails/OrderDetailsInfoStatus";
import OrderDetailsProductCard from "@/components/OrderDetails/OrderDetailsProductCard";

function OrderDetailsInfo() {
  return (
    <section className="mx-auto p-4 bg-white rounded-lg shadow-sm">
      <OrderDetailsCardId />
      <OrderDetailsInfoStatus />
      <OrderDetailsProductCard />
    </section>
  );
}

export default OrderDetailsInfo;
