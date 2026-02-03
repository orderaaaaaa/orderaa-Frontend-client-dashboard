import React from 'react';
import { ProductRow } from './ProductRow';
import Input from '../ui/Input';
import type { ApiProduct } from './useProductDropdown';
import { Button } from '../ui/button';

interface SelectedVariantValue {
  label: string;
  value: string;
}

interface SelectedProduct {
  id: number;
  selectedVariants: SelectedVariantValue[];
}

interface DropdownContentProps {
  products: ApiProduct[];
  selectedVariants: Record<number, SelectedVariantValue[]>;
  selectedProducts: SelectedProduct[];
  expandedProductId: number | null;
  onProductClick: (product: ApiProduct) => void;
  onVariantSelect: (productId: number, label: string, value: string) => void;
  onAddProductWithoutVariants: (product: ApiProduct) => void;
  onRemoveProductFromPending: (productId: number) => void;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export const DropdownContent: React.FC<DropdownContentProps> = ({
  products,
  selectedVariants,
  selectedProducts,
  expandedProductId,
  onProductClick,
  onVariantSelect,
  onAddProductWithoutVariants,
  onRemoveProductFromPending,
  search,
  onSearchChange,
  isLoading,
  hasNextPage,
  onLoadMore,
}) => {
  const isProductInOrder = (productId: number) => {
    return selectedProducts.some((p) => p.id === productId);
  };
  return (
    <div className="flex flex-col">
      <div className="rounded-sm">
        <Input
          type="text"
          name="search"
          value={search}
          onChange={onSearchChange}
          placeholder="ابحث عن منتج..."
          className=""
        />
      </div>

      <div className="top-0 z-10 bg-[#EAEAEA66] p-4 mx-4 mt-2 rounded-sm flex justify-between text-sm font-semibold">
        <div className="w-1/4 text-center">الصور</div>
        <div className="w-1/2 text-center">الاسم</div>
        <div className="w-1/4 text-center">السعر</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {isLoading && products.length === 0 ? (
          <div className="pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="border-b mb-2 border-gray-100 rounded-sm bg-white"
              >
                <div className="flex items-center p-3">
                  <div className="w-1/4 flex justify-center">
                    <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse" />
                  </div>
                  <div className="w-1/2 flex justify-center">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="w-1/4 flex justify-center">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="px-3 py-8 text-[#878A99] text-center">
            لا توجد نتائج
          </div>
        ) : (
          <div className="pb-4">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                isSelected={selectedVariants[product.id] !== undefined}
                isAlreadyInOrder={isProductInOrder(product.id)}
                isExpanded={expandedProductId === product.id}
                selectedVariants={selectedVariants[product.id] || []}
                onProductClick={onProductClick}
                onVariantSelect={onVariantSelect}
                onAddProductWithoutVariants={onAddProductWithoutVariants}
                onRemoveProductFromPending={onRemoveProductFromPending}
              />
            ))}
            {hasNextPage && (
              <div className="py-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري التحميل...' : 'تحميل المزيد'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
