'use client';

import React from 'react';
import Dropdown from '@/components/ui/Dropdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';

type OrderProps = {
  platform: string;
  pageName: string;
  onPlatformChange: (v: string) => void;
  onPageNameChange: (v: string) => void;
  errors?: { platform?: string; pageName?: string };
};

function Order({
  platform,
  pageName,
  onPlatformChange,
  onPageNameChange,
  errors,
}: OrderProps) {
  return (
    <div
      className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">مصدر الطلب</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-6 mb-8">
          <div className="max-w-[502px]" data-field-error="platform">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                منصة <span className="text-red-500">*</span>
              </label>
            </div>
            <Dropdown
              className="w-full"
              value={platform}
              onChange={onPlatformChange}
              options={USER_MENU_OPTIONS}
              placeholder={'اختر المنصة'}
              placeholderClassName="text-[#1F1F1F] !py-1 font-bold "
              selectClassName={`border-1 w-full  bg-[#EAEAEA40] p-1 rounded-sm ${errors?.platform
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#5D24E1]'
                }`}
            />
            {errors?.platform && (
              <p className="text-xs text-red-500 mt-1">{errors.platform}</p>
            )}
          </div>
          <div className="max-w-[502px]" data-field-error="pageName">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                اسم الصفحة <span className="text-red-500">*</span>
              </label>
            </div>
            <Dropdown
              className="w-full"
              value={pageName}
              onChange={onPageNameChange}
              options={USER_MENU_OPTIONS}
              placeholder={'اختر الصفحة'}
              placeholderClassName="text-[#1F1F1F] font-bold text-[20px]"
              selectClassName={`border-1 w-full  bg-[#EAEAEA40] p-1 rounded-sm ${errors?.pageName
                  ? 'border-red-500 focus:border-red-500'
                  : '!border-[#5D24E1]'
                }`}
            />
            {errors?.pageName && (
              <p className="text-xs text-red-500 mt-1">{errors.pageName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;
