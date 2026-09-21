'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterOption } from '../types';

interface ScopeChipsProps {
  storeIds: string[];
  carrierKeys: string[];
  pageNames: string[];
  storeOptions?: FilterOption[];
  carrierOptions?: FilterOption[];
  pageOptions?: FilterOption[];
  onRemoveStore: (key: string) => void;
  onRemoveCarrier: (key: string) => void;
  onRemovePage: (key: string) => void;
  className?: string;
}

function labelFor(options: FilterOption[] | undefined, key: string): string {
  return options?.find((option) => option.key === key)?.label ?? key;
}

export function ScopeChips({
  storeIds,
  carrierKeys,
  pageNames,
  storeOptions,
  carrierOptions,
  pageOptions,
  onRemoveStore,
  onRemoveCarrier,
  onRemovePage,
  className,
}: ScopeChipsProps) {
  const entries: Array<{ key: string; label: string; onRemove: () => void }> = [
    ...storeIds.map((key) => ({ key: `store:${key}`, label: labelFor(storeOptions, key), onRemove: () => onRemoveStore(key) })),
    ...carrierKeys.map((key) => ({ key: `carrier:${key}`, label: labelFor(carrierOptions, key), onRemove: () => onRemoveCarrier(key) })),
    ...pageNames.map((key) => ({ key: `page:${key}`, label: labelFor(pageOptions, key), onRemove: () => onRemovePage(key) })),
  ];

  if (!entries.length) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {entries.map((entry) => (
        <span
          key={entry.key}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-text rounded-full px-3 py-1 text-xs"
        >
          {entry.label}
          <button
            type="button"
            onClick={entry.onRemove}
            aria-label={`إزالة ${entry.label}`}
            className="inline-flex items-center justify-center rounded-full hover:opacity-70"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}
