import { UseFormRegister } from 'react-hook-form';
import { OrderSettingsFormData } from '../schemas/store';

interface ToggleSwitchProps {
  name: keyof OrderSettingsFormData;
  checked: boolean;
  register: UseFormRegister<OrderSettingsFormData>;
}

export function ToggleSwitch({ name, checked, register }: ToggleSwitchProps) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        {...register(name)}
      />
      <div
        className="relative w-[66px] h-[30px] bg-gray-200 peer-focus:outline-none rounded-full 
                  peer peer-checked:after:translate-x-full peer-checked:after:border-white 
                  after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white 
                  after:border-gray-300 after:border after:rounded-full after:h-[30px] after:w-[30px] 
                  after:transition-all peer-checked:bg-primary 
                  rtl:peer-checked:after:-translate-x-full rtl:after:left-auto rtl:after:right-0
                  scale-75 md:scale-100 origin-right"
      />
    </label>
  );
}
