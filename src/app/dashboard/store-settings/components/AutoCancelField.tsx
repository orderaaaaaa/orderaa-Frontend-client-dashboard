import { LuCopyX } from 'react-icons/lu';
import Input from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface AutoCancelFieldProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function AutoCancelField({ register, errors }: AutoCancelFieldProps) {
  return (
    <div className="w-full max-w-full flex flex-col gap-4 min-w-0">
      <div className="w-full max-w-full flex items-start gap-2 min-w-0">
        <LuCopyX className="w-6 h-6 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">
            الالغاء التلقائي للطلب
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 break-words">
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
        className="!h-[46px] text-right w-full max-w-full !px-5"
      />
    </div>
  );
}
