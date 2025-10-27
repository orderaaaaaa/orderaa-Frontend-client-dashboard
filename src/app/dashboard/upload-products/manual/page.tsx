'use client';
import ClientInformation from './ClientInformation';
import Order from './Order';
import OrderDetails from './OrderDetails';
import ShippingAndPayment from './ShippingAndPayment';

function Manual() {
  return (
    <>
      <div className="flex flex-col gap-[26px]">
        <Order />
        <OrderDetails />
        <ClientInformation />
        <ShippingAndPayment />
      </div>
    </>
  );
}

export default Manual;
