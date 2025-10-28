'use client';

import React, { useState } from 'react';
import ProductDropdown from '@/components/productDropdown';
import { Product } from '@/types/orders';

function OrderDetails() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <h1 className="font-bold text-[28px] mb-6">تفاصيل المنتج</h1>
        <div className="mb-5">
          <ProductDropdown
            label="اسم المنتج"
            value={selectedProducts}
            onChange={setSelectedProducts}
            placeholder={'ابحث عن منتج'}
            className="max-w-[931px] "
            selectClassName="border-2 w-full bg-[#EAEAEA40] p-2 rounded-sm mt-3"
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-lg mb-3">المنتجات المختارة:</h2>
            <ul className="space-y-2">
              {selectedProducts.map((product) => (
                <li key={product.id} className="p-2 bg-gray-50 rounded-md">
                  {product.name} - {product.price}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
