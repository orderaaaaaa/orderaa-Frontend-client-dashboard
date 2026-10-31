'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useFilterOptionsQuery } from '@/services/orders';

interface AddColorProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (color: string) => void;
  currentProductColors?: string[];
}

const defaultColorOptions = ['اسود', 'ابيض', 'احمر', 'ازرق', 'اخضر', 'بني', 'رمادي', 'اصفر', 'برتقالي', 'بنفسجي', 'وردي', 'بيج'];

export default function AddColorProductModal({
  isOpen,
  onClose,
  onSave,
  currentProductColors = [],
}: AddColorProductModalProps) {
  const [selectedColor, setSelectedColor] = useState('');

  // Fetch filter options using React Query
  const { data: filterOptions, isLoading } = useFilterOptionsQuery();
  const colorOptions = filterOptions?.data?.productColors?.length
    ? filterOptions.data.productColors
    : defaultColorOptions;

  useEffect(() => {
    if (isOpen) {
      setSelectedColor('');
    }
  }, [isOpen]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return selectedColor !== '';
  }, [selectedColor]);

  const handleSave = () => {
    if (!selectedColor) return;
    onSave(selectedColor);
    toast.success('تم إضافة اللون بنجاح');
    setSelectedColor('');
    onClose();
  };

  const handleClose = () => {
    setSelectedColor('');
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة منتج من نفس اللون"
      onConfirm={handleSave}
      confirmText="إضافة"
      confirmDisabled={!isFormValid}
    >
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">
          اختر اللون المطلوب لإرسال صورته للعميل عبر واتساب
        </p>

        {/* Color Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-foreground">
            اللون <span className="text-red-600">*</span>
          </label>
          <SearchableSelect
            value={selectedColor}
            onValueChange={setSelectedColor}
            options={colorOptions}
            placeholder="اختر اللون"
            searchPlaceholder="بحث عن اللون..."
            emptyMessage="لا توجد ألوان متاحة"
            noResultsMessage="لا توجد نتائج للبحث"
            triggerClassName="h-[44px] md:h-[57px] bg-background border border-border rounded-[38px] px-4 md:px-6 text-right text-base md:text-lg text-muted-foreground"
            className="rounded-2xl border-border"
            loading={isLoading}
            searchThreshold={5}
          />
        </div>

        {/* Current Product Colors Info */}
        {currentProductColors.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-bold text-foreground mb-2">ألوان المنتج الحالية:</p>
            <div className="flex flex-wrap gap-2">
              {currentProductColors.map((color, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-card border border-border rounded-full text-sm text-muted-foreground"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
