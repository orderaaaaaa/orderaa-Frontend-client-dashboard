import React from 'react';
import Input from '@/components/ui/Input';
import {
  Phone,
  PackageOpen,
  Edit3,
  FilePenLine,
  RotateCcw,
  CopyX,
} from 'lucide-react';

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface Props {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
}

export default function OrderSettingsFields({
  register,
  errors,
  watch,
}: Props) {
  const canEditOrder = watch('canEditOrder');

  const ToggleSwitch = ({
    name,
    checked,
  }: {
    name: keyof OrderSettingsFormData;
    checked: boolean;
  }) => (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        {...register(name)}
      />
      <div
        className="relative w-[66px] h-[30px] bg-gray-200 peer-focus:outline-none rounded-full 
                  peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] 
                  after:transition-all peer-checked:bg-[#5D24E1] 
                  rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-0
                  scale-75 md:scale-100 origin-right"
      />
    </label>
  );

  return (
    <div className="px-4 md:px-10 py-6 md:py-[34px]" dir="rtl">
      <div className="flex lg:w-2/3 flex-col gap-8">
        {/* حقل رقم الهاتف */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-start gap-2">
            <Phone className="w-6 h-6 text-[#5D24E1] mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                رقم الهاتف
              </h3>
              <p className="text-sm text-gray-500">
                اضف رقم للمتابعه مع شركه الشحن
              </p>
            </div>
          </div>
          <Input
            name="phoneNumber"
            register={register}
            placeholder="01xxxxxxxxx"
            error={errors.phoneNumber?.message}
            className="!h-[46px] bg-[#EAEAEA40] text-right w-full"
          />
        </div>

        {/* حقل فتح الشحنة */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-6">
          <div className="flex items-start gap-3">
            <PackageOpen className="w-6 h-6 text-[#5D24E1] mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                فتح الشحنة
              </h3>
              <p className="text-sm text-gray-500">
                هل تريد معاينه الشحنه من قبل العميل؟
              </p>
            </div>
          </div>
          <ToggleSwitch name="canOpenOrder" checked={watch('canOpenOrder')} />
        </div>

        {/* حقل تعديل محتوى الشحنة */}
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Edit3 className="w-6 h-6 text-[#5D24E1] mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold leading-tight">
                  تعديل محتوي الشحنة
                </h3>
                <p className="text-sm text-gray-500">
                  امكانيه تعديل محتوي الشحنه من قبل الموظف
                </p>
              </div>
            </div>
            <ToggleSwitch name="canEditOrder" checked={canEditOrder} />
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              !canEditOrder ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FilePenLine className="w-5 h-5 text-[#5D24E1]" />
              <span className="text-base">اسم المنتج</span>
            </div>
            <Input
              name="category"
              register={register}
              placeholder="أدخل اسم المنتج"
              error={errors.category?.message}
              className="!h-[46px] bg-[#EAEAEA40] text-right w-full"
            />
          </div>
        </div>

        {/* حقل تكلفة مرتجع الشحن */}
        <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
          <div className="w-full flex items-start gap-2">
            <RotateCcw className="w-6 h-6 text-[#5D24E1] mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                تكلفة مرتجع الشحن
              </h3>
              <p className="text-sm text-gray-500">
                في حاله رفض العميل استلام الشحنة يتم دفع مبلغ.
              </p>
            </div>
          </div>
          <Input
            name="returnShippingCost"
            register={register}
            type="number"
            placeholder="0.00"
            className="!h-[46px] bg-[#EAEAEA40] text-right w-full"
          />
        </div>

        {/* الحقل الجديد: عدد المرات المتبقية لإلغاء الطلب */}
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex items-start gap-2">
            <CopyX className="w-6 h-6 text-[#5D24E1] mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                الالغاء التلقائي للطلب{' '}
              </h3>
              <p className="text-sm text-gray-500">
                الغاء الطلب تلقائي بعد كام محاوله؟
              </p>
            </div>
          </div>
          <Input
            name="autoCancelAttempts"
            register={register}
            type="number"
            placeholder="مثال: 3"
            className="!h-[46px] bg-[#EAEAEA40] text-right w-full"
          />
        </div>
      </div>
    </div>
  );
}
