import React from 'react';

type InputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register?: any; // react-hook-form register
};

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  ...rest
}: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium text-[16px] mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        className="w-full border border-[#CED4DA] rounded-lg py-2.5 px-3 text-[18px]"
        {...(register ? { ...register(name) } : {})}
        {...rest}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
