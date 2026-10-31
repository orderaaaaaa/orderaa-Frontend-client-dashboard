'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  label?: string;
  successMessage?: string;
  className?: string;
}

export default function CopyButton({ value, label, successMessage, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(successMessage ?? 'تم نسخ الكود');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(successMessage ?? 'تم نسخ الكود');
      } catch {
        toast.error('فشل في نسخ الكود');
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ?? 'نسخ الكود'}
      className={cn('relative inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors max-sm:before:absolute max-sm:before:-inset-[13px] max-sm:before:content-[""]', className)}
    >
      <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-600' : ''}`} />
    </button>
  );
}
