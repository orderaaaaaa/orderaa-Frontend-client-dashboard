import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { ApiProduct } from './useProductDropdown';

interface SelectedVariantValue {
  attribute: string;
  option: string;
}

interface ProductRowProps {
  product: ApiProduct;
  isSelected: boolean;
  isAlreadyInOrder: boolean;
  isExpanded: boolean;
  selectedVariants: SelectedVariantValue[];
  onProductClick: (product: ApiProduct) => void;
  onVariantSelect: (productId: number, attribute: string, option: string) => void;
  onAddProductWithoutVariants: (product: ApiProduct) => void;
  onRemoveProductFromPending: (productId: number) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  isSelected,
  isAlreadyInOrder,
  isExpanded,
  selectedVariants,
  onProductClick,
  onVariantSelect,
  onAddProductWithoutVariants,
  onRemoveProductFromPending,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasVariants = product.variantOptions && product.variantOptions.length > 0;

  const getSelectedValue = (attribute: string): string | undefined => {
    return selectedVariants.find((v) => v.attribute === attribute)?.option;
  };

  const getRowClassName = () => {
    if (isAlreadyInOrder) {
      return 'border-b mb-2 border-primary/30 rounded-sm transition-colors bg-primary/5 ring-1 ring-primary/20';
    }
    if (isSelected) {
      return 'border-b mb-2 border-gray-100 rounded-sm transition-colors bg-gray-50';
    }
    return 'border-b mb-2 border-gray-100 rounded-sm transition-colors bg-white';
  };

  return (
    <div className={getRowClassName()}>
      <div
        className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onProductClick(product)}
      >
        <div className="w-1/4 flex justify-center">
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
            {product.image ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className={`object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                لا تورد صور
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 text-center font-medium flex flex-col items-center gap-1">
          <span>{product.name}</span>
          {isAlreadyInOrder && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              في الطلب
            </span>
          )}
        </div>

        <div className="w-1/4 text-center text-gray-700">{product.price} ج.م</div>
      </div>

      {isExpanded && hasVariants && (
        <div
          className="py-4 px-6 border-t border-gray-200 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            {product.variantOptions.map((option) => (
              <div key={option.attribute}>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {option.attribute}
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.options.map((opt) => {
                    const isValueSelected = getSelectedValue(option.attribute) === opt;
                    return (
                      <Button
                        key={`${option.attribute}-${opt}`}
                        type="button"
                        variant={isValueSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onVariantSelect(product.id, option.attribute, opt)}
                      >
                        {opt}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && !hasVariants && (
        <div
          className="p-3 border-t border-gray-200 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isSelected ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveProductFromPending(product.id)}
              className="text-red-500 border-red-300 hover:bg-red-50"
            >
              إزالة المنتج
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onAddProductWithoutVariants(product)}
            >
              إضافة المنتج
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
