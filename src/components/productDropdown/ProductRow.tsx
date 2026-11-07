import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { ApiProduct } from './useProductDropdown';
import { MissingAttributesHint } from '@/components/ui/missing-attributes-hint';
import { missingAttributeNamesOf } from '@/store/productDropdownStore';
import { useProductVariantsOptions } from '@/services/orders';
import { OrderlessVariantAvailabilityPanel } from '@/components/stock/OrderlessVariantAvailabilityPanel';
import type { Selection, DraftSummary } from '@/components/stock/variantAvailabilityModel';

interface SelectedVariantValue {
  attributeId: number;
  attribute: string;
  optionId: number;
  option: string;
}

interface ProductRowProps {
  product: ApiProduct;
  isSelected: boolean;
  isAlreadyInOrder: boolean;
  isExpanded: boolean;
  selectedVariants: SelectedVariantValue[];
  onProductClick: (product: ApiProduct) => void;
  onVariantSelect: (productId: number, attributeId: number, optionId: number) => void;
  onAddProductWithoutVariants: (product: ApiProduct) => void;
  onRemoveProductFromPending: (productId: number) => void;
  availabilityTarget?: 'NEW_ORDER' | 'CONFIRMED';
  draft: DraftSummary;
}

interface RowAvailabilityPanelProps {
  product: ApiProduct;
  targetStatus: 'NEW_ORDER' | 'CONFIRMED';
  draft: DraftSummary;
  selectedVariants: SelectedVariantValue[];
  onVariantSelect: (productId: number, attributeId: number, optionId: number) => void;
}

const selectionOf = (variants: SelectedVariantValue[]): Selection =>
  variants.reduce<Selection>(
    (selection, variant) => ({ ...selection, [variant.attributeId]: variant.optionId }),
    {},
  );

const RowAvailabilityPanel = ({
  product,
  targetStatus,
  draft,
  selectedVariants,
  onVariantSelect,
}: RowAvailabilityPanelProps) => {
  const catalog = useProductVariantsOptions(product.id);
  const groups = catalog.data ?? [];
  const selection = selectionOf(selectedVariants);

  const handleChange = (next: Selection) => {
    for (const group of groups) {
      const previousId = selection[group.attributeId];
      const nextId = next[group.attributeId];
      if (previousId === nextId) continue;
      const optionId = nextId === undefined ? previousId : nextId;
      if (optionId !== undefined) onVariantSelect(product.id, group.attributeId, optionId);
    }
  };

  return (
    <OrderlessVariantAvailabilityPanel
      productId={product.id}
      productName={product.name}
      targetStatus={targetStatus}
      quantity={1}
      draft={draft.draft}
      excludedLines={draft.excluded}
      selection={selection}
      onChange={handleChange}
    />
  );
};

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
  availabilityTarget,
  draft,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasVariants = product.variantOptions && product.variantOptions.length > 0;

  const missingAttributes =
    isSelected && hasVariants ? missingAttributeNamesOf(product, selectedVariants) : [];

  const priceLabel = product.price != null ? `${product.price} ج.م` : null;

  const getSelectedValue = (attributeId: number): number | undefined => {
    return selectedVariants.find((v) => v.attributeId === attributeId)?.optionId;
  };

  const getRowClassName = () => {
    if (isAlreadyInOrder) {
      return 'border-b mb-2 border-primary/30 rounded-sm transition-colors bg-primary/5 ring-1 ring-primary/20';
    }
    if (isSelected) {
      return 'border-b mb-2 border-gray-100 rounded-sm transition-colors bg-gray-50';
    }
    return 'border-b mb-2 border-gray-100 rounded-sm transition-colors bg-card';
  };

  return (
    <div className={getRowClassName()}>
      <button
        type="button"
        className="flex w-full min-h-14 items-center p-3 text-right cursor-pointer hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={() => onProductClick(product)}
        aria-expanded={isExpanded}
        aria-label={`${product.name}${priceLabel ? `، ${priceLabel}` : ''}${isAlreadyInOrder ? '، في الطلب' : ''}`}
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
                لا توجد صورة
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 min-w-0 text-center font-medium flex flex-col items-center gap-1">
          <span className="break-words">{product.name}</span>
          {isAlreadyInOrder && (
            <span className="text-xs text-primary-text bg-primary/10 px-2 py-0.5 rounded-full">
              في الطلب
            </span>
          )}
        </div>

        <div className="w-1/4 text-center text-gray-700">{priceLabel}</div>
      </button>

      {isExpanded && hasVariants && (
        <div
          className="py-4 px-6 border-t border-gray-200 bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          {availabilityTarget ? (
            <RowAvailabilityPanel
              product={product}
              targetStatus={availabilityTarget}
              draft={draft}
              selectedVariants={selectedVariants}
              onVariantSelect={onVariantSelect}
            />
          ) : (
            <div className="space-y-4">
              {(product.attributes ?? []).map((attribute) => (
                <div key={attribute.id}>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {attribute.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attribute.options.map((opt) => {
                      const isValueSelected = getSelectedValue(attribute.id) === opt.id;
                      return (
                        <Button
                          key={opt.id}
                          type="button"
                          variant={isValueSelected ? 'default' : 'outline'}
                          size="sm"
                          className="min-h-10"
                          aria-pressed={isValueSelected}
                          onClick={() => onVariantSelect(product.id, attribute.id, opt.id)}
                        >
                          {opt.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <MissingAttributesHint
        missing={missingAttributes}
        className="px-6 pb-3"
      />

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
              className="min-h-10 text-red-500 border-red-300 hover:bg-red-50"
            >
              إزالة المنتج
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="min-h-10"
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
