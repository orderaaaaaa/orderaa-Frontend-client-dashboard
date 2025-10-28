'use client';

import React from 'react';
import { useProductDropdownStore } from '@/store/productDropdownStore';

function Products() {
  // Access the store to get selected products
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );
  const setSelectedProducts = useProductDropdownStore(
    (state) => state.setSelectedProducts
  );

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <h1 className="font-bold text-[28px] mb-6">تفاصيل المنتج</h1>
        <h2 className="text-[22px]"> اختر المنتجات</h2>

        {/* Display selected products */}
        {selectedProducts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">المنتجات المختارة:</h3>
            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 border border-gray-200 rounded"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.price} ريال</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
