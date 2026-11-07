'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VariantIdentityProps {
  label: string;
  sku: string | null;
  breakSku?: boolean;
}

export function VariantIdentity({ label, sku, breakSku = false }: VariantIdentityProps) {
  return (
    <>
      <span className="block break-words text-foreground">{label}</span>
      {sku && (
        <span dir="ltr" className={cn('font-mono text-xs text-muted-foreground', breakSku && 'block break-all')}>
          {sku}
        </span>
      )}
    </>
  );
}

interface AdjustRowButtonProps {
  onClick(): void;
  className?: string;
}

export function AdjustRowButton({ onClick, className }: AdjustRowButtonProps) {
  return (
    <Button type="button" variant="outline" size="sm" className={className} onClick={onClick}>
      <SlidersHorizontal aria-hidden="true" />
      تسوية
    </Button>
  );
}
