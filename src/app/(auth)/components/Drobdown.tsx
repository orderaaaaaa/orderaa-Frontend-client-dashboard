'use client';

import { LucideIcon } from 'lucide-react';

interface ComboboxOption {
  key: string;
  value: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: ComboboxOption[];
  placeholder?: string;
  label?: string;
  icon?: LucideIcon;
}

export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'اختر',
  label,
  icon: Icon,
}: DropdownProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 font-medium text-[16px]">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 text-[18px] text-[#878A99] ${
            Icon ? 'pr-10' : '' // Add right padding when icon is present
          }`}
        >
          <option value="">{placeholder}</option>
          {Array.isArray(options) &&
            options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.value}
              </option>
            ))}
        </select>
        {Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
