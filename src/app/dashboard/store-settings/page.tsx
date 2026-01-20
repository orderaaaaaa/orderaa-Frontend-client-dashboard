'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import {
  orderSettingsSchema,
  type OrderSettingsFormData,
} from './schemas/store';

import OrderSettingsFields from './components/EmployeeFormFields';
import { useMerchantSettings } from './hooks/useStoreSettings';
import { useShippingConfig } from './hooks/useShippingConfig';
import { sanitizeOrderSettings } from './utils/sanitizeOrderSettings';
import { mapSettingsToForm } from './utils/mapSettingsToForm';
import { ORDER_SETTINGS_DEFAULTS } from './schemas/store.defaults';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderSettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } =
    useMerchantSettings();
  const { hasShippingConfig } = useShippingConfig();

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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form Errors:', errors);
    }
  }, [errors]);

  const onSubmit = (data: OrderSettingsFormData) => {
    updateSettings(sanitizeOrderSettings(data, !hasShippingConfig));
  };

  if (isLoading) {
    return (
      <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10" dir="rtl">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gray-200 rounded-full" />
            <div className="h-8 bg-gray-200 rounded w-40" />
          </div>
          <Card>
            <CardContent className="p-4 sm:p-6 lg:p-10">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32" />
                  <div className="h-36 bg-gray-200 rounded" />
                </div>
                <div className="h-px bg-gray-200" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-28" />
                  <div className="h-11 bg-gray-200 rounded" />
                </div>
                <div className="h-px bg-gray-200" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-36" />
                  <div className="flex gap-6">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32" />
                  <div className="h-14 bg-gray-200 rounded" />
                </div>
                <div className="h-px bg-gray-200" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-40" />
                  <div className="h-11 bg-gray-200 rounded max-w-xs" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto px-4 sm:px-6 lg:px-6 py-2 sm:py-4">
      <header className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 sm:h-8 bg-primary rounded-full shrink-0" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            اعدادات المتجر
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <OrderSettingsFields
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            size="lg"
            className={clsx(
              'px-8 sm:px-12 py-3 rounded-full font-bold',
              isUpdating && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isUpdating ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </Button>
        </div>
      </form>
    </div>
  );
}
