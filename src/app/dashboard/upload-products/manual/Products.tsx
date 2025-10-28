'use client';

import React from 'react';
import { useProductDropdownStore } from '@/store/productDropdownStore';

function Products() {
  // Access the store to get selected products
  const selectedProducts = useProductDropdownStore(
    (state) => state.selectedProducts
  );

  // Helper function to get size range based on product type
  const getSizeRange = (productId: number) => {
    const sizeRanges: Record<number, string> = {
      1: '42-44', // اورجينال - jacket sizes
      2: 'M-L', // جاكيت رياضي - jacket sizes
      3: '42-45', // حذاء رياضي - shoe sizes
      4: 'واحد', // سماعات - one size
      5: 'واحد', // هاتف ذكي - one size
    };
    return sizeRanges[productId] || 'واحد';
  };

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
    console.log('Order created with products:', selectedProducts);
    console.log('Total price:', totalPrice);
    // Here you would typically send the order to your API
    alert(`تم إنشاء الطلب بنجاح! المجموع: ${totalPrice} ج.م`);
  };

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <header>
          <h1 className="font-bold text-[28px] mb-10">المنتجات</h1>
          <div className="flex justify-center">
            <h2 className="text-[22px] p-3 w-[350px] text-center rounded-sm bg-[#A084F3] text-white">
              {' '}
              اختر المنتجات
            </h2>
          </div>
          <div>
            <div className="mt-6 bg-[#EAEAEA40] p-4 mb-2 rounded-sm grid grid-cols-[1fr_2fr_1fr] text-sm font-semibold text-center">
              <div className="text-start mr-20">المنتج</div>
              <div>الكميه</div>
              <div className="text-end ml-20">الاجمالي</div>
            </div>
          </div>
        </header>

        {/* Display selected products */}
        {selectedProducts.length > 0 && (
          <div className="space-y-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-sm border border-gray-200 grid grid-cols-[1fr_2fr_1fr] items-center"
              >
                {/* Product Column */}
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 overflow-hidden rounded border border-gray-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col"></div>
                  <div className="flex flex-col text-sm">
                    <h3 className="font-medium">{product.name}</h3>
                    <span className="text-gray-600">
                      الالوان: {product.variant.name}
                    </span>
                    <span className="text-gray-600">
                      المقاسات: {getSizeRange(product.id)}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <span className="text-gray-700">{product.price}</span>
                </div>

                {/* Quantity Column */}
                <div className="text-center">
                  <span className="text-gray-700">1</span>
                </div>

                {/* Total Column */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="text-gray-700">{product.price} ج.م</span>
                </div>
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
              className="w-40 flex items-center justify-center p-3 rounded-full bg-[#5D24E1] text-white hover:bg-[#4a1fa8] transition-colors"
            >
              <svg
                className="w-5 h-5 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>إضافة طلب</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
