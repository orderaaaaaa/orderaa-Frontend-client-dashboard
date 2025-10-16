import React from 'react';
import { LucideIcon } from 'lucide-react';

type InputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register?: any;
  icon?: LucideIcon;
};

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  icon: Icon,
  ...rest
}: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium text-[16px] mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          className={`w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 text-[18px] ${
            Icon ? 'pr-10' : '' // Add right padding when icon is present
          }`}
          {...(register ? { ...register(name) } : {})}
          {...rest}
        />
        {Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
