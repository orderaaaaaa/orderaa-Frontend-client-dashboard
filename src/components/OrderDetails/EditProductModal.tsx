'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaCheckSolid } from 'react-icons/lia';
import {
  useProductVariantsOptions,
  resolveAttributeOptionIds,
} from '@/services/orders';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import BaseModal from '@/components/ui/base-modal';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attributeOptionIds: number[]) => void;
  productId: number;
  currentVariants: Record<string, string>;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSave,
  productId,
  currentVariants,
}: EditProductModalProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(currentVariants);

  const { data: variantOptions = [], isLoading } = useProductVariantsOptions(
    isOpen ? productId : null
  );

  useEffect(() => {
    setSelectedValues(currentVariants);
  }, [currentVariants]);

  const hasChanges = useMemo(() => {
    return Object.keys(selectedValues).some(
      (key) => selectedValues[key] !== currentVariants[key]
    );
  }, [selectedValues, currentVariants]);

  const handleValueChange = (attribute: string, optionValue: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [attribute]: optionValue,
    }));
  };

  const handleSave = () => {
    if (!hasChanges) return;

    const attributeOptionIds = resolveAttributeOptionIds(
      variantOptions,
      selectedValues
    );

    onSave(attributeOptionIds);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تعديل المنتج"
      onConfirm={handleSave}
      confirmText="حفظ"
      confirmIcon={<LiaCheckSolid className="w-5 h-5 text-white" />}
      confirmDisabled={!hasChanges}
    >
      <div className="flex flex-col md:flex-row gap-4 justify-start flex-wrap">
        {isLoading ? (
          <div className="w-full text-center text-gray-500">جاري التحميل...</div>
        ) : variantOptions.length === 0 ? (
          <div className="w-full text-center text-gray-500">لا توجد خيارات متاحة</div>
        ) : (
          variantOptions.map((option) => (
            <div key={option.attribute} className="w-full md:w-[374px]">
              <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                {option.attribute}
              </label>
              <SearchableSelect
                value={selectedValues[option.attribute] || ''}
                onValueChange={(value) => handleValueChange(option.attribute, value)}
                options={option.options.map((o) => o.name)}
                placeholder={`اختر ${option.attribute}`}
                searchPlaceholder={`بحث عن ${option.attribute}...`}
                disabled={option.options.length === 0}
                triggerClassName="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-[#5F5E5E]"
                className="rounded-2xl border-[#ECECEC]"
                searchThreshold={5}
                debounceMs={300}
              />
            </div>
          ))
        )}
      </div>
    </BaseModal>
  );
}
