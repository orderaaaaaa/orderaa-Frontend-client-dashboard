'use client';

import { useState, useEffect, useMemo } from 'react';
import { LiaTimesSolid, LiaPlusSolid, LiaMinusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useFilterOptionsQuery } from '@/services/orders';
import { Button } from '../ui/button';

interface AddSameTypeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (size: string, color: string, quantity: number) => void;
  productType: string;
}

const defaultSizeOptions = ['37', '38', '39', '40', '41', '42', '43', '44', '45'];
const defaultColorOptions = ['اسود', 'ابيض', 'احمر', 'ازرق', 'اخضر', 'بني', 'رمادي'];

export default function AddSameTypeProductModal({
  isOpen,
  onClose,
  onSave,
  productType,
}: AddSameTypeProductModalProps) {
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch filter options using React Query
  const { data: filterOptions, isLoading } = useFilterOptionsQuery();
  const sizeOptions = filterOptions?.data?.productSizes?.length
    ? filterOptions.data.productSizes
    : defaultSizeOptions;
  const colorOptions = filterOptions?.data?.productColors?.length
    ? filterOptions.data.productColors
    : defaultColorOptions;

  useEffect(() => {
    if (isOpen) {
      setSize('');
      setColor('');
      setQuantity(1);
    }
  }, [isOpen]);

  // Check if form is valid (all required fields filled)
  const isFormValid = useMemo(() => {
    return size !== '' && color !== '' && quantity > 0;
  }, [size, color, quantity]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!isFormValid) return;
    onSave(size, color, quantity);
    toast.success('تم إضافة المنتج بنجاح');
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
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
        className="relative w-full max-w-[827px] mx-4 md:mx-0 min-h-[400px] bg-white rounded-[20px] shadow-xl"
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
            إضافة منتج من نفس النوع
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
          <div className="flex flex-col gap-4">
            {/* Product Type (Read-only) */}
            <div className="w-full">
              <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                النوع
              </label>
              <div className="w-full h-[57px] bg-[#F5F5F5] border border-[#ECECEC] rounded-[38px] px-6 flex items-center justify-end">
                <span className="text-lg text-[#1F1F1F] font-bold">
                  {productType}
                </span>
              </div>
            </div>

            {/* Row with 3 dropdowns */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Quantity Controls */}
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  الكمية
                </label>
                <div className="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full bg-[#F5F5F5] hover:bg-[#ECECEC] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LiaMinusSolid className="w-5 h-5 text-[#5F5E5E]" />
                  </button>
                  <span className="text-xl font-bold text-[#1F1F1F] min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    disabled={quantity >= 99}
                    className="w-10 h-10 rounded-full bg-[#5D24E1] hover:bg-[#4B1BC4] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LiaPlusSolid className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Color Dropdown */}
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  اللون
                </label>
                <SearchableSelect
                  value={color}
                  onValueChange={setColor}
                  options={colorOptions}
                  placeholder="اختر اللون"
                  searchPlaceholder="بحث عن اللون..."
                  emptyMessage="لا توجد ألوان متاحة"
                  noResultsMessage="لا توجد نتائج للبحث"
                  triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                  className="rounded-2xl border-[#ECECEC]"
                  loading={isLoading}
                  searchThreshold={5}
                />
              </div>

              {/* Size Dropdown */}
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1F1F1F] mb-3 text-right">
                  القياس
                </label>
                <SearchableSelect
                  value={size}
                  onValueChange={setSize}
                  options={sizeOptions}
                  placeholder="اختر القياس"
                  searchPlaceholder="بحث عن القياس..."
                  emptyMessage="لا توجد مقاسات متاحة"
                  noResultsMessage="لا توجد نتائج للبحث"
                  triggerClassName="h-[57px] bg-white border border-[#ECECEC] rounded-[38px] px-6 text-right text-lg text-[#5F5E5E]"
                  className="rounded-2xl border-[#ECECEC]"
                  loading={isLoading}
                  searchThreshold={5}
                />
              </div>
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
            disabled={!isFormValid}
            className="w-[146px] h-[37px] bg-[#5D24E1] border-[1.5px] border-[#5D24E1] rounded-[28px] flex items-center justify-center gap-2 hover:bg-[#4B1BC4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LiaPlusSolid className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-white">إضافة</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
