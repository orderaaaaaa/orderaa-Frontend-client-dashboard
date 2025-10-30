import React from 'react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';

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
  return (
    <div
      className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">معلومات العميل</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8">
          {/* username */}
          <Input
            label="اسم العميل"
            name="customerName"
            type="text"
            placeholder="أدخل الاسم الكامل للعميل"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            error={errors?.customerName}
            required
          />
          {/*  phone */}
          <Input
            label="رقم الهاتف"
            name="phoneNumber"
            type="text"
            placeholder="أدخل رقم الهاتف"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            error={errors?.phoneNumber}
            required
          />
          {/* choose gov */}
          <Input
            label="اختر المحافظة"
            name="governorate"
            type="text"
            placeholder="اختر المحافظة"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            value={governorate}
            onChange={(e) => onGovernorateChange(e.target.value)}
            error={errors?.governorate}
            required
          />
          {/* choose area */}
          <Input
            label="منطقة"
            name="area"
            type="text"
            placeholder="اختر المنطقة"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            value={area}
            onChange={(e) => onAreaChange(e.target.value)}
            error={errors?.area}
            required
          />
        </div>
        <div className="flex flex-col gap-10 mt-7">
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
  );
}

export default ClientInformation;
