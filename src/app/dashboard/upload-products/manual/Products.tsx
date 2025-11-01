'use client';

import React from 'react';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import { Pen, Plus, Trash2 } from 'lucide-react';

function Products() {
  // Access the store to get selected products
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );

  // Remove product from cart
  const removeProduct = (productId: number) => {
    const updatedProducts = selectedProducts.filter((p) => p.id !== productId);
    useProductDropdownStore.getState().setSelectedProducts(updatedProducts);
  };

  // Calculate total price
  const totalPrice = selectedProducts.reduce((sum, product) => {
    return sum + parseInt(product.price);
  }, 0);

  // Handle add order
  const handleAddOrder = () => {
    // Here you would typically send the order to your API
    alert(`تم إنشاء الطلب بنجاح! المجموع: ${totalPrice} ج.م`);
  };

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <header>
          <h1 className="font-bold text-[28px]">المنتجات</h1>

          <div>
            <div className="mt-4 bg-[#EAEAEA40] p-4 mb-2 rounded-sm grid sm:grid-cols-[1fr_2fr_1fr] grid-cols-[5fr_3fr_1fr] text-sm font-semibold text-center">
              <div className="text-start sm:mr-20">المنتج</div>
              <div>الكميه</div>
              <div className="text-end sm:ml-20">الاجمالي</div>
            </div>
          </div>
        </header>

        {/* Display selected products */}
        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            {/*  */}
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white relative max-sm:p-0 p-4 rounded-sm border-b border-gray-200 grid grid-cols-[7fr_10px_3fr]  sm:grid-cols-[1fr_2fr_1fr] items-center"
              >
                {/* Product Column */}
                <div className="flex items-center gap-3 max-sm:gap-2">
                  <div className="relative w-20 h-20 max-sm:w-15 max-sm:h-15 overflow-hidden rounded border border-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col"></div>
                  <div className="flex flex-col text-sm gap-2">
                    <h3 className="text-[18px] max-sm:text-[15px] sm:font-semibold">
                      {product.name}
                    </h3>
                    <span>
                      <span className="text-gray-500  sm:ml-5 max-sm:text-[13px] text-[15px]">
                        {' '}
                        الالوان:
                      </span>{' '}
                      {product.variant.name}
                    </span>
                    <span className="">
                      <span className="text-gray-500 sm:ml-5 max-sm:text-[13px] text-[15px]">
                        المقاسات:{' '}
                      </span>{' '}
                      {product.variant.size}
                    </span>
                    <div className="flex gap-12"></div>
                  </div>
                </div>

                {/* Quantity Column */}
                <div className="text-center">
                  <span className="text-gray-700 text-sm ">1</span>
                </div>

                {/* Total Column */}
                <div className="flex items-center justify-end gap-1 max-sm:ml-0 ml-13 mt-1">
                  <h2 className="text-gray-700 max-sm:text-[12px]">
                    {product.price} ج.م
                  </h2>
                  <button className="hover:text-gray-600 cursor-pointer">
                    <Pen className="w-4 max-sm:w-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-red-500 absolute left-3 bottom-1 sm:bottom-[40%]  cursor-pointer hover:text-red-700"
                >
                  <Trash2 className="w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Order Button */}
        {selectedProducts.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="text-lg font-semibold text-gray-700">
              المجموع الكلي: {totalPrice} ج.م
            </div>
            <button
              onClick={handleAddOrder}
              className="w-30 flex items-center gap-1 cursor-pointer justify-center px-3 mb-4 py-2 rounded-full bg-[#5D24E1] text-white hover:bg-[#4a1fa8] transition-colors"
            >
              <Plus className="w-4 h-4 mt-1 " />
              <span>إضافه منتج</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
