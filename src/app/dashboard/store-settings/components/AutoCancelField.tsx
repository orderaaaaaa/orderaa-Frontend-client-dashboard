import { LiaBanSolid } from 'react-icons/lia';
import Input from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface AutoCancelFieldProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function AutoCancelField({ register, errors }: AutoCancelFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaBanSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            الالغاء التلقائي للطلب
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            الغاء الطلب تلقائي بعد كام محاوله؟
          </p>
        </div>
      </div>
      <Input
        name="autoCancelAttempts"
        register={register}
        registerOptions={{
          setValueAs: (v: any) => {
            if (v === '' || v === null || v === undefined) return undefined;
            const num = parseInt(v, 10);
            if (isNaN(num)) return undefined;
            return num < 0 ? 0 : num;
          },
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (value && parseInt(value) < 0) {
              e.target.value = '0';
            }
          },
        }}
        type="number"
        placeholder="مثال: 3"
        error={errors.autoCancelAttempts?.message}
        className="w-full max-w-sm"
      />
    </div>
  );
}
