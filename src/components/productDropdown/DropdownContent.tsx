import React from 'react';
import { Plus, X } from 'lucide-react';
import { DropdownContentProps } from '@/types/orders';
import { ProductRow } from './ProductRow';
import Input from '../ui/Input';

export const DropdownContent: React.FC<DropdownContentProps> = ({
  filteredProducts,
  selectedVariants,
  expandedProductId,
  onProductClick,
  onVariantSelect,
  onAddProduct,
  search,
  onSearchChange,
  onClose, // Add close handler
}) => {
  const pendingSelectionsCount = Object.keys(selectedVariants).length;

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-h-[80vh] flex flex-col">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">اختر المنتجات</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="إغلاق"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Search Input */}
      <div className=" mx-4 mt-4 rounded-sm">
        <Input
          type="text"
          name=""
          value={search}
          onChange={onSearchChange}
          placeholder="ابحث عن منتج..."
          className=""
        />
      </div>

      {/* Products Header */}
      <div className="sticky top-0 z-10 bg-[#EAEAEA66] p-4 mx-4 mt-2 rounded-sm flex justify-between text-sm font-semibold">
        <div className="w-1/4 text-center">الصور</div>
        <div className="w-1/2 text-center">الاسم</div>
        <div className="w-1/4 text-center">السعر</div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto px-4">
        {filteredProducts.length === 0 ? (
          <div className="px-3 py-8 text-[#878A99] text-center">
            لا توجد نتائج
          </div>
        ) : (
          <div className="pb-4">
            {filteredProducts.map((product: any) => (
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
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
        <div className="flex-1">
          {pendingSelectionsCount > 0 && (
            <div className="text-sm font-medium text-gray-700">
              {pendingSelectionsCount} منتج مختار
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onAddProduct}
            disabled={pendingSelectionsCount === 0}
            className="px-6 py-3 rounded-full cursor-pointer bg-[#5D24E1] text-white hover:bg-[#4a1fa8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            <span>إضافة طلب ({pendingSelectionsCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
