import React from 'react';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';

function ClientInformation() {
  return (
    <div className="bg-gray-50 px-6 flex items-center justify-center" dir="rtl">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-2 p-8 shadow-sm">
        <h1 className="font-bold text-[28px] mb-6">معلومات العميل</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8">
          {/* username */}
          <Input
            label="اسم العميل"
            name=""
            type="text"
            placeholder="أدخل الاسم الكامل للعميل"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            //   value=
            onChange={() => {}}
          />
          {/*  phone */}
          <Input
            label="رقم الهاتف"
            name=""
            type="text"
            placeholder="أدخل رقم الهاتف"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            //   value=
            onChange={() => {}}
          />
          {/* choose gov */}
          <Input
            label="اختر المحافظة"
            name=""
            type="text"
            placeholder="اختر المحافظة"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            //   value=
            onChange={() => {}}
          />
          {/* choose area */}
          <Input
            label="منطقة"
            name=""
            type="text"
            placeholder="اختر المنطقة"
            className="max-w-[502px] mt-3 bg-[#EAEAEA40]"
            //   value=
            onChange={() => {}}
          />
        </div>
        <div className="flex flex-col gap-10 mt-7">
          <Textarea
            label="اختر المحافظه"
            name=""
            placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
            className="max-w-[1158px] h-[162px] mt-3 bg-[#EAEAEA40]"
            //   value=
            onChange={() => {}}
          />
          <Textarea
            label="اختر المحافظه"
            name=""
            placeholder="اسم الشارع، رقم المبنى، الشقة، إلخ"
            className="max-w-[1158px] h-[162px] mt-3 bg-[#EAEAEA40] mb-10"
            //   value=
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default ClientInformation;
