import React from 'react';
import { Plus } from 'lucide-react';
import { DropdownContentProps } from '@/types/orders';
import { ProductRow } from './ProductRow';

export const DropdownContent: React.FC<DropdownContentProps> = ({
  filteredProducts,
  selectedVariants,
  expandedProductId,
  onProductClick,
  onVariantSelect,
  onAddProduct,
}) => {
  const pendingSelectionsCount = Object.keys(selectedVariants).length;

  return (
    <div className="absolute z-10 left-0 right-0 bg-white border border-[#CED4DA] rounded-lg mt-1 max-sm:max-h-100 max-h-200 overflow-y-auto shadow-lg px-4">
      <h1 className="p-2 bg-[#A084F3] text-[16px] rounded-sm my-5 max-w-[312px] text-white">
        الاسم
      </h1>
      <div className="sticky top-0 z-10 bg-[#EAEAEA40] p-4 mb-2 rounded-sm flex justify-between text-sm font-semibold">
        <div className="w-1/4 text-center">الصور</div>
        <div className="w-1/2 text-center">الاسم</div>
        <div className="w-1/4 text-center">السعر</div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="px-3 py-2 text-[#878A99] text-center">
          لا توجد نتائج
        </div>
      ) : (
        <div className="pb-4">
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              isSelected={selectedVariants[product.id] !== undefined}
              isExpanded={expandedProductId === product.id}
              selectedVariant={selectedVariants[product.id]}
              onProductClick={onProductClick}
              onVariantSelect={onVariantSelect}
            />
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex justify-between items-center">
        {pendingSelectionsCount > 0 && (
          <div className="text-sm font-medium text-gray-700">
            {pendingSelectionsCount} منتج مختار
          </div>
        )}
        <button
          onClick={onAddProduct}
          disabled={pendingSelectionsCount === 0}
          className="w-40 flex items-center justify-center p-3 rounded-full cursor-pointer bg-[#5D24E1] text-white hover:bg-[#4a1fa8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus size={18} className="ml-1" />
          <span>إضافة طلب</span>
        </button>
      </div>
    </div>
  );
};
