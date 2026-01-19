import { UseFormRegister } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface LanguageSelectionFieldProps {
  register: UseFormRegister<OrderSettingsFormData>;
}

export function LanguageSelectionField({
  register,
}: LanguageSelectionFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm sm:text-base">A/ع</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
            لغة بوليصة الشحن
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            اختار اللغة التي تريد طباعه بوليصة الشحن بها
          </p>
        </div>
      </div>

      <div className="flex flex-row gap-6 sm:gap-8">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              value="ar"
              {...register('language')}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
            />
            <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span className="text-sm sm:text-base text-gray-700 font-medium group-hover:text-primary transition-colors">
            العربية
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              value="en"
              {...register('language')}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
            />
            <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
          </div>
          <span className="text-sm sm:text-base text-gray-700 font-medium group-hover:text-primary transition-colors">
            English
          </span>
        </label>
      </div>
    </div>
  );
}
