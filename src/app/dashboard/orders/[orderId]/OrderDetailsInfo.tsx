import React from 'react';

import OrderDetailsCardId from '@/app/dashboard/orders/[orderId]/OrderDetailsCardId';
import OrderDetailsInfoStatus from '@/app/dashboard/orders/[orderId]/OrderDetailsInfoStatus';
import OrderDetailsProductCard from '@/app/dashboard/orders/[orderId]/OrderDetailsProductCard';
import OrderDetailsInfoComponent from '@/app/dashboard/orders/[orderId]/OrderDetailsInfoComponent';

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
