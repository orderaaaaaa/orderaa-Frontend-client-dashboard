'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  orderSettingsSchema,
  type OrderSettingsFormData,
} from './schemas/store';
import OrderSettingsFields from './components/EmployeeFormFields';

export default function OrderSettingsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OrderSettingsFormData>({
    resolver: zodResolver(orderSettingsSchema),
    defaultValues: {
      canOpenOrder: false,
      canEditOrder: false,
    },
  });

  const onSubmit = (data: OrderSettingsFormData) => {
    const payload = {
      ...data,
      category: data.canEditOrder ? undefined : data.category,
      response: 'yes',
    };
    console.log('Final Payload:', payload);
    alert('Check console for payload');
  };

  return (
    <div className="w-full container mx-auto px-4 py-10" dir="rtl">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-primary rounded-full"></div>
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
            className="px-10 py-3 bg-primary text-white rounded-full font-bold hover:bg-[#4a1cb5] transition-all"
          >
            حفظ البيانات
          </button>
        </div>
      </form>
    </div>
  );
}
