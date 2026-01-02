'use client';

import * as React from 'react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon, Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/utils/debounce';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string; 
  noResultsMessage?: string; 
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  searchThreshold?: number;
  debounceMs?: number;
  onOpenChange?: (open: boolean) => void; 
  clearable?: boolean; // Show clear button when value is selected
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = 'اختر...',
  searchPlaceholder = 'بحث...',
  emptyMessage = 'لا توجد خيارات متاحة',
  noResultsMessage = 'لا توجد نتائج للبحث',
  className,
  triggerClassName,
  disabled = false,
  loading = false,
  searchThreshold = 5,
  debounceMs = 300,
  onOpenChange,
  clearable = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  }, [onOpenChange]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  const hasOptions = options.length > 0;
  const showSearch = options.length > searchThreshold;

  const filteredOptions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return options;
    }
    const query = debouncedSearchQuery.toLowerCase().trim();
    return options.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }, [options, debouncedSearchQuery]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onValueChange(selectedValue);
      handleOpenChange(false);
      setSearchQuery('');
    },
    [onValueChange, handleOpenChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange('');
    },
    [onValueChange]
  );

  useEffect(() => {
    if (open && showSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open, showSearch]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const getEmptyStateMessage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-6 text-base text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>جاري التحميل...</span>
        </div>
      );
    }
    if (!hasOptions) {
      return (
        <div className="py-6 text-center text-base text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }
    if (filteredOptions.length === 0 && debouncedSearchQuery.trim()) {
      return (
        <div className="py-6 text-center text-base text-muted-foreground">
          {noResultsMessage}
        </div>
      );
    }
    return null;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || loading}
          className={cn(
            'cursor-pointer flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&>span]:line-clamp-1',
            triggerClassName
          )}
        >
          <span className={cn(!value && 'text-muted-foreground')}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحميل...
              </span>
            ) : (
              value || placeholder
            )}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {clearable && value && !disabled && !loading && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </span>
            )}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[var(--radix-popover-trigger-width)] p-0', className)}
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {showSearch && (
            <div className="flex items-center border-b px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {getEmptyStateMessage() || (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'relative flex w-full cursor-pointer items-center rounded-sm py-2 pr-8 pl-2 text-base outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    value === option && 'bg-accent'
                  )}
                >
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    {value === option && <CheckIcon className="h-4 w-4" />}
                  </span>
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
