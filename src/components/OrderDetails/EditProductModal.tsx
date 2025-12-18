'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaCheckSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { useFilterOptionsQuery } from '@/services/orders';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '../ui/button';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (size: string, color: string) => void;
  currentSize: string | number;
  currentColor: string;
}

export default function EditProductModal({
  isOpen,
  onClose,
  onSave,
  currentSize,
  currentColor,
}: EditProductModalProps) {
  const [size, setSize] = useState(String(currentSize));
  const [color, setColor] = useState(currentColor);

  // Fetch filter options using React Query
  const { data: filterOptions, isLoading } = useFilterOptionsQuery();
  const sizeOptions = filterOptions?.data?.productSizes ?? [];
  const colorOptions = filterOptions?.data?.productColors ?? [];

  useEffect(() => {
    setSize(String(currentSize));
    setColor(currentColor);
  }, [currentSize, currentColor]);

  // Check if any value has changed
  const hasChanges = useMemo(() => {
    return size !== String(currentSize) || color !== currentColor;
  }, [size, color, currentSize, currentColor]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!hasChanges) return;
    onSave(size, color);
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
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            {/* Size Dropdown - Right side */}
            <div className="w-full md:w-[374px]">
              <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                القياس
              </label>
              <SearchableSelect
                value={size}
                onValueChange={setSize}
                options={sizeOptions}
                placeholder="اختر القياس"
                searchPlaceholder="بحث عن القياس..."
                disabled={isLoading || sizeOptions.length === 0}
                triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                className="rounded-2xl border-[#ECECEC]"
                searchThreshold={5}
                debounceMs={300}
              />
            </div>

            {/* Color Dropdown - Left side */}
            <div className="w-full md:w-[374px]">
              <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                اللون
              </label>
              <SearchableSelect
                value={color}
                onValueChange={setColor}
                options={colorOptions}
                placeholder="اختر اللون"
                searchPlaceholder="بحث عن اللون..."
                disabled={isLoading || colorOptions.length === 0}
                triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                className="rounded-2xl border-[#ECECEC]"
                searchThreshold={5}
                debounceMs={300}
              />
            </div>
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
