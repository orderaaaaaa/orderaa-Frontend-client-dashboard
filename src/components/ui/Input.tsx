import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { LucideIcon, Eye, EyeOff, X } from 'lucide-react';
import { Button } from './button';

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
  onClear?: () => void;
  clearable?: boolean;
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
  onClear,
  clearable = false,
  disabled,
  min,
  max,
  step,
  autoFocus,
  id,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value !== undefined && value !== '';
  const showClearButton = clearable && hasValue && !disabled;
  const hasRightIcon = Icon;
  const hasLeftIcon = type === 'password' || showClearButton;

  const inputClassName = clsx(
    'w-full border rounded-lg py-3 text-base focus:outline-none !bg-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
    error ? 'border-red-500' : 'border-gray-200',
    hasRightIcon ? 'pr-10' : 'pr-4',
    hasLeftIcon ? 'pl-10' : 'pl-4',
    customInputClassName
  );

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange && inputRef.current) {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    inputRef.current?.focus();
  };

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
        {showClearButton && type !== 'password' && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            <X size={18} />
          </Button>
        )}
        <input
          ref={inputRef}
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
