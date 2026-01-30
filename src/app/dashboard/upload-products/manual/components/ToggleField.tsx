'use client';

import { FormSwitch } from '@/components/ui/form-switch';

type ToggleFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export default function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-[19px] text-[#1F1F1F] font-semibold mb-2">
          {label}
        </h2>
        <p className="text-gray-500 text-[16px] max-sm:text-[15px]">
          {description}
        </p>
      </div>
      <FormSwitch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
