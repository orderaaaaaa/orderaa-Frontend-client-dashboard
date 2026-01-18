import Input from '@/components/ui/Input';
import { LiaLinkSolid } from 'react-icons/lia';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface URLFieldProps {
  register: UseFormRegister<OrderSettingsFormData>;
  errors: FieldErrors<OrderSettingsFormData>;
}

export function URLField({ register, errors }: URLFieldProps) {
  return (
    <div className="w-full max-w-full flex flex-col gap-4 min-w-0">
      <div className="w-full max-w-full flex items-start gap-2 min-w-0">
        <LiaLinkSolid className="w-6 h-6 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">
            رابط المتجر
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            أدخل رابط متجرك الإلكتروني
          </p>
        </div>
      </div>
      <Input
        name="url"
        className="!px-5 w-full max-w-full"
        register={register}
        registerOptions={{
          setValueAs: (v: string) => (v === '' ? undefined : v),
        }}
        placeholder="https://example.com"
        error={errors.url?.message}
      />
    </div>
  );
}
