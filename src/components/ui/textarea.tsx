import * as React from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = {
  label?: string;
  name: string;
  placeholder?: string;
  error?: string;
  register?: any;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
} & React.ComponentProps<'textarea'>;

function Textarea({
  label,
  name,
  placeholder,
  error,
  register,
  className,
  value,
  onChange,
  ...props
}: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-[18px] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          data-slot="textarea"
          id={name}
          name={name}
          placeholder={placeholder}
          className={cn(
            ' border-1 text-[#5D24E1] placeholder:text-gray-400 border-[#5D24E1] focus:!border-[#5D24E1] focus:!ring-[#5D24E1]/50   focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md  bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          value={value}
          onChange={onChange}
          {...(register ? { ...register(name) } : {})}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export { Textarea };
