'use client';

import { useState } from 'react';
import { LiaCheckSolid, LiaCopySolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

const COPIED_RESET_MS = 2000;

interface CopyableUrlFieldProps {
  label: string;
  value: string;
  inputClassName?: string;
}

export default function CopyableUrlField({
  label,
  value,
  inputClassName = 'text-sm bg-white',
}: CopyableUrlFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="block font-medium text-sm">{label}</span>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleCopy}
          disabled={!value}
          className="gap-1.5 h-7 text-xs"
        >
          {copied ? <LiaCheckSolid className="w-3 h-3" /> : <LiaCopySolid className="w-3 h-3" />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </Button>
      </div>
      <Input value={value} inputClassName={inputClassName} disabled />
    </div>
  );
}
