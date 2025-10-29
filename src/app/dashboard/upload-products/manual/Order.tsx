'use client';

import React, { useState } from 'react';
import Dropdown from '@/components/ui/Drobdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';

function Order() {
  const [userMenuValue, setUserMenuValue] = useState<string>('');
  return (
    <div
      className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">مصدر الطلب</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 max-sm:gap-6 mb-8">
          <Dropdown
            label="منصة"
            value={userMenuValue}
            onChange={() => {}}
            options={USER_MENU_OPTIONS}
            placeholder={'اختر المنصة'}
            className="max-w-[502px] "
            placeholderClassName="text-[#1F1F1F] !py-1 font-bold "
            selectClassName="border-1 w-full  bg-[#EAEAEA40] p-1 rounded-sm  border-[#5D24E1]"
          />
          <Dropdown
            label="اسم الصفحة"
            value={userMenuValue}
            onChange={() => {}}
            options={USER_MENU_OPTIONS}
            placeholder={'اختر الصفحة'}
            className="max-w-[502px]"
            placeholderClassName="text-[#1F1F1F] font-bold text-[20px]"
            selectClassName="border-1 w-full  bg-[#EAEAEA40] p-1 rounded-sm  !border-[#5D24E1]"
          />
        </div>
      </div>
    </div>
  );
}

export default Order;
