'use client';

import React, { useState } from 'react';
import Dropdown from '@/components/ui/Drobdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';

function OrderDetails() {
  const [userMenuValue, setUserMenuValue] = useState<string>('');

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <h1 className="font-bold text-[28px] mb-6">تفاصيل المنتج</h1>
        <div className="mb-5">
          <Dropdown
            label="اسم المنتج"
            value={userMenuValue}
            onChange={() => {}}
            options={USER_MENU_OPTIONS}
            placeholder={'ادخل اسم المنتج'}
            className="max-w-[931px] "
            selectClassName="border-2 w-full bg-[#EAEAEA40] p-2 rounded-sm mt-3"
          />
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
