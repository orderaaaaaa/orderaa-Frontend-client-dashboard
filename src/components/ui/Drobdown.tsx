'use client';

import React from 'react';
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
  className?: string; // wrapper class (container)
  selectClassName?: string; // optional classes applied directly to the <select>
  placeholderClassName?: string; // optional class applied when showing placeholder (value is empty)
  placeholderStyle?: React.CSSProperties; // optional inline style when showing placeholder
}

export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'اختر',
  label,
  icon: Icon,
  className,
  selectClassName,
  placeholderClassName,
  placeholderStyle,
}: DropdownProps) {
  // Default select base classes if no selectClassName provided
  const defaultSelectBase = `w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 text-[18px] ${
    Icon ? 'pr-10' : ''
  }`;

  const base = selectClassName ? selectClassName : defaultSelectBase;

  // If value is empty use placeholderClassName (or fallback color)
  const computedSelectClass = `${base} ${
    value ? 'text-[#111827]' : placeholderClassName ?? 'text-[#878A99]'
  }`;

  return (
    <div className={className ? className : 'w-full'}>
      {label && (
        <label className="block mb-1 font-medium text-[16px]">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={computedSelectClass}
          // only apply inline style when showing placeholder (value is empty)
          style={!value && placeholderStyle ? placeholderStyle : undefined}
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
