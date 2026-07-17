import React, { useState, useRef, forwardRef } from 'react';
import clsx from 'clsx';
import { LucideIcon, Eye, EyeOff, X } from 'lucide-react';
import { Controller, type Control } from 'react-hook-form';
import { Button } from './button';

type InputProps = {
  label?: string;
  required?: boolean;
  name?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register?: any;
  registerOptions?: any;
  control?: Control<any>;
  icon?: LucideIcon;
  className?: string;
  inputClassName?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  clearable?: boolean;
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  autoFocus?: boolean;
  id?: string;
};

type InputCoreProps = Omit<InputProps, 'control'>;

const InputCore = forwardRef<HTMLInputElement, InputCoreProps>(function InputCore(
  {
    label,
    required = false,
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
    onBlur,
    onFocus,
    onClear,
    clearable = false,
    disabled,
    min,
    max,
    step,
    autoFocus,
    id,
    ...rest
  },
  forwardedRef,
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setInputRef = (node: HTMLInputElement | null) => {
    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const hasValue = value !== undefined && value !== '';
  const showClearButton = clearable && hasValue && !disabled;
  const hasRightIcon = Icon;
  const hasLeftIcon = type === 'password' || showClearButton;

  const inputClassName = clsx(
    'w-full border rounded-lg py-3 text-base focus:outline-none bg-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
    error ? 'border-red-500' : 'border-gray-200',
    hasRightIcon ? 'ps-8' : 'ps-4',
    hasLeftIcon ? 'pe-8' : 'pe-4',
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
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {type === 'password' && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
        )}
        {showClearButton && type !== 'password' && (
          <Button
            variant="ghost"
            onClick={handleClear}
            className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            tabIndex={-1}
          >
            <X size={18} />
          </Button>
        )}
        <input
          ref={setInputRef}
          type={inputType}
          id={inputId}
          name={name}
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
          {...(register ? { ...register(name, registerOptions) } : {})}
          {...rest}
        />
        {Icon && (
          <div className="absolute start-3 top-1/2 transform -translate-y-1/2 text-primary">
            <Icon size={20} />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

InputCore.displayName = 'InputCore';

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const { control, name, error, onKeyDown, ...rest } = props;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <InputCore
            {...rest}
            name={field.name}
            value={(field.value ?? '') as string | number}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            onKeyDown={onKeyDown}
            error={error ?? fieldState.error?.message}
            ref={(node) => {
              field.ref(node);
              if (typeof ref === 'function') ref(node);
              else if (ref)
                (ref as React.MutableRefObject<HTMLInputElement | null>).current =
                  node;
            }}
          />
        )}
      />
    );
  }

  return <InputCore {...rest} name={name} error={error} onKeyDown={onKeyDown} ref={ref} />;
});

Input.displayName = 'Input';

export default Input;
