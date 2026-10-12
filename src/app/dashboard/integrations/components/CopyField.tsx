'use client';

import { useEffect, useRef, useState } from 'react';
import { LiaCheckSolid, LiaCopySolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COPIED_RESET_MS = 2000;
const MASK = '••••••';
const TOKEN_PATTERN = /([?&]token=)([^&#]*)/;
const COPY_FAILED_MESSAGE = 'تعذر النسخ، انسخ القيمة يدوياً';

interface CopyFieldProps {
  label: string;
  value: string;
  secret?: boolean;
  maskToken?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export default function CopyField({
  label,
  value,
  secret = false,
  maskToken = false,
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

  const tokenMatch = maskToken && !secret ? TOKEN_PATTERN.exec(value) : null;
  const canMask = !!value && (secret || !!tokenMatch);
  const masked = canMask && !revealed;
  const tail = (raw: string) => (raw.length > 4 ? raw.slice(-4) : '');
  let displayValue = value;
  if (masked) {
    displayValue = tokenMatch
      ? value.replace(TOKEN_PATTERN, `$1${MASK}${tail(tokenMatch[2])}`)
      : `${MASK}${tail(value)}`;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="block font-medium text-sm">{label}</span>
        <div className="flex items-center gap-2">
          {canMask && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevealed((prev) => !prev)}
              aria-label={`${revealed ? 'إخفاء' : 'إظهار'} ${label}`}
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
        type="text"
        value={displayValue}
        placeholder={placeholder}
        readOnly
        dir="ltr"
        aria-label={label}
        autoComplete="off"
        className={cn(
          'w-full border border-gray-200 rounded-lg py-3 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary',
          canMask && 'font-mono',
          inputClassName
        )}
      />
    </div>
  );
}
