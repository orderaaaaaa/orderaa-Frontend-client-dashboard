'use client';

import { useState, useEffect, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid, LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useProductVariantsOptions, SelectedVariant } from '@/services/orders';
import { Button } from '../ui/button';

interface AddSameTypeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variants: SelectedVariant[], quantity: number) => void;
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

  const handleVariantChange = (label: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const handleSave = () => {
    if (!isFormValid) return;

    const variants: SelectedVariant[] = Object.entries(selectedVariants).map(
      ([label, value]) => ({ label, value })
    );

    onSave(variants, quantity);
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
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
          className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] md:w-[827px] max-w-[827px] min-h-[400px] max-h-[85vh] bg-white rounded-[20px] shadow-xl flex flex-col overflow-hidden"
        >
          <div
            className="flex-shrink-0 h-[60px] rounded-t-[20px] flex items-center justify-center px-8 relative"
            style={{
              background:
                'linear-gradient(105.28deg, #FFFFFF 1.48%, #CBB5FD 182.49%, #FFFFFF 187.88%)',
            }}
          >
            <DialogPrimitive.Title className="text-xl font-bold text-black text-center">
              إضافة منتج من نفس النوع
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              className="absolute left-8 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <LiaTimesSolid className="w-6 h-6 text-black cursor-pointer" />
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Description className="sr-only">
            إضافة منتج من نفس النوع للطلب
          </DialogPrimitive.Description>

          <div className="flex-1 overflow-y-auto px-8 py-6">
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
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#F5F5F5] hover:bg-[#ECECEC] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LiaMinusSolid className="w-4 h-4 md:w-5 md:h-5 text-[#5F5E5E]" />
                    </button>
                    <span className="text-lg md:text-xl font-bold text-[#1F1F1F] min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      disabled={quantity >= 99}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary hover:bg-[#4B1BC4] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LiaPlusSolid className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </button>
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
                    <div key={option.label} className="flex-1 min-w-[200px]">
                      <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                        {option.label}
                      </label>
                      <SearchableSelect
                        value={selectedVariants[option.label] || ''}
                        onValueChange={(value) => handleVariantChange(option.label, value)}
                        options={option.values}
                        placeholder={`اختر ${option.label}`}
                        searchPlaceholder={`بحث عن ${option.label}...`}
                        emptyMessage="لا توجد خيارات متاحة"
                        noResultsMessage="لا توجد نتائج للبحث"
                        triggerClassName="h-[44px] md:h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-[#5F5E5E]"
                        className="rounded-2xl border-[#ECECEC]"
                        disabled={option.values.length === 0}
                        searchThreshold={5}
                      />
                    </div>
                  ))
                )}
              </div>
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
              disabled={!isFormValid}
              className="w-[146px] h-[37px] bg-primary border-[1.5px] border-primary rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LiaPlusSolid className="w-5 h-5 text-white" />
              <span className="text-lg font-bold text-white">إضافة</span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
