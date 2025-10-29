import React, { useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

type InputProps = {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register?: any;
  icon?: LucideIcon;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  icon: Icon,
  className = '',
  value,
  onChange,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine the correct input type (for password visibility toggle)
  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block font-medium text-[16px] mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* 👁 Password toggle (left side) */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* 🟣 Main Input */}
        <input
          type={inputType}
          id={name}
          name={name}
          placeholder={placeholder}
          className={`w-full rounded-lg py-2.5 px-10 text-[18px] 
            border-[0.5px] border-[#5D24E1] bg-[#EAEAEA40] 
            focus:border-[#5D24E1] focus:ring-[3px] focus:ring-[#5D24E1]/50 
            outline-none transition duration-150 ease-in-out 
            disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          value={value}
          onChange={onChange}
          {...(register ? register(name) : {})}
          {...rest}
        />

        {/* Optional right-side icon */}
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
