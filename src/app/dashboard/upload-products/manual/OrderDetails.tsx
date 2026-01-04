'use client';

import React from 'react';
import ProductDropdown from '@/components/productDropdown';
import { useProductDropdownStore } from '@/store/productDropdownStore';

function OrderDetails() {
  // Use the store to get selected products
  // const selectedProducts = useProductDropdownStore(
  //   (state) => state.selectedProducts
  // );

  return (
    <div
      className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">تفاصيل المنتج</h1>
        <div className="mb-5">
          <ProductDropdown
            label="اسم المنتج"
            placeholder="ابحث عن منتج"
            className="max-w-[931px]"
            selectClassName="border-2 border-primary w-full bg-[#EAEAEA40] p-2 rounded-sm "
          />
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
