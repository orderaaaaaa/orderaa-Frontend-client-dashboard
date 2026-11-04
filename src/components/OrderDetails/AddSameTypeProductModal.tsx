'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { useProductVariantsOptions } from '@/services/orders';
import { useProductVariantAvailabilityQuery } from '@/services/warehouses';
import { NEXT_STOCK_TARGET } from '@/lib/api/warehouses';
import { exactVariantFor } from '@/components/stock/variantAvailabilityModel';
import { VariantAvailabilitySelector } from '@/components/stock/VariantAvailabilitySelector';
import {
  catalogAttributesOf,
  probeQuantityOf,
  type Selection,
} from '@/components/stock/variantAvailabilityModel';
import { Button } from '../ui/button';
import BaseModal from '@/components/ui/base-modal';
import { MissingAttributesHint } from '@/components/ui/missing-attributes-hint';
import { missingAttributesOf } from '@/utils/variantSelection';

interface AddSameTypeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attributeOptionIds: number[], quantity: number) => Promise<boolean>;
  productType: string;
  productId: number | null;
  orderId: number;
}

export default function AddSameTypeProductModal({
  isOpen,
  onClose,
  onSave,
  productType,
  productId,
  orderId,
}: AddSameTypeProductModalProps) {
  const [selection, setSelection] = useState<Selection>({});
  const [quantity, setQuantity] = useState(1);

  const {
    data: variantOptions = [],
    isLoading,
    isError: isErrorCatalog,
    error: catalogError,
    refetch: refetchCatalog,
  } = useProductVariantsOptions(isOpen ? productId : null);

  const {
    data: variantAvailability = [],
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
    error: errorAvailability,
    refetch: refetchAvailability,
  } = useProductVariantAvailabilityQuery(
    isOpen ? (productId ?? undefined) : undefined,
    orderId,
    NEXT_STOCK_TARGET,
    { quantity: probeQuantityOf(quantity) }
  );

  useEffect(() => {
    if (isOpen) {
      setSelection({});
      setQuantity(1);
    }
  }, [isOpen]);

  const selectedVariantAvailability = useMemo(
    () => exactVariantFor(variantAvailability, selection, variantOptions.length),
    [variantAvailability, selection, variantOptions.length]
  );

  const isFormValid = useMemo(() => {
    const hasVariants = variantOptions.length === 0 || Object.keys(selection).length === variantOptions.length;
    return (
      !isLoading &&
      !isErrorCatalog &&
      hasVariants &&
      quantity > 0 &&
      selectedVariantAvailability?.blocked !== true
    );
  }, [isLoading, isErrorCatalog, selection, quantity, variantOptions.length, selectedVariantAvailability]);

  const missingAttributes = useMemo(
    () =>
      missingAttributesOf(
        variantOptions.map((option) => option.attribute),
        variantOptions
          .filter((option) => selection[option.attributeId] !== undefined)
          .map((option) => option.attribute)
      ),
    [variantOptions, selection]
  );

  const handleSave = async () => {
    if (!isFormValid) return;

    const attributeOptionIds = Object.values(selection);

    const applied = await onSave(attributeOptionIds, quantity);
    if (applied) onClose();
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة منتج من نفس النوع"
      onConfirm={handleSave}
      confirmText="إضافة"
      confirmIcon={<LiaPlusSolid className="w-5 h-5 text-white" />}
      confirmDisabled={!isFormValid}
      height="min-h-[400px]"
    >
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label className="block text-lg font-bold text-foreground mb-3 text-right">
            النوع
          </label>
          <div className="w-full h-[44px] md:h-[57px] bg-muted border border-border rounded-[38px] px-4 md:px-6 flex items-center justify-end">
            <span className="text-base md:text-lg text-foreground font-bold">
              {productType}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-lg font-bold text-foreground mb-3 text-right">
              الكمية
            </label>
            <div className="h-[44px] md:h-[57px] bg-card border border-border rounded-[38px] px-3 md:px-4 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted hover:bg-border p-0"
              >
                <LiaMinusSolid className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </Button>
              <span className="text-lg md:text-xl font-bold text-foreground min-w-[40px] text-center">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={incrementQuantity}
                disabled={quantity >= 99}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary hover:bg-brand-hover p-0"
              >
                <LiaPlusSolid className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 min-w-[200px] flex items-center justify-center">
              <span className="text-gray-500">جاري تحميل الخيارات...</span>
            </div>
          ) : variantOptions.length === 0 && !isErrorCatalog ? (
            <div className="flex-1 min-w-[200px] flex items-center justify-center">
              <span className="text-gray-500">لا توجد خيارات متاحة لهذا المنتج</span>
            </div>
          ) : null}
        </div>
        {!isLoading && (variantOptions.length > 0 || isErrorCatalog) && (
          <VariantAvailabilitySelector
            productName={productType}
            attributes={catalogAttributesOf(variantOptions)}
            variants={variantAvailability}
            selection={selection}
            onChange={setSelection}
            isError={isErrorCatalog}
            catalogError={isErrorCatalog ? catalogError : null}
            onCatalogRetry={() => void refetchCatalog()}
            availabilityLoading={isLoadingAvailability}
            availabilityError={isErrorAvailability ? errorAvailability : null}
            onRetry={() => void refetchAvailability()}
          />
        )}
        {!isLoading && <MissingAttributesHint missing={missingAttributes} />}
      </div>
    </BaseModal>
  );
}
