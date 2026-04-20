'use client';

import { useState } from 'react';
import { LiaTimesSolid, LiaFileAltSolid } from 'react-icons/lia';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

interface PageNamesFieldProps {
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function PageNamesField({
  watch,
  setValue,
  errors,
}: PageNamesFieldProps) {
  const names = watch('pageNames') || [];
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    const value = inputValue.trim();
    if (!value) return;

    if (!names.includes(value)) {
      setValue('pageNames', [...names, value], {
        shouldValidate: true,
      });
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddName();
    }
  };

  const removeName = (indexToRemove: number) => {
    setValue(
      'pageNames',
      names.filter((_, i) => i !== indexToRemove),
      { shouldValidate: true }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaFileAltSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            أسماء الصفحات
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            أضف أسماء الصفحات التي تظهر في صفحة إضافة الطلبات اليدوية
          </p>
        </div>
      </div>

      <div
        dir="rtl"
        className="relative w-full border-2 border-gray-200 rounded-xl bg-gray-50 focus-within:border-primary transition-all p-2 sm:p-3"
      >
        <Button
          type="button"
          size="sm"
          onClick={handleAddName}
          disabled={!inputValue.trim()}
          className="absolute left-2 bottom-2 w-16 sm:w-20 h-8 rounded-lg text-xs sm:text-sm font-semibold"
        >
          إضافة
        </Button>

        <div className="flex flex-wrap items-center gap-2 pr-0 pl-20 sm:pl-24 min-h-[32px]">
          {names.map((name, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 bg-primary text-white font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm"
            >
              <span>{name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeName(index)}
                className="hover:text-red-500 transition-colors hover:bg-inherit"
              >
                <LiaTimesSolid />
              </Button>
            </div>
          ))}

          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب اسم الصفحة"
            className="flex-1 min-w-[80px]"
            inputClassName="bg-transparent border-none shadow-none py-1 px-2 text-xs sm:text-sm"
          />
        </div>
      </div>

      {errors.pageNames && (
        <p className="text-red-500 text-base">
          {errors.pageNames.message}
        </p>
      )}
    </div>
  );
}
