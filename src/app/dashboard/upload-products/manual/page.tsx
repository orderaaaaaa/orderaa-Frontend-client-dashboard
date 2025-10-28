'use client';
import { Plus } from 'lucide-react';
import ClientInformation from './ClientInformation';
import Order from './Order';
import OrderDetails from './OrderDetails';
import ShippingAndPayment from './ShippingAndPayment';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import Products from './Products';

function Manual() {
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );
  return (
    <>
      <div className="flex flex-col gap-[26px]">
        <Order />
        <OrderDetails />
        {selectedProducts.length > 0 && <Products />}

        <ClientInformation />
        <ShippingAndPayment />
        <div className="flex justify-end ml-6">
          <button className="flex py-2 gap-2 text-md cursor-pointer bg-[#5D24E1] items-center text-white w-40 px-5 rounded-full font-bold">
            {' '}
            <Plus className="font-bold w-6 h-6" />
            إضافة طلب
          </button>
        </div>
      </div>
    </>
  );
}

export default Manual;
