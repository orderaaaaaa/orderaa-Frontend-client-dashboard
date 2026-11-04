import React from 'react';
import { ProductRow } from './ProductRow';
import Input from '../ui/Input';
import type { ApiProduct } from './useProductDropdown';
import { Button } from '../ui/button';
import { ErrorState } from '../ui/state-panels';
import { draftFromLines } from '@/components/stock/variantAvailabilityModel';

interface SelectedVariantValue {
  attribute: string;
  option: string;
}

interface SelectedProduct {
  id: number;
  selectedVariants: SelectedVariantValue[];
  attributeOptionIds: number[];
  quantity: number;
}

interface DropdownContentProps {
  products: ApiProduct[];
  selectedVariants: Record<number, SelectedVariantValue[]>;
  selectedProducts: SelectedProduct[];
  expandedProductId: number | null;
  onProductClick: (product: ApiProduct) => void;
  onVariantSelect: (productId: number, attribute: string, option: string) => void;
  onAddProductWithoutVariants: (product: ApiProduct) => void;
  onRemoveProductFromPending: (productId: number) => void;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  loadError: unknown;
  onRetry: () => void;
  hasNextPage: boolean;
  onLoadMore: () => void;
  availabilityTarget?: 'NEW_ORDER' | 'CONFIRMED';
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
  loadError,
  onRetry,
  hasNextPage,
  onLoadMore,
  availabilityTarget,
}) => {
  const draftFor = (product: ApiProduct) =>
    draftFromLines(
      selectedProducts
        .filter((line) => line.id === product.id)
        .map((line) => ({ optionIds: line.attributeOptionIds, quantity: line.quantity })),
      product.variantOptions.length,
    ).draft;
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
          aria-label="ابحث عن منتج"
          className=""
        />
      </div>

      <div aria-hidden className="bg-muted/60 p-3 sm:p-4 mx-0 sm:mx-4 mt-2 rounded-sm flex justify-between text-sm font-semibold">
        <div className="w-1/4 text-center">الصور</div>
        <div className="w-1/2 text-center">الاسم</div>
        <div className="w-1/4 text-center">السعر</div>
      </div>

      <div className="flex-1 overflow-y-auto px-0 sm:px-4">
        {loadError && products.length === 0 ? (
          <ErrorState
            error={loadError}
            fallback="تعذر تحميل المنتجات"
            onRetry={onRetry}
          />
        ) : isLoading && products.length === 0 ? (
          <div className="pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="border-b mb-2 border-gray-100 rounded-sm bg-card"
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
          <div className="px-3 py-8 text-muted-foreground text-center">
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
                availabilityTarget={availabilityTarget}
                draft={draftFor(product)}
              />
            ))}
            {loadError ? (
              <div role="alert" className="py-4 flex flex-col items-center gap-2 text-sm text-red-600">
                تعذر تحميل المزيد من المنتجات
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  onClick={onRetry}
                  disabled={isLoading}
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : hasNextPage && (
              <div className="py-4 text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10"
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
