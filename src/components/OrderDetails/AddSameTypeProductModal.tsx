'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  useProductVariantsOptions,
  resolveAttributeOptionIds,
} from '@/services/orders';
import { Button } from '../ui/button';
import BaseModal from '@/components/ui/base-modal';

interface AddSameTypeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attributeOptionIds: number[], quantity: number) => void;
  productType: string;
  productId: number | null;
}

export default function AddSameTypeProductModal({
  isOpen,
  onClose,
  onSave,
  productType,
  productId,
}: AddSameTypeProductModalProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const { data: variantOptions = [], isLoading } = useProductVariantsOptions(
    isOpen ? productId : null
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedVariants({});
      setQuantity(1);
    }
  }, [isOpen]);

  const isFormValid = useMemo(() => {
    const hasVariants = variantOptions.length === 0 || Object.keys(selectedVariants).length === variantOptions.length;
    return hasVariants && quantity > 0;
  }, [selectedVariants, quantity, variantOptions.length]);

  const handleVariantChange = (attribute: string, optionValue: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [attribute]: optionValue,
    }));
  };

  const handleSave = () => {
    if (!isFormValid) return;

    const attributeOptionIds = resolveAttributeOptionIds(
      variantOptions,
      selectedVariants
    );

    onSave(attributeOptionIds, quantity);
    onClose();
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
          <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
            النوع
          </label>
          <div className="w-full h-[44px] md:h-[57px] bg-[#F5F5F5] border border-[#ECECEC] rounded-[38px] px-4 md:px-6 flex items-center justify-end">
            <span className="text-base md:text-lg text-[#1F1F1F] font-bold">
              {productType}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
              الكمية
            </label>
            <div className="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-3 md:px-4 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#F5F5F5] hover:bg-[#ECECEC] p-0"
              >
                <LiaMinusSolid className="w-4 h-4 md:w-5 md:h-5 text-[#5F5E5E]" />
              </Button>
              <span className="text-lg md:text-xl font-bold text-[#1F1F1F] min-w-[40px] text-center">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={incrementQuantity}
                disabled={quantity >= 99}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary hover:bg-[#4B1BC4] p-0"
              >
                <LiaPlusSolid className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 min-w-[200px] flex items-center justify-center">
              <span className="text-gray-500">جاري تحميل الخيارات...</span>
            </div>
          ) : variantOptions.length === 0 ? (
            <div className="flex-1 min-w-[200px] flex items-center justify-center">
              <span className="text-gray-500">لا توجد خيارات متاحة لهذا المنتج</span>
            </div>
          ) : (
            variantOptions.map((option) => (
              <div key={option.attribute} className="flex-1 min-w-[200px]">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  {option.attribute}
                </label>
                <SearchableSelect
                  value={selectedVariants[option.attribute] || ''}
                  onValueChange={(value) => handleVariantChange(option.attribute, value)}
                  options={option.options.map((o) => o.name)}
                  placeholder={`اختر ${option.attribute}`}
                  searchPlaceholder={`بحث عن ${option.attribute}...`}
                  emptyMessage="لا توجد خيارات متاحة"
                  noResultsMessage="لا توجد نتائج للبحث"
                  triggerClassName="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-[#5F5E5E]"
                  className="rounded-2xl border-[#ECECEC]"
                  disabled={option.options.length === 0}
                  searchThreshold={5}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </BaseModal>
  );
}
