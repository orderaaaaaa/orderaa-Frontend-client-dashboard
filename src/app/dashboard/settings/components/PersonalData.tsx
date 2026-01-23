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
import {
  LiaBuilding,
  LiaPhoneSolid,
  LiaShieldAltSolid,
  LiaUserEditSolid,
} from 'react-icons/lia';
import { CiAt } from 'react-icons/ci';
import { IoBriefcaseOutline } from 'react-icons/io5';
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
      username: string;
      email: string;
      phoneNumber: string;
      governorate: string;
      city: string;
    }> = {};

    if (data.fullName?.trim()) payload.username = data.fullName.trim();
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

  return (
    <div className="bg-white rounded-lg p-6" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className=" p-3 bg-[#5D24E114] rounded flex items-center justify-center">
          <LiaUserEditSolid className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-medium text-right">البيانات الشخصية</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name - Right Column */}
          <div className="flex flex-col items-end gap-4">
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <IoBriefcaseOutline className="w-6 h-6 text-primary flex-shrink-0" />
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                أدخل الاسم الكامل
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="fullName"
                type="text"
                placeholder="أدخل الاسم الكامل"
                register={register}
                error={errors.fullName?.message}
                className="!h-[46px] !px-4 !py-0 rounded-sm bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60 placeholder:font-medium"
              />
            </div>
          </div>

          {/* Phone Number - Left Column */}
          <div className="flex flex-col items-end gap-4">
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <LiaPhoneSolid className="w-6 h-6 text-primary flex-shrink-0" />
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                رقم الهاتف
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="phoneNumber"
                type="text"
                placeholder="رقم الهاتف"
                register={register}
                error={errors.phoneNumber?.message}
                className="!h-[46px] !px-4 !py-0 rounded-sm bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60 placeholder:font-medium"
              />
            </div>
          </div>

          {/* Email - Right Column */}
          <div className="flex flex-col items-end gap-2">
            <div
              className="w-full flex items-center gap-2"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <CiAt className="w-6 h-6 text-primary flex-shrink-0" />
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                البريد الإلكتروني
              </span>
            </div>
            <div className="w-full">
              <Input
                label=""
                name="email"
                type="email"
                placeholder="البريد الإلكتروني"
                register={register}
                error={errors.email?.message}
                className="!h-[46px] !px-4 !py-0 rounded-sm bg-[rgba(234,234,234,0.25)] !border-black/16 text-right text-base font-normal text-black placeholder:text-black/60 placeholder:font-medium"
              />
            </div>
          </div>

          {/* Governorate - Left Column */}
          <div className="flex flex-col items-end gap-3">
            <div
              className="w-full flex items-center gap-2 relative"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div className="relative">
                <LiaBuilding className="w-6 h-6 text-primary flex-shrink-0" />
              </div>
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                المحافظة
              </span>
            </div>
            <div className="w-full relative">
              <div className="[&>div]:w-full [&>div>button]:!h-[46px] [&>div>button]:!px-4 [&>div>button]:!py-0 [&>div>button]:!rounded-sm [&>div>button]:!bg-[rgba(234,234,234,0.25)] [&>div>button]:!border-black/16 [&>div>button]:!text-right [&>div>button]:!text-base [&>div>button]:!font-normal [&>div>button]:!text-black [&>div>button]:!border [&>div>button]:!justify-between [&>div>button]:!items-center [&>div>button>span]:!text-right [&>div>button>span]:!text-black [&>div>button>span:empty]:!text-black/60 [&>div>button>span:empty]:!font-medium [&>div>button:hover]:!bg-[rgba(234,234,234,0.25)] [&>div>button]:focus:!outline-none [&>div>button]:focus:!ring-0 [&>div>button>svg]:!left-2 [&>div>button>svg]:!top-1/2 [&>div>button>svg]:!-translate-y-1/2 [&>div>button]:!truncate">
                <SearchableSelect
                  value={governorate || ''}
                  onChange={(v) => {
                    setValue('governorate', v, { shouldValidate: true });
                    // Clear city when governorate changes
                    if (v) {
                      setValue('city', '');
                    }
                  }}
                  options={governorates}
                  placeholder={
                    loadingGovernorates ? 'جاري التحميل...' : 'اختر المحافظة'
                  }
                  disabled={loadingGovernorates}
                  widthClass="w-full"
                />
              </div>
            </div>
          </div>

          {/* City - Right Column */}
          <div className="flex flex-col items-end gap-3">
            <div
              className="w-full flex items-center gap-2 relative"
              style={{
                direction: 'rtl',
                justifyContent: 'flex-start',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <div className="relative">
                <LiaBuilding className="w-6 h-6 text-primary flex-shrink-0" />
              </div>
              <span
                className="text-base md:text-xl font-medium text-right"
                style={{ textAlign: 'right' }}
              >
                المنطقة
              </span>
            </div>
            <div className="w-full relative">
              <div className="[&>div]:w-full [&>div>button]:!h-[46px] [&>div>button]:!px-4 [&>div>button]:!py-0 [&>div>button]:!rounded-sm [&>div>button]:!bg-[rgba(234,234,234,0.25)] [&>div>button]:!border-black/16 [&>div>button]:!text-right [&>div>button]:!text-base [&>div>button]:!font-normal [&>div>button]:!text-black [&>div>button]:!border [&>div>button]:!justify-between [&>div>button]:!items-center [&>div>button>span]:!text-right [&>div>button>span]:!text-black [&>div>button>span:empty]:!text-black/60 [&>div>button>span:empty]:!font-medium [&>div>button:hover]:!bg-[rgba(234,234,234,0.25)] [&>div>button]:focus:!outline-none [&>div>button]:focus:!ring-0 [&>div>button>svg]:!left-2 [&>div>button>svg]:!top-1/2 [&>div>button>svg]:!-translate-y-1/2 [&>div>button]:!truncate">
                <SearchableSelect
                  value={city || ''}
                  onChange={(v) =>
                    setValue('city', v, { shouldValidate: true })
                  }
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
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!hasAnyValue || isSaving}
            className={`px-12 py-2 text-lg rounded-lg font-medium transition-colors ${hasAnyValue && !isSaving
                ? 'bg-primary text-white cursor-pointer'
                : 'bg-[#c4c4c4] text-white cursor-not-allowed'
              }`}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغيرات'}
          </button>
        </div>
      </form>
    </div>
  );
}
