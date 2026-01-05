import { UseFormRegister } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface LanguageSelectionFieldProps {
  register: UseFormRegister<OrderSettingsFormData>;
}

export function LanguageSelectionField({
  register,
}: LanguageSelectionFieldProps) {
  return (
    <div className="w-full flex flex-col gap-4 border-b border-gray-100 pb-6">
      <div className="w-full flex items-start gap-2">
        <div className="w-6 h-6 flex items-center justify-center">
          <span className="text-primary font-bold">A/ع</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-tight">
            لغة بوليصة الشحن
          </h3>
          <p className="text-sm text-gray-500">
            اختار اللغة التي تريد طباعه بوليصة الشحن بها{' '}
          </p>
        </div>
      </div>

      <div className="flex flex-row gap-6 mt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              value="ar"
              {...register('language')}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
            />
            <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">
            العربية
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              value="en"
              {...register('language')}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
            />
            <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">
            English
          </span>
        </label>
      </div>
    </div>
  );
}
