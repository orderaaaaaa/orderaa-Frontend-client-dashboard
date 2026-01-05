import { CopyX } from 'lucide-react';
import Input from '@/components/ui/Input';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface AutoCancelFieldProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function AutoCancelField({ register, errors }: AutoCancelFieldProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex items-start gap-2">
        <CopyX className="w-6 h-6 text-primary mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold leading-tight">
            الالغاء التلقائي للطلب
          </h3>
          <p className="text-sm text-gray-500">
            الغاء الطلب تلقائي بعد كام محاوله؟
          </p>
        </div>
      </div>
      <Input
        name="autoCancelAttempts"
        register={register}
        registerOptions={{
          valueAsNumber: true,
          setValueAs: (v: any) => (v === '' ? undefined : parseInt(v, 10)),
        }}
        type="number"
        placeholder="مثال: 3"
        error={errors.autoCancelAttempts?.message}
        className="!h-[46px] bg-[#EAEAEA40] text-right w-full !px-5"
      />
    </div>
  );
}
