import Input from '@/components/ui/Input';
import {
  LiaPhoneSolid,
  LiaBoxOpenSolid,
  LiaEditSolid,
  LiaRedoAltSolid,
  LiaPenSolid,
} from 'react-icons/lia';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import clsx from 'clsx';
import { OrderSettingsFormData } from '../schemas/store';
import { FormSwitch } from '@/components/ui/form-switch';
import { Separator } from '@/components/ui/separator';

interface ShippingSectionProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
  watch: UseFormWatch<OrderSettingsFormData>;
  setValue: UseFormSetValue<OrderSettingsFormData>;
}

export function ShippingSection({
  register,
  errors,
  watch,
  setValue,
}: ShippingSectionProps) {
  const canEditOrderValue = watch('employeeCanEditContent');

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Phone Number */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <LiaPhoneSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              رقم الهاتف
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              اضف رقم للمتابعه مع شركه الشحن
            </p>
          </div>
        </div>
        <Input
          name="shippingPhoneNumber"
          className="w-full max-w-sm"
          register={register}
          registerOptions={{
            setValueAs: (v: string) => (v === '' ? undefined : v),
          }}
          placeholder="01xxxxxxxxx"
          error={errors.shippingPhoneNumber?.message}
        />
      </div>

      <Separator />

      {/* Open Order */}
      <div className="flex items-start justify-between gap-4 relative">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <LiaBoxOpenSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              فتح الشحنة
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              هل تريد معاينه الشحنه من قبل العميل؟
            </p>
          </div>
        </div>
        <FormSwitch
          checked={!!watch('canOpenShipment')}
          onCheckedChange={(checked) => setValue('canOpenShipment', checked)}
        />
      </div>

      <Separator />

      {/* Edit Order */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <LiaEditSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                تعديل محتوي الشحنة
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                امكانيه تعديل محتوي الشحنه من قبل الموظف
              </p>
            </div>
          </div>
          <FormSwitch
            checked={!!watch('employeeCanEditContent')}
            onCheckedChange={(checked) => setValue('employeeCanEditContent', checked)}
          />
        </div>

        <div
          className={clsx(
            'transition-all duration-300 overflow-hidden',
            !canEditOrderValue ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <LiaPenSolid className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <span className="text-xs sm:text-sm text-gray-700">اسم المنتج</span>
          </div>
          <Input
            name="defaultShipmentContent"
            register={register}
            registerOptions={{
              setValueAs: (v: string) => (v === '' ? undefined : v),
            }}
            placeholder="أدخل اسم المنتج"
            error={errors.defaultShipmentContent?.message}
            className="w-full max-w-md"
          />
        </div>
      </div>

      <Separator />

      {/* Return Cost */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <LiaRedoAltSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              تكلفة مرتجع الشحن
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
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
          className="w-full max-w-sm"
          error={errors.defaultReturnShippingCost?.message}
        />
      </div>
    </div>
  );
}
