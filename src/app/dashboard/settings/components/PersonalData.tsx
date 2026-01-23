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

export default function PersonalData() {
  const { data: governorates = [], isLoading: loadingGovernorates } = useGovernoratesQuery();
  const { updateProfile, isLoading: isSaving } = useUpdateProfile();
  const user = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
  const { data: cityOptions = [], isLoading: loadingCities } = useCitiesQuery(governorate || '');

  useEffect(() => {
    if (!governorate && city) {
      setValue('city', '');
    } else if (city) {
      const cityExists = cityOptions.some((c) => c.key === city);
      if (!cityExists) {
        setValue('city', '');
      }
    }
  }, [governorate, city, cityOptions, setValue]);

  const hasAnyValue = Boolean(
    (fullName && fullName.trim()) ||
    (email && email.trim()) ||
    (phoneNumber && phoneNumber.trim()) ||
    (governorate && governorate.trim()) ||
    (city && city.trim())
  );
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

  const selectWrapperClassName =
    '[&>div]:w-full [&>div>button]:h-12 [&>div>button]:px-4 [&>div>button]:rounded-lg [&>div>button]:bg-gray-50 [&>div>button]:border [&>div>button]:border-gray-200 [&>div>button]:text-right [&>div>button]:text-base [&>div>button]:text-gray-900 [&>div>button]:justify-between [&>div>button]:items-center [&>div>button>span]:text-right [&>div>button>span:empty]:text-gray-400 [&>div>button:hover]:border-primary [&>div>button:hover]:bg-gray-50 [&>div>button]:focus:outline-none [&>div>button]:focus:border-primary [&>div>button]:focus:ring-1 [&>div>button]:focus:ring-primary [&>div>button]:transition-colors';

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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaUserSolid className="w-5 h-5 text-primary" />
              <span>الاسم الكامل</span>
            </label>
            <Input
              label=""
              name="fullName"
              type="text"
              placeholder="أدخل الاسم الكامل"
              register={register}
              error={errors.fullName?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaPhoneSolid className="w-5 h-5 text-primary" />
              <span>رقم الهاتف</span>
            </label>
            <Input
              label=""
              name="phoneNumber"
              type="text"
              placeholder="01xxxxxxxxx"
              register={register}
              error={errors.phoneNumber?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaEnvelope className="w-5 h-5 text-primary" />
              <span>البريد الإلكتروني</span>
            </label>
            <Input
              label=""
              name="email"
              type="email"
              placeholder="example@email.com"
              register={register}
              error={errors.email?.message}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaBuilding className="w-5 h-5 text-primary" />
              <span>المحافظة</span>
            </label>
            <div className={selectWrapperClassName}>
              <SearchableSelect
                value={governorate || ''}
                onChange={(v) => {
                  setValue('governorate', v, { shouldValidate: true });
                  if (v) setValue('city', '');
                }}
                options={governorates}
                placeholder={loadingGovernorates ? 'جاري التحميل...' : 'اختر المحافظة'}
                disabled={loadingGovernorates}
                widthClass="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <LiaBuilding className="w-5 h-5 text-primary" />
              <span>المنطقة</span>
            </label>
            <div className={selectWrapperClassName}>
              <SearchableSelect
                value={city || ''}
                onChange={(v) => setValue('city', v, { shouldValidate: true })}
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
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-start">
          <Button
            type="submit"
            size="lg"
            disabled={!hasAnyValue || isSaving}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </div>
  );
}
