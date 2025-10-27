'use client';

import React, { useState } from 'react';
import Dropdown from '@/components/ui/Drobdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';

function ShippingAndPayment() {
  const [includeShipping, setIncludeShipping] = useState<boolean>(false);
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <h1 className="font-bold text-[26px] mb-6">الشحن والدفع</h1>

        <div className="space-y-8">
          {/* === Include Shipping Cost Section === */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-[25px] text-[#1F1F1F] mb-5">
                  بما في ذلك تكلفة الشحن
                </h2>
                <p className="text-gray-500 text-[22px]">
                  أضف تكلفة الشحن إلى هذا الطلب
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={includeShipping}
                  onChange={(e) => setIncludeShipping(e.target.checked)}
                />
                <div className="relative w-[80px] h-[37px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[37px] after:w-[37px] after:transition-all peer-checked:bg-[#5D24E1] rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-[4px]"></div>
              </label>
            </div>

            {/* Shipping Payment Dropdown */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                includeShipping
                  ? 'max-h-40 opacity-100 mt-4'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <Dropdown
                label="طريقة الدفع"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={USER_MENU_OPTIONS}
                placeholder="اختر طريقة الدفع"
                className="max-w-[921px]"
                selectClassName="border-2 w-full bg-[#EAEAEA40] p-2 rounded-sm mt-3"
              />
            </div>
          </div>

          {/* === Needs Confirmation Section (Boolean Only) === */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="font-bold text-[26px] text-[#1F1F1F] mb-5">
                  يحتاج إلى تأكيد
                </h2>
                <p className="text-gray-500 text-[22px]">
                  تتطلب هذه الطلبية تأكيدًا قبل المعالجة
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={needsConfirmation}
                  onChange={(e) => setNeedsConfirmation(e.target.checked)}
                />
                <div className="relative w-[80px] h-[37px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-auto after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[37px] after:w-[37px] after:transition-all peer-checked:bg-[#5D24E1] rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-[4px]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingAndPayment;
