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

  const addReason = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!reasons.includes(inputValue.trim())) {
        setValue('cancellationReasons', [...reasons, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeReason = (indexToRemove: number) => {
    const updatedReasons = reasons.filter(
      (_, index) => index !== indexToRemove
    );
    setValue('cancellationReasons', updatedReasons);
  };

  return (
    <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
      <div className="w-full flex items-start gap-2">
        <LiaHashtagSolid className="w-6 h-6 text-primary mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold leading-tight">
            اسباب الغاء الطلب
          </h3>
          <p className="text-sm text-gray-500">
            أضف الأسباب التي تظهر عند إلغاء الطلب
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-200 rounded-xl bg-gray-50 focus-within:border-primary transition-all">
        {reasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-primary text-white font-semibold px-3 py-1.5 rounded-full text-sm"
          >
            <span>{reason}</span>
            <button
              type="button"
              onClick={() => removeReason(index)}
              className="hover:text-red-400 transition-colors"
            >
              <IoMdClose className="w-3 h-3" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={addReason}
          placeholder="اكتب السبب واضغط Enter"
          className="flex-1 bg-transparent outline-none py-1 px-2 text-sm min-w-[120px]"
        />
      </div>
      {errors.cancellationReasons && (
        <p className="text-red-500 text-xs">
          {errors.cancellationReasons.message}
        </p>
      )}
    </div>
  );
}
