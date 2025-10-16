import React from "react";

import OrderDetailsCardId from "@/components/OrderDetails/OrderDetailsCardId";
import OrderDetailsInfoStatus from "@/components/OrderDetails/OrderDetailsInfoStatus";
import OrderDetailsProductCard from "@/components/OrderDetails/OrderDetailsProductCard";
import OrderDetailsInfoComponent from "@/components/OrderDetails/OrderDetailsInfo";

function OrderDetailsInfo() {
  return (
    <section className="mx-auto p-4 bg-white rounded-lg shadow-sm">
      <OrderDetailsCardId />
      <OrderDetailsInfoStatus />
      <OrderDetailsProductCard />
      <OrderDetailsInfoComponent />
    </section>
  );
}

export default OrderDetailsInfo;
