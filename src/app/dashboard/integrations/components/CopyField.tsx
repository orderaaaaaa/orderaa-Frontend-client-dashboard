'use client';

import { useEffect, useRef, useState } from 'react';
import { LiaCheckSolid, LiaCopySolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COPIED_RESET_MS = 2000;
const COPY_FAILED_MESSAGE = 'تعذر النسخ، انسخ القيمة يدوياً';

interface CopyFieldProps {
  label: string;
  value: string;
  secret?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export default function CopyField({
  label,
  value,
  secret = false,
  placeholder,
  className,
  inputClassName,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      toast.error(COPY_FAILED_MESSAGE);
      return;
    }
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  const masked = secret && !revealed;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="block font-medium text-sm">{label}</span>
        <div className="flex items-center gap-2">
          {secret && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevealed((prev) => !prev)}
              disabled={!value}
              aria-pressed={revealed}
              className="h-10 sm:h-10 min-w-16 px-3 text-xs"
            >
              {revealed ? 'إخفاء' : 'إظهار'}
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            onClick={handleCopy}
            disabled={!value}
            className="h-10 sm:h-10 gap-1.5 px-3 text-xs"
          >
            {copied ? (
              <LiaCheckSolid className="w-4 h-4" />
            ) : (
              <LiaCopySolid className="w-4 h-4" />
            )}
            {copied ? 'تم النسخ' : 'نسخ'}
          </Button>
        </div>
      </div>
      <input
        type={masked ? 'password' : 'text'}
        value={value}
        placeholder={placeholder}
        readOnly
        dir="ltr"
        aria-label={label}
        autoComplete="off"
        className={cn(
          'w-full border border-gray-200 rounded-lg py-3 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary',
          secret && 'font-mono',
          inputClassName
        )}
      />
    </div>
  );
}
