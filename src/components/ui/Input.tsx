import React, { useState } from 'react';
import clsx from 'clsx';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

type InputProps = {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register?: any;
  registerOptions?: any;
  icon?: LucideIcon;
  className?: string;
  inputClassName?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autoFocus?: boolean;
  id?: string;
};

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  registerOptions,
  icon: Icon,
  className,
  inputClassName: customInputClassName,
  value,
  onChange,
  onKeyDown,
  disabled,
  min,
  max,
  step,
  autoFocus,
  id,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasIcon = Icon || type === 'password';
  const inputClassName = clsx(
    'w-full border border-gray-200 rounded-lg py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed',
    hasIcon ? 'px-10' : 'px-4',
    customInputClassName
  );

  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const inputId = id || name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block font-medium text-base mb-2">
          {label}
        </label>
      )}
      <div className="relative">
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
          id={inputId}
          name={name}
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          {...(register ? { ...register(name, registerOptions) } : {})}
          {...rest}
        />
        {Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
