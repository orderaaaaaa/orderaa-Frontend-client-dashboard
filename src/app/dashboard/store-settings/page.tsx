'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  orderSettingsSchema,
  type OrderSettingsFormData,
} from './schemas/store';

import OrderSettingsFields from './components/EmployeeFormFields';
import { useMerchantSettings } from './hooks/useStoreSettings';
import { sanitizeOrderSettings } from './utils/sanitizeOrderSettings';
import { mapSettingsToForm } from './utils/mapSettingsToForm';
import { ORDER_SETTINGS_DEFAULTS } from './schemas/store.defaults';

export default function OrderSettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } =
    useMerchantSettings();

  const initializedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<OrderSettingsFormData>({
    resolver: zodResolver(orderSettingsSchema),
    defaultValues: ORDER_SETTINGS_DEFAULTS,
  });

  useEffect(() => {
    if (settings && !initializedRef.current) {
      reset(mapSettingsToForm(settings));
      initializedRef.current = true;
    }
  }, [settings, reset]);

  const onSubmit = (data: OrderSettingsFormData) => {
    updateSettings(sanitizeOrderSettings(data));
  };

  if (isLoading) {
    return <div className="text-center py-20">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden container mx-auto px-4 py-10" dir="rtl">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3 min-w-0">
          <div className="w-1 h-8 bg-primary rounded-full shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">اعدادات المتجر</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-full overflow-x-hidden">
        <div className="bg-white border border-black/8 shadow-lg rounded-lg overflow-hidden w-full max-w-full">
          <OrderSettingsFields
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <div className="mt-6 flex justify-start">
          <button
            type="submit"
            disabled={isUpdating}
            className={`px-6 sm:px-10 py-3 bg-primary text-white rounded-full font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
              isUpdating
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-[#4a1cb5]'
            }`}
          >
            {isUpdating ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </button>
        </div>
      </form>
    </div>
  );
}
