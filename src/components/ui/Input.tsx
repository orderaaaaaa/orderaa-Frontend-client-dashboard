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
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  icon: Icon,
  className,
  value,
  onChange,
  onKeyDown,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Use px-10 for left and right padding if both icons could exist
  const inputClassName =
    `w-full border border-[#CED4DA] rounded-lg py-1.5 px-10 text-[18px] ${
      className ?? ''
    }`.trim();

  // Decide input type
  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <label htmlFor={name} className="block font-medium text-[16px] mb-1">
        {label}
      </label>
      <div className="relative">
        {/* Eye icon (for password) on the LEFT */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        <input
          type={inputType}
          id={name}
          name={name}
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          {...(register ? { ...register(name) } : {})}
          {...rest}
        />
        {/* Optional icon on the RIGHT */}
        {Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5d24e1]">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
