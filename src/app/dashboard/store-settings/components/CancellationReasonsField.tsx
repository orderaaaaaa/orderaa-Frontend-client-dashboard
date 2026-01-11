'use client';

import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { LiaHashtagSolid } from 'react-icons/lia';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface CancellationReasonsFieldProps {
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function CancellationReasonsField({
  watch,
  setValue,
  errors,
}: CancellationReasonsFieldProps) {
  const reasons = watch('cancellationReasons') || [];
  const [inputValue, setInputValue] = useState('');

  const handleAddReason = () => {
    const value = inputValue.trim();
    if (!value) return;

    if (!reasons.includes(value)) {
      setValue('cancellationReasons', [...reasons, value], {
        shouldValidate: true,
      });
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddReason();
    }
  };

  const removeReason = (indexToRemove: number) => {
    setValue(
      'cancellationReasons',
      reasons.filter((_, i) => i !== indexToRemove),
      { shouldValidate: true }
    );
  };

  return (
    <div className="w-full max-w-full flex flex-col gap-4 border-b border-gray-100 pb-6 overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-start gap-2">
        <LiaHashtagSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight">
            اسباب الغاء الطلب
          </h3>
          <p className="text-sm text-gray-500">
            أضف الأسباب التي تظهر عند إلغاء الطلب
          </p>
        </div>
      </div>

      {/* Input wrapper */}
      <div
        dir="rtl"
        className="relative w-full max-w-full overflow-hidden
                   border-2 border-gray-200 rounded-xl bg-gray-50
                   focus-within:border-primary transition-all p-2"
      >
        {/* Add button */}
        <button
          type="button"
          onClick={handleAddReason}
          disabled={!inputValue.trim()}
          className="absolute left-2 top-2 bottom-2
                     w-20 h-8 rounded-lg text-sm font-semibold
                     bg-primary text-white disabled:opacity-40
                     transition-colors"
        >
          إضافة
        </button>

        {/* Tags + input */}
        <div className="flex flex-wrap items-center gap-2 pl-24 max-w-full overflow-hidden min-w-0">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-center gap-2
                         bg-primary text-white font-semibold
                         px-3 py-1.5 rounded-full text-sm
                         max-w-full overflow-hidden
                         break-all whitespace-normal"
            >
              <span className="max-w-full break-all">{reason}</span>
              <button
                type="button"
                onClick={() => removeReason(index)}
                className="shrink-0 hover:text-red-300 transition-colors"
              >
                <IoMdClose className="w-3 h-3" />
              </button>
            </div>
          ))}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب السبب"
            className="flex-1 min-w-[80px] max-w-full
                       bg-transparent outline-none
                       py-1 px-2 text-sm
                       break-all"
          />
        </div>
      </div>

      {/* Error */}
      {errors.cancellationReasons && (
        <p className="text-red-500 text-xs">
          {errors.cancellationReasons.message}
        </p>
      )}
    </div>
  );
}
