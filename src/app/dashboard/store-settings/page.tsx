'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  orderSettingsSchema,
  type OrderSettingsFormData,
} from './schemas/store';

import OrderSettingsFields from './components/EmployeeFormFields';
import { useMerchantSettings } from './hooks/useStoreSettings';

export default function OrderSettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } =
    useMerchantSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<OrderSettingsFormData>({
    resolver: zodResolver(orderSettingsSchema),
    defaultValues: {
      canOpenShipment: false, // Updated
      employeeCanEditContent: false, // Updated
    },
  });

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = (data: OrderSettingsFormData) => {
    updateSettings(data);
  };

  if (isLoading) {
    return <div className="text-center py-20">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="w-full container mx-auto px-4 py-10" dir="rtl">
      <ToastContainer position="top-right" rtl={true} />

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-[#5D24E1] rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">اعدادات المتجر</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white border border-black/8 shadow-lg rounded-lg overflow-hidden">
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
            className={`px-10 py-3 bg-[#5D24E1] text-white rounded-full font-bold transition-all ${
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
