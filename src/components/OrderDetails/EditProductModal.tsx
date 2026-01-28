'use client';

import { useState, useEffect, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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

  const handleValueChange = (label: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleSave = () => {
    if (!hasChanges) return;

    const variants: SelectedVariant[] = Object.entries(selectedValues).map(
      ([label, value]) => ({ label, value })
    );

    onSave(variants);
    toast.success('تم تعديل المنتج بنجاح');
    onClose();
  };

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] md:w-[827px] max-w-[827px] min-h-[362px] max-h-[85vh] bg-white rounded-[20px] shadow-xl flex flex-col overflow-hidden"
        >
          <div
            className="flex-shrink-0 h-[60px] rounded-t-[20px] flex items-center justify-center px-8 relative"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-xl font-bold text-black text-center">
              تعديل المنتج
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            تعديل خيارات المنتج
          </DialogPrimitive.Description>

          <div className="flex-1 overflow-y-auto px-8 pt-10 pb-6">
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

          <div className="flex-shrink-0 px-8 py-[30px] flex justify-between">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-[146px] h-[37px] border-[1.5px] border-[#ECECEC] rounded-[28px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <LiaTimesSolid className="w-5 h-5 text-[#5F5E5E]" />
              <span className="text-lg font-bold text-[#5F5E5E]">إلغاء</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-[146px] h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaCheckSolid className="w-5 h-5 text-white" />
              <span className="text-lg font-bold text-white">حفظ</span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
