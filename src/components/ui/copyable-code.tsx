import type { ReactNode } from 'react';
import CopyButton from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

interface CopyableCodeProps {
  children: ReactNode;
  value: string | null | undefined;
  label: string;
  className?: string;
}

export default function CopyableCode({ children, value, label, className }: CopyableCodeProps) {
  if (!value || value === '—') return <>{children}</>;
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {children}
      <CopyButton value={value} label={`${label} ${value}`} className="relative z-[2] p-1.5" />
    </span>
  );
}
