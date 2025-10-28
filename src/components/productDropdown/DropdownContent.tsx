import React from 'react';
import { Plus } from 'lucide-react';
import { Product, Variant } from '@/types/orders';
import { ProductRow } from './ProductRow';

interface DropdownContentProps {
  filteredProducts: Product[];
  selectedVariants: Record<number, Variant | undefined>;
  expandedProductId: number | null;
  onProductClick: (product: Product) => void;
  onVariantSelect: (
    productId: number,
    variant: Variant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onAddProduct: () => void;
}

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
    <div className="absolute z-10 left-0 right-0 bg-white border border-[#CED4DA] rounded-lg mt-1 max-h-200 overflow-y-auto shadow-lg px-4">
      <h1 className="p-2 bg-[#A084F3] text-[16px] rounded-sm my-5 max-w-[312px] text-white">
        الاسم
      </h1>
      <div className="sticky top-0 z-10 bg-[#EAEAEA40] p-4 mb-2 rounded-sm flex justify-between text-sm font-semibold">
        <div className="w-1/4 text-center">الصور</div>
        <div className="w-1/2 text-center">الاسم</div>
        <div className="w-1/4 text-center">السعر</div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="px-3 py-2 text-[#878A99] text-center">
          لا توجد نتائج
        </div>
      ) : (
        <div>
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
          <div className="flex justify-between items-center p-3 border-t border-gray-200">
            {pendingSelectionsCount > 0 && (
              <div className="text-sm text-gray-600">
                {pendingSelectionsCount} منتج مختار
              </div>
            )}
            <button
              onClick={onAddProduct}
              className="w-40 flex items-center justify-center p-3 rounded-full bg-[#5D24E1] text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={pendingSelectionsCount === 0}
            >
              <Plus size={18} className="ml-1" />
              <span>إضافة طلب ({pendingSelectionsCount})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
