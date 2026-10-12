'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  personalDataSchema,
  PersonalDataFormData,
} from '@/schemas/personalData.schema';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/button';
import {
  LiaBuilding,
  LiaPhoneSolid,
  LiaUserSolid,
  LiaUserEditSolid,
  LiaEnvelope,
} from 'react-icons/lia';
import { useGovernoratesQuery, useCitiesQuery } from '@/services/lookups';
import useUpdateProfile from '../hooks/useUpdateProfile';
import { transformCityKeyForAPI } from '@/utils';
import { useAuthStore } from '@/store/authStore';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const SELECT_TRIGGER_CLASS =
  'h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-right text-base text-gray-900 transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export default function PersonalData() {
  const { data: governorates = [], isLoading: loadingGovernorates } = useGovernoratesQuery();
  const { updateProfile, isLoading: isSaving } = useUpdateProfile();
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<PersonalDataFormData>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      governorate: user?.governorate || '',
      city: user?.city || '',
    },
  });

  const governorate = watch('governorate');
  const city = watch('city');
  const fullName = watch('fullName');
  const email = watch('email');
  const phoneNumber = watch('phoneNumber');
  const {
    data: cityOptions = [],
    isLoading: loadingCities,
    isSuccess: citiesLoaded,
    isFetching: fetchingCities,
  } = useCitiesQuery(governorate || '');

  useEffect(() => {
    if (!governorate && city) {
      setValue('city', '');
      return;
    }
    if (!city || !citiesLoaded || fetchingCities) return;
    const cityExists = cityOptions.some((c) => c.key === city);
    if (!cityExists) {
      setValue('city', '');
    }
  }, [governorate, city, cityOptions, citiesLoaded, fetchingCities, setValue]);

  const hasAnyValue = Boolean(
    (fullName && fullName.trim()) ||
    (email && email.trim()) ||
    (phoneNumber && phoneNumber.trim()) ||
    (governorate && governorate.trim()) ||
    (city && city.trim())
  );
  const guard = useUnsavedChangesGuard(isDirty && !isSaving);
  const onSubmit = async (data: PersonalDataFormData) => {
    const payload: Partial<{
      fullName: string;
      email: string;
      phoneNumber: string;
      governorate: string;
      city: string;
    }> = {};

    if (data.fullName?.trim()) payload.fullName = data.fullName.trim();
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.phoneNumber?.trim()) payload.phoneNumber = data.phoneNumber.trim();
    if (data.governorate?.trim()) payload.governorate = data.governorate.trim();

    if (data.governorate?.trim() && data.city?.trim()) {
      payload.city = transformCityKeyForAPI(data.city.trim());
    }

    updateProfile(payload);
  };

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        governorate: user.governorate || '',
        city: user.city || '',
      });
    }
  }, [user, reset]);

  const inputClassName =
    'text-base text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg">
          <LiaUserEditSolid className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">البيانات الشخصية</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <label htmlFor="personal-full-name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaUserSolid className="w-5 h-5 text-primary" />
              <span>الاسم الكامل</span>
            </label>
            <Input
              label=""
              id="personal-full-name"
              name="fullName"
              type="text"
              placeholder="أدخل الاسم الكامل"
              register={register}
              error={errors.fullName?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personal-phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaPhoneSolid className="w-5 h-5 text-primary" />
              <span>رقم الهاتف</span>
            </label>
            <Input
              label=""
              id="personal-phone"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              name="phoneNumber"
              type="text"
              placeholder="01xxxxxxxxx"
              register={register}
              error={errors.phoneNumber?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personal-email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaEnvelope className="w-5 h-5 text-primary" />
              <span>البريد الإلكتروني</span>
            </label>
            <Input
              label=""
              id="personal-email"
              dir="ltr"
              autoComplete="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              register={register}
              error={errors.email?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personal-governorate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaBuilding className="w-5 h-5 text-primary" />
              <span>المحافظة</span>
            </label>
            <SearchableSelect
              id="personal-governorate"
              value={governorate || ''}
              onChange={(v) => {
                setValue('governorate', v, { shouldValidate: true, shouldDirty: true });
                setValue('city', '', { shouldDirty: true });
              }}
              options={governorates}
              placeholder={loadingGovernorates ? 'جاري التحميل...' : 'اختر المحافظة'}
              disabled={loadingGovernorates}
              widthClass="w-full"
              triggerClassName={SELECT_TRIGGER_CLASS}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="personal-city" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaBuilding className="w-5 h-5 text-primary" />
              <span>المنطقة</span>
            </label>
            <SearchableSelect
              id="personal-city"
              value={city || ''}
              onChange={(v) => setValue('city', v, { shouldValidate: true, shouldDirty: true })}
              options={cityOptions}
              placeholder={
                !governorate
                  ? 'اختر المحافظة أولاً'
                  : loadingCities
                    ? 'جاري التحميل...'
                    : 'اختر المنطقة'
              }
              disabled={!governorate || loadingCities}
              widthClass="w-full"
              triggerClassName={SELECT_TRIGGER_CLASS}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-start gap-3">
          <Button
            type="submit"
            size="lg"
            className="min-h-10"
            disabled={!isDirty || !hasAnyValue || isSaving}
            loading={isSaving}
            loadingText="جاري الحفظ..."
          >
            حفظ التغييرات
          </Button>
          <span
            className={`text-sm ${isDirty ? 'text-amber-700' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {isDirty ? 'لديك تغييرات غير محفوظة' : 'لا توجد تغييرات'}
          </span>
        </div>
      </form>
      <UnsavedChangesDialog
        isOpen={guard.pendingHref !== null}
        onStay={guard.cancelLeave}
        onLeave={guard.confirmLeave}
      />
    </div>
  );
}
