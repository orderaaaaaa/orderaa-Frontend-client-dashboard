'use client';

import { Scan, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectModeControlsProps {
  active: boolean;
  selectedCount: number;
  countLabel: string;
  onToggle: () => void;
  onClear: () => void;
}

export default function SelectModeControls({
  active,
  selectedCount,
  countLabel,
  onToggle,
  onClear,
}: SelectModeControlsProps) {
  const hasSelection = active && selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        {hasSelection && (
          <Button
            type="button"
            variant="ghost"
            size="touch"
            aria-label="إلغاء التحديد"
            onClick={onClear}
          >
            <X className="text-primary h-5 w-5" />
          </Button>
        )}
        <span className="text-sm text-gray-600 whitespace-nowrap empty:hidden" aria-live="polite">
          {hasSelection ? `تم تحديد ${selectedCount} ${countLabel}` : ''}
        </span>
      </div>
      <Button
        type="button"
        variant="default"
        aria-pressed={active}
        onClick={onToggle}
        className="h-10 rounded-full font-semibold flex items-center gap-2 px-5"
      >
        تحديد
        {active ? <ScanLine className="w-5 h-5" /> : <Scan className="w-5 h-5" />}
      </Button>
    </div>
  );
}
