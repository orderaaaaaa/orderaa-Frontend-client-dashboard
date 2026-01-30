'use client';

import React from 'react';
import ProductDropdown from '@/components/productDropdown';
import { OrderDetailsProps } from './types';

function OrderDetails({ errors }: OrderDetailsProps) {
  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">تفاصيل المنتج</h1>
        <div className="mb-5" data-field-error="products">
          <div className="mb-1">
            <label className="block font-medium text-[16px]">
              اسم المنتج <span className="text-red-500">*</span>
            </label>
          </div>
          <ProductDropdown
            placeholder="ابحث عن منتج"
            className="max-w-[931px]"
            selectClassName={`border-2 w-full bg-[#EAEAEA40] p-2 rounded-sm ${
              errors?.products ? 'border-red-500' : 'border-primary'
            }`}
          />
          {errors?.products && (
            <p className="text-red-600 text-sm mt-2">{errors.products}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
