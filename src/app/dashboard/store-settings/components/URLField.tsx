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
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LiaLinkSolid className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            رابط المتجر
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            أدخل رابط متجرك الإلكتروني
          </p>
        </div>
      </div>
      <Input
        name="url"
        className="w-full max-w-sm"
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
