'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';

const TABLET_QUERY = '(pointer: coarse) and (min-width: 768px)';

interface ScanInputProps {
  onSubmit: (code: string) => void;
  label?: string;
  placeholder?: string;
  isBusy?: boolean;
  disabled?: boolean;
  autoFocusOnTablet?: boolean;
  className?: string;
}

export function ScanInput({
  onSubmit,
  label = 'كود الطلب',
  placeholder = 'امسح الكود أو اكتبه ثم اضغط إضافة',
  isBusy = false,
  disabled = false,
  autoFocusOnTablet = true,
  className,
}: ScanInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!autoFocusOnTablet || disabled) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia(TABLET_QUERY).matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [autoFocusOnTablet, disabled]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = value.trim();
    if (!code || disabled) return;
    onSubmit(code);
    setValue('');
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <form
      role="search"
      aria-label="إضافة طلب بالكود"
      onSubmit={handleSubmit}
      className={clsx('flex items-end gap-2 w-full', className)}
    >
      <div className="flex-1 min-w-0">
        <label htmlFor={inputId} className="block font-medium text-sm mb-1.5 text-gray-700">
          {label}
        </label>
        <div className="relative">
          <ScanLine
            aria-hidden="true"
            className="absolute start-3 top-1/2 -translate-y-1/2 size-5 text-primary"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            inputMode="text"
            enterKeyHint="go"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-busy={isBusy}
            className="w-full h-11 border border-gray-200 rounded-lg ps-10 pe-10 text-base bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          {isBusy && (
            <span
              aria-hidden="true"
              className="absolute end-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
            />
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="h-11 sm:h-11 px-5 rounded-lg"
      >
        إضافة
      </Button>
    </form>
  );
}
