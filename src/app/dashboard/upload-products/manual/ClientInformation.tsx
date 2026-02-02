'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { ClientInformationProps } from './types';

function ClientInformation({
  name,
  phoneNumber,
  address,
  notes,
  onNameChange,
  onPhoneNumberChange,
  onAddressChange,
  onNotesChange,
  errors,
}: ClientInformationProps) {
  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">معلومات العميل</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8">
          <div data-field-error="name">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                اسم العميل <span className="text-red-500">*</span>
              </label>
            </div>
            <Input
              name="name"
              type="text"
              placeholder="أدخل الاسم الكامل للعميل"
              className="max-w-[502px]"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              error={errors?.name}
            />
          </div>
          <div data-field-error="phoneNumber">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
            </div>
            <Input
              name="phoneNumber"
              type="text"
              placeholder="أدخل رقم الهاتف"
              className="max-w-[502px]"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              error={errors?.phoneNumber}
            />
          </div>
        </div>
        <div className="flex flex-col gap-10 mt-7">
          <div data-field-error="address">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                العنوان <span className="text-red-500">*</span>
              </label>
            </div>
            <Textarea
              name="address"
              placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
              className="max-w-[1158px] h-[162px] bg-[#EAEAEA40]"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              error={errors?.address}
            />
          </div>
          <div data-field-error="notes">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                ملاحظات العميل
              </label>
            </div>
            <Textarea
              name="notes"
              placeholder="ملاحظات إضافية (اختياري)"
              className="max-w-[1158px] h-[162px] bg-[#EAEAEA40] mb-10"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              error={errors?.notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientInformation;
