import React, { useMemo, useCallback } from 'react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import Dropdown from '@/components/ui/Drobdown';

import { GOVERNORATES } from '@/constants/Eg-Governorates-Ar';
import { getAreasByGovernorate } from '@/constants/Eg-Areas-Ar';

type ClientInformationProps = {
  customerName: string;
  phoneNumber: string;
  governorate: string;
  area: string;
  address: string;
  notes: string;
  onCustomerNameChange: (v: string) => void;
  onPhoneNumberChange: (v: string) => void;
  onGovernorateChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  errors?: {
    customerName?: string;
    phoneNumber?: string;
    governorate?: string;
    area?: string;
    address?: string;
    notes?: string;
  };
};

function ClientInformation({
  customerName,
  phoneNumber,
  governorate,
  area,
  address,
  notes,
  onCustomerNameChange,
  onPhoneNumberChange,
  onGovernorateChange,
  onAreaChange,
  onAddressChange,
  onNotesChange,
  errors,
}: ClientInformationProps) {
  // Get areas based on selected governorate
  const areaOptions = useMemo(() => {
    if (!governorate) return [];
    return getAreasByGovernorate(governorate);
  }, [governorate]);

  // Handle governorate change - reset area when governorate changes
  const handleGovernorateChange = useCallback(
    (value: string) => {
      if (typeof onGovernorateChange === 'function') {
        onGovernorateChange(value);
      }
      // Reset area when governorate changes
      if (value !== governorate && typeof onAreaChange === 'function') {
        onAreaChange('');
      }
    },
    [governorate, onGovernorateChange, onAreaChange]
  );

  // Handle area change
  const handleAreaChange = useCallback(
    (value: string) => {
      if (typeof onAreaChange === 'function') {
        onAreaChange(value);
      }
    },
    [onAreaChange]
  );

  return (
    <div
      className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">معلومات العميل</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8">
          {/* username */}
          <div data-field-error="customerName">
            <Input
              label="اسم العميل"
              name="customerName"
              type="text"
              placeholder="أدخل الاسم الكامل للعميل"
              className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              error={errors?.customerName}
            />
          </div>
          {/*  phone */}
          <div data-field-error="phoneNumber">
            <Input
              label="رقم الهاتف"
              name="phoneNumber"
              type="text"
              placeholder="أدخل رقم الهاتف"
              className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              error={errors?.phoneNumber}
            />
          </div>
          {/* choose gov */}
          <div className="max-w-[502px]" data-field-error="governorate">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                اختر المحافظة <span className="text-red-500">*</span>
              </label>
            </div>
            <Dropdown
              className="w-full"
              options={GOVERNORATES}
              placeholderClassName="text-[#1F1F1F] !py-1 font-bold "
              selectClassName={`border-1 w-full  bg-[#EAEAEA40] px-3 py-3 rounded-sm ${
                errors?.governorate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#5D24E1]'
              }`}
              placeholder="اختر المحافظة"
              value={governorate}
              onChange={handleGovernorateChange}
            />
            {errors?.governorate && (
              <p className="text-xs text-red-500 mt-1">{errors.governorate}</p>
            )}
          </div>
          {/* choose area */}
          <div className="max-w-[502px]" data-field-error="area">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                منطقة <span className="text-red-500">*</span>
              </label>
            </div>
            <Dropdown
              className="w-full"
              options={areaOptions}
              placeholderClassName="text-[#1F1F1F] !py-1 font-bold "
              selectClassName={`border-1 w-full  bg-[#EAEAEA40] px-3 py-3 rounded-sm ${
                errors?.area
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#5D24E1]'
              }`}
              placeholder={governorate ? 'اختر المنطقة' : 'اختر المحافظة أولاً'}
              value={area}
              onChange={handleAreaChange}
            />
            {errors?.area && (
              <p className="text-xs text-red-500 mt-1">{errors.area}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-10 mt-7">
          <div data-field-error="address">
            <Textarea
              label="العنوان"
              name="address"
              placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
              className="max-w-[1158px] h-[162px] mt-3 bg-[#EAEAEA40] "
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              error={errors?.address}
              required
            />
          </div>
          <div data-field-error="notes">
            <Textarea
              label="ملاحظات العميل"
              name="notes"
              placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
              className="max-w-[1158px] h-[162px] mt-3 bg-[#EAEAEA40] mb-10"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              error={errors?.notes}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientInformation;
