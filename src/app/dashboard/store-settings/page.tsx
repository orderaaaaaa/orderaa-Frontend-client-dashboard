'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  orderSettingsSchema,
  type OrderSettingsFormData,
} from './schemas/store';

import OrderSettingsFields from './components/EmployeeFormFields';
import { useMerchantSettings } from './hooks/useStoreSettings';
import { useShippingConfig } from './hooks/useShippingConfig';
import { usePageNamesQuery } from '@/services/lookups';
import { sanitizeOrderSettings } from './utils/sanitizeOrderSettings';
import { mapSettingsToForm } from './utils/mapSettingsToForm';
import { ORDER_SETTINGS_DEFAULTS } from './schemas/store.defaults';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CustomerBadgeSettingsSection from './components/CustomerBadgeSettingsSection';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const FORM_ID = 'store-settings-form';

export default function OrderSettingsPage() {
  const { settings, isLoading, isError, refetch, updateSettings, isUpdating } =
    useMerchantSettings();
  const { hasShippingConfig } = useShippingConfig();
  const {
    data: pageNames,
    isError: isPageNamesError,
    refetch: refetchPageNames,
  } = usePageNamesQuery();

  const [initialized, setInitialized] = useState(false);
  const [dirtySections, setDirtySections] = useState<Record<string, boolean>>({});

  const reportSectionDirty = useCallback((key: string, isDirty: boolean) => {
    setDirtySections((prev) =>
      (prev[key] ?? false) === isDirty ? prev : { ...prev, [key]: isDirty }
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<OrderSettingsFormData>({
    resolver: zodResolver(orderSettingsSchema),
    defaultValues: ORDER_SETTINGS_DEFAULTS,
  });

  useEffect(() => {
    if (settings && pageNames !== undefined && !initialized) {
      reset(mapSettingsToForm({ ...settings, pageNames }));
      setInitialized(true);
    }
  }, [settings, pageNames, reset, initialized]);

  const sectionsDirty = Object.values(dirtySections).some(Boolean);
  const guard = useUnsavedChangesGuard(isDirty || sectionsDirty);

  const onSubmit = (data: OrderSettingsFormData) => {
    updateSettings(sanitizeOrderSettings(data, !hasShippingConfig), {
      onSuccess: () => reset(getValues()),
    });
  };

  const loadFailed = (isError || isPageNamesError) && !initialized;

  if (loadFailed) {
    return (
      <div className="w-full container mx-auto px-4 sm:px-6 lg:px-6 py-6" dir="rtl">
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <p className="text-lg font-bold text-gray-900">
              تعذّر تحميل إعدادات المتجر
            </p>
            <p className="text-sm text-gray-600">
              لم نحفظ أي شيء. أعد المحاولة قبل تعديل الإعدادات حتى لا تُستبدل إعداداتك الحالية.
            </p>
            <Button
              type="button"
              onClick={() => {
                if (isError) refetch();
                if (isPageNamesError) refetchPageNames();
              }}
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !initialized) {
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

      <form
        id={FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardContent className="p-0">
            <OrderSettingsFields
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              onSectionDirtyChange={reportSectionDirty}
            />
          </CardContent>
        </Card>
      </form>
      <CustomerBadgeSettingsSection onDirtyChange={reportSectionDirty} />

      <StickyFormFooter
        isDirty={isDirty}
        isSaving={isUpdating}
        status={
          !isDirty && sectionsDirty
            ? 'لديك تغييرات غير محفوظة في قسم آخر، احفظه من زره'
            : undefined
        }
      >
        <Button
          type="submit"
          form={FORM_ID}
          disabled={!isDirty || isUpdating}
          loading={isUpdating}
          loadingText="جاري الحفظ..."
          className="min-h-10 rounded-full px-8 font-bold"
        >
          حفظ البيانات
        </Button>
      </StickyFormFooter>

      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
      />
    </div>
  );
}
