import Input from '@/components/ui/Input';
import {
  LiaPhoneSolid,
  LiaBoxOpenSolid,
  LiaEditSolid,
  LiaRedoAltSolid,
  LiaPenSolid,
} from 'react-icons/lia';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';
import { ToggleSwitch } from './ToggleSwitch';

interface ShippingSectionProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  watch: UseFormWatch<OrderSettingsFormData>;
}

export function ShippingSection({
  register,
  errors,
  watch,
}: ShippingSectionProps) {
  const canEditOrderValue = watch('employeeCanEditContent');

  return (
    <>
      {/* Phone Number */}
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex items-start gap-2">
          <LiaPhoneSolid className="w-6 h-6 text-primary mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold leading-tight">رقم الهاتف</h3>
            <p className="text-sm text-gray-500">
              اضف رقم للمتابعه مع شركه الشحن
            </p>
          </div>
        </div>
        <Input
          name="shippingPhoneNumber"
          className="!px-5"
          register={register}
          registerOptions={{
            setValueAs: (v: string) => (v === '' ? undefined : v),
          }}
          placeholder="01xxxxxxxxx"
          error={errors.shippingPhoneNumber?.message}
        />
      </div>

      {/* Open Order */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-6">
        <div className="flex items-start gap-3">
          <LiaBoxOpenSolid className="w-6 h-6 text-primary mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold leading-tight">فتح الشحنة</h3>
            <p className="text-sm text-gray-500">
              هل تريد معاينه الشحنه من قبل العميل؟
            </p>
          </div>
        </div>
        <ToggleSwitch
          name="canOpenShipment"
          checked={!!watch('canOpenShipment')}
          register={register}
        />
      </div>

      {/* Edit Order */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <LiaEditSolid className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold leading-tight">
                تعديل محتوي الشحنة
              </h3>
              <p className="text-sm text-gray-500">
                امكانيه تعديل محتوي الشحنه من قبل الموظف
              </p>
            </div>
          </div>
          <ToggleSwitch
            name="employeeCanEditContent"
            checked={!!watch('employeeCanEditContent')}
            register={register}
          />
        </div>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            canEditOrderValue
              ? 'max-h-40 opacity-100 mt-2'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <LiaPenSolid className="w-5 h-5 text-primary" />
            <span className="text-base">اسم المنتج</span>
          </div>
          <Input
            name="defaultShipmentContent"
            register={register}
            placeholder="أدخل اسم المنتج"
            error={errors.defaultShipmentContent?.message}
            className="!h-[46px] bg-[#EAEAEA40] text-right w-full !px-5"
          />
        </div>
      </div>

      {/* Return Cost */}
      <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
        <div className="w-full flex items-start gap-2">
          <LiaRedoAltSolid className="w-6 h-6 text-primary mt-0.5" />
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
          name="defaultReturnShippingCost"
          register={register}
          type="text"
          placeholder="0.00"
          className="!h-[46px] bg-[#EAEAEA40] text-right w-full !px-5"
        />
      </div>
    </>
  );
}
