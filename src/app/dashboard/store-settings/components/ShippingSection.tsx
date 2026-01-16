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
      <div className="w-full max-w-full flex flex-col gap-4 min-w-0">
        <div className="w-full max-w-full flex items-start gap-2 min-w-0">
          <LiaPhoneSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">رقم الهاتف</h3>
            <p className="text-xs sm:text-sm text-gray-500 break-words">
              اضف رقم للمتابعه مع شركه الشحن
            </p>
          </div>
        </div>
        <Input
          name="shippingPhoneNumber"
          className="!px-5 w-full max-w-full"
          register={register}
          registerOptions={{
            setValueAs: (v: string) => (v === '' ? undefined : v),
          }}
          placeholder="01xxxxxxxxx"
          error={errors.shippingPhoneNumber?.message}
        />
      </div>

      {/* Open Order */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-6 gap-2 min-w-0 max-w-full">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          <LiaBoxOpenSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">فتح الشحنة</h3>
            <p className="text-xs sm:text-sm text-gray-500 break-words">
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
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 min-w-0 max-w-full">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            <LiaEditSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">
                تعديل محتوي الشحنة
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 break-words">
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
          className={`transition-all duration-300 overflow-hidden w-full max-w-full min-w-0 ${
            !canEditOrderValue
              ? 'max-h-40 opacity-100 mt-2'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 min-w-0">
            <LiaPenSolid className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm sm:text-base break-words">اسم المنتج</span>
          </div>
          <Input
            name="defaultShipmentContent"
            register={register}
            registerOptions={{
              setValueAs: (v: string) => (v === '' ? undefined : v),
            }}
            placeholder="أدخل اسم المنتج"
            error={errors.defaultShipmentContent?.message}
            className="!h-[55px] text-right w-full max-w-full !px-5"
          />
        </div>
      </div>

      {/* Return Cost */}
      <div className="w-full max-w-full flex flex-col gap-4 border-b border-gray-100 pb-6 min-w-0">
        <div className="w-full max-w-full flex items-start gap-2 min-w-0">
          <LiaRedoAltSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">
              تكلفة مرتجع الشحن
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 break-words">
              في حاله رفض العميل استلام الشحنة يتم دفع مبلغ.
            </p>
          </div>
        </div>
        <Input
          name="defaultReturnShippingCost"
          register={register}
          registerOptions={{
            setValueAs: (v: any) => {
              if (v === '' || v === null || v === undefined) return undefined;
              const num = parseFloat(v);
              if (isNaN(num)) return undefined;
              return num;
            },
          }}
          type="number"
          step="0.01"
          placeholder="0.00"
          className="!h-[46px] text-right w-full max-w-full !px-5"
          error={errors.defaultReturnShippingCost?.message}
        />
      </div>
    </>
  );
}
