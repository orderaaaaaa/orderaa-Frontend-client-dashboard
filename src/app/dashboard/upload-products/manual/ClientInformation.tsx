'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { ClientInformationProps } from './types';
import { LiaPlusSolid, LiaTrashSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

function ClientInformation({
  name,
  phoneNumbers,
  address,
  notes,
  onNameChange,
  onPhoneNumbersChange,
  onAddressChange,
  onNotesChange,
  errors,
}: ClientInformationProps) {
  const handlePhoneChange = (index: number, value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = value;
    onPhoneNumbersChange(updated);
  };

  const handleAddPhone = () => {
    onPhoneNumbersChange([...phoneNumbers, '']);
  };

  const handleRemovePhone = (index: number) => {
    if (phoneNumbers.length > 1) {
      const updated = phoneNumbers.filter((_, i) => i !== index);
      onPhoneNumbersChange(updated);
    }
  };

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
          <div data-field-error="phoneNumbers">
            <div className="mb-1 flex items-center justify-between">
              <label className="block font-medium text-[16px]">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              {phoneNumbers.length < 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddPhone}
                  className="flex items-center gap-1 text-primary hover:text-[#4B1BC4] hover:bg-purple-50 px-2 py-1 h-auto"
                >
                  <LiaPlusSolid className="w-4 h-4" />
                  <span className="text-sm font-medium">إضافة رقم</span>
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {phoneNumbers.map((phone, index) => (
                <div key={index} className="flex items-center gap-2 relative">
                  <Input
                    name={`phoneNumber-${index}`}
                    type="text"
                    placeholder="أدخل رقم الهاتف"
                    className="max-w-[502px] flex-1"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    error={index === 0 ? errors?.phoneNumbers : undefined}
                  />
                  {phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePhone(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9 shrink-0"
                    >
                      <LiaTrashSolid className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
