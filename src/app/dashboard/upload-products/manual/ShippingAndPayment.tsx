'use client';

import React, { useState } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import { USER_MENU_OPTIONS } from '@/constants/dashboard-layout';
import Input from '@/components/ui/Input';

function ShippingAndPayment() {
  const [includeShipping, setIncludeShipping] = useState<boolean>(false);
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [shipping, setShipping] = useState<boolean>(false);

  return (
    <div
      className="relative bg-gray-50 flex items-center justify-center px-6 py-8 max-sm:px-0"
      dir="rtl"
    >
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm max-sm:p-5 p-8">
        <div className="space-y-12">
          {/* ==================== Shipping Section ==================== */}
          <div className="border-b border-gray-100 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[19px] text-[#1F1F1F] font-semibold mb-2">
                  الشحن
                </h2>
                <p className="text-gray-500 text-[16px] max-sm:text-[15px]">
                  يمكنك تفعيل الشحن لهذا الطلب
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={shipping}
                  onChange={(e) => setShipping(e.target.checked)}
                />
                <div
                  className="relative w-[66px] h-[30px] bg-gray-200 peer-focus:outline-none rounded-full 
                                peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] 
                                after:transition-all peer-checked:bg-[#5D24E1] 
                                rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-0"
                />
              </label>
            </div>

            {/* Expandable Shipping Input */}
            <div
              className={`transition-all duration-300 ease-in-out  ${shipping ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
            >
              <p className="text-gray-500 max-sm:text-[14px] text-[17px] mb-1">
                أضف تكلفة الشحن إلى هذا الطلب
              </p>
              <Input
                name="shipping"
                type="number"
                placeholder="..10000"
                className="max-w-[502px] bg-[#EAEAEA40] mt-3"
                onChange={() => { }}
              />
            </div>
          </div>

          {/* ==================== Payment Section ==================== */}
          <div className="border-b border-gray-100 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[19px] text-[#1F1F1F] font-semibold mb-2">
                  طريقة الدفع
                </h2>
                <p className="text-gray-500 text-[16px] max-sm:text-[15px] mb-2">
                  اختر طريقة الدفع المناسبة للطلب
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
                <div
                  className="relative w-[66px] h-[30px] bg-gray-200 peer-focus:outline-none rounded-full 
                                peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] 
                                after:transition-all peer-checked:bg-[#5D24E1] 
                                rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-0"
                />
              </label>
            </div>

            {/* Dropdown (kept exactly as is) */}
            <div
              className={`transition-all duration-300 ease-in-out  ${includeShipping
                ? 'max-h-40 opacity-100 mt-4'
                : 'max-h-0 opacity-0'
                }`}
            >
              <Dropdown
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={USER_MENU_OPTIONS}
                placeholder="اختر طريقة الدفع"
                className="max-w-[921px]"
                selectClassName="border-2 border-[#5D24E1] w-full bg-[#EAEAEA40] p-2 rounded-sm  focus:!border-[#5D24E1] focus:ring-[1px] focus:!ring-[#5D24E1]/50"
              />
            </div>
          </div>

          {/* ==================== Confirmation Section ==================== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[19px] text-[#1F1F1F] font-semibold mb-2">
                  يحتاج إلى تأكيد
                </h2>
                <p className="text-gray-500 text-[16px] max-sm:text-[15px]">
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
                <div
                  className="relative w-[66px] h-[30px] bg-gray-200 peer-focus:outline-none rounded-full 
                                peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white 
                                after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] 
                                after:transition-all peer-checked:bg-[#5D24E1] 
                                rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-0"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingAndPayment;
