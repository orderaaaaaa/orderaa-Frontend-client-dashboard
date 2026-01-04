'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { useProductVariantsOptions, SelectedVariant } from '@/services/orders';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Button } from '../ui/button';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variants: SelectedVariant[]) => void;
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

  // Fetch variant options for this product
  const { data: variantOptions = [], isLoading } = useProductVariantsOptions(
    isOpen ? productId : null
  );

  useEffect(() => {
    setSelectedValues(currentVariants);
  }, [currentVariants]);

  // Check if any value has changed
  const hasChanges = useMemo(() => {
    return Object.keys(selectedValues).some(
      (key) => selectedValues[key] !== currentVariants[key]
    );
  }, [selectedValues, currentVariants]);

  if (!isOpen) return null;

  const handleValueChange = (label: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleSave = () => {
    if (!hasChanges) return;

    // Convert selected values to array format for API
    const variants: SelectedVariant[] = Object.entries(selectedValues).map(
      ([label, value]) => ({ label, value })
    );

    onSave(variants);
    toast.success('تم تعديل المنتج بنجاح');
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div
        className="relative w-full max-w-[827px] mx-4 md:mx-0 min-h-[362px] bg-white rounded-[20px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="absolute top-0 left-0 right-0 h-[79px] rounded-t-[20px] flex items-center justify-center px-8"
          style={{
            background:
              'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
          }}
        >
          <h2 className="text-xl font-bold text-black text-center">
            تعديل المنتج
          </h2>

          <button
            onClick={onClose}
            className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-[101px] px-8 pb-24">
          <div className="flex flex-col md:flex-row gap-4 justify-end flex-wrap">
            {isLoading ? (
              <div className="w-full text-center text-gray-500">جاري التحميل...</div>
            ) : variantOptions.length === 0 ? (
              <div className="w-full text-center text-gray-500">لا توجد خيارات متاحة</div>
            ) : (
              variantOptions.map((option) => (
                <div key={option.label} className="w-full md:w-[374px]">
                  <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                    {option.label}
                  </label>
                  <SearchableSelect
                    value={selectedValues[option.label] || ''}
                    onValueChange={(value) => handleValueChange(option.label, value)}
                    options={option.values}
                    placeholder={`اختر ${option.label}`}
                    searchPlaceholder={`بحث عن ${option.label}...`}
                    disabled={option.values.length === 0}
                    triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                    className="rounded-2xl border-[#ECECEC]"
                    searchThreshold={5}
                    debounceMs={300}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="absolute bottom-[30px] right-8 left-8 flex justify-between">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
            <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LiaCheckSolid className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white">حفظ</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
