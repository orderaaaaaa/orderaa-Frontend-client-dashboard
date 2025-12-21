'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  personalDataSchema,
  PersonalDataFormData,
} from '@/schemas/personalData.schema';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/app/dashboard/orders/allOrders/components/FilterSection/SearchableSelect';
import { getGovernorates } from '@/lib/api/lookups';
import api from '@/lib/api';
import { LiaBuilding, LiaPhoneSolid } from 'react-icons/lia';
import { CiAt } from 'react-icons/ci';
import { IoBriefcaseOutline } from 'react-icons/io5';

interface GovernorateData {
  key: string;
  value: string;
}

export default function PersonalData() {
  const [governorates, setGovernorates] = useState<GovernorateData[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PersonalDataFormData>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      governorate: '',
    },
  });

  const governorate = watch('governorate');
  const fullName = watch('fullName');
  const email = watch('email');
  const phoneNumber = watch('phoneNumber');

  // Check if at least one field has a value
  const hasAnyValue = Boolean(
    (fullName && fullName.trim()) ||
      (email && email.trim()) ||
      (phoneNumber && phoneNumber.trim()) ||
      (governorate && governorate.trim())
  );

  // Fetch governorates on mount
  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const data = await getGovernorates();
        if (Array.isArray(data)) {
          setGovernorates(data);
        }
      } catch (error) {
        console.error('Failed to fetch governorates:', error);
      }
    };
    fetchGovernorates();
  }, []);

  const onSubmit = async (data: PersonalDataFormData) => {
    try {
      // Filter out empty values
      const payload = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value && value.trim() !== ''
        )
      );

      // Make PATCH request
      await api.patch('/settings/personal-data', payload);

      // Handle success (you can add toast notification here)
      console.log('Personal data updated successfully');
    } catch (error) {
      console.error('Error updating personal data:', error);
      // Handle error (you can add toast notification here)
    }
  };

  return (
    <div className="bg-white rounded-lg p-6" style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className=" p-4 bg-[#5D24E114] rounded flex items-center justify-center">
          <img
            src="/Icons/WebAccount.svg"
            alt="Web Account"
            className="w-5 h-5"
          />
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
              <IoBriefcaseOutline className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
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
              <LiaPhoneSolid className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
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
              <CiAt className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
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
                <LiaBuilding className="w-6 h-6 text-[#5D24E1] flex-shrink-0" />
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
                  onChange={(v) =>
                    setValue('governorate', v, { shouldValidate: true })
                  }
                  options={governorates}
                  placeholder="اختر المحافظة"
                  widthClass="w-full"
                  error={errors.governorate?.message}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!hasAnyValue}
            className={`px-12 py-2 text-lg rounded-lg font-medium transition-colors ${
              hasAnyValue
                ? 'bg-[#5D24E1] text-white cursor-pointer'
                : 'bg-[#c4c4c4] text-white cursor-not-allowed'
            }`}
          >
            حفظ التغيرات
          </button>
        </div>
      </form>
    </div>
  );
}
