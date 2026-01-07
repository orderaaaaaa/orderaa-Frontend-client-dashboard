'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/utils/debounce';

type OptionObject = { key: string; value?: string; label?: string };
type OptionType = string | OptionObject;

interface SearchableSelectProps {
  value?: string;
  onChange?: (v: string) => void;
  onValueChange?: (v: string) => void;
  onBlur?: () => void;
  options: OptionType[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  widthClass?: string;
  className?: string;
  triggerClassName?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  loading?: boolean;
  displayValue?: string;
  searchThreshold?: number;
  debounceMs?: number;
  clearable?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SearchableSelect = forwardRef<HTMLDivElement, SearchableSelectProps>(
  function SearchableSelect(
    {
      value = '',
      onChange,
      onValueChange,
      onBlur,
      options = [],
      placeholder = 'اختر...',
      searchPlaceholder = 'بحث...',
      emptyMessage = 'لا توجد خيارات متاحة',
      noResultsMessage = 'لا توجد نتائج',
      widthClass = 'w-full',
      className,
      triggerClassName,
      error,
      name,
      disabled = false,
      loading = false,
      displayValue,
      searchThreshold = 5,
      debounceMs = 300,
      clearable = false,
      onOpenChange,
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState<number>(-1);
    const internalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(searchQuery, debounceMs);

    const handleChange = useCallback(
      (v: string) => {
        onChange?.(v);
        onValueChange?.(v);
      },
      [onChange, onValueChange]
    );

    const handleOpenChange = useCallback(
      (isOpen: boolean) => {
        setOpen(isOpen);
        onOpenChange?.(isOpen);
      },
      [onOpenChange]
    );

    const isObjectOptions = useMemo(() => {
      return options.length > 0 && typeof options[0] === 'object';
    }, [options]);

    const getDisplayText = (opt: OptionType): string => {
      if (typeof opt === 'string') return opt;
      return opt.value || opt.label || '';
    };

    const getOptionKey = (opt: OptionType): string => {
      if (typeof opt === 'string') return opt;
      return opt.key;
    };

    const showSearch = options.length > searchThreshold;

    const filtered = useMemo(() => {
      const query = debouncedQuery.toLowerCase().trim();
      return (options || []).filter((o) => {
        if (!o) return false;
        const text = getDisplayText(o);
        if (!query) return true;
        return text && text.toLowerCase().includes(query);
      });
    }, [options, debouncedQuery]);

    const currentDisplayValue = useMemo(() => {
      if (displayValue) return displayValue;
      if (!value) return '';
      if (!isObjectOptions) return value;
      const opt = (options as OptionObject[]).find((o) => o.key === value);
      return opt ? opt.value || opt.label || value : value;
    }, [value, displayValue, options, isObjectOptions]);

    useEffect(() => {
      function onDocClick(e: MouseEvent) {
        const containerRef = ref || internalRef;
        if (typeof containerRef === 'object' && containerRef?.current) {
          if (!containerRef.current.contains(e.target as Node)) {
            handleOpenChange(false);
            setActiveIdx(-1);
            onBlur?.();
          }
        }
      }
      function onKey(e: KeyboardEvent) {
        if (!open) return;
        if (e.key === 'Escape') {
          handleOpenChange(false);
          setActiveIdx(-1);
        }
      }
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onKey);
      };
    }, [open, onBlur, handleOpenChange, ref]);

    useEffect(() => {
      if (open && showSearch) {
        setActiveIdx(-1);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (!open) {
        setSearchQuery('');
      }
    }, [open, showSearch]);

    const commitSelect = (opt: OptionType) => {
      handleChange(getOptionKey(opt));
      setSearchQuery('');
      handleOpenChange(false);
      setActiveIdx(-1);
    };

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        handleChange('');
      },
      [handleChange]
    );

    const getEmptyStateMessage = () => {
      if (loading) {
        return (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>جاري التحميل...</span>
          </div>
        );
      }
      if (options.length === 0) {
        return (
          <div className="py-6 text-center text-sm text-gray-500">
            {emptyMessage}
          </div>
        );
      }
      if (filtered.length === 0 && debouncedQuery.trim()) {
        return (
          <div className="py-6 text-center text-sm text-gray-500">
            {noResultsMessage}
          </div>
        );
      }
      return null;
    };

    return (
      <div
        className={cn('relative flex flex-col gap-1', widthClass, className)}
        ref={ref || internalRef}
      >
        {name && (
          <input type="hidden" name={name} value={value} onChange={() => {}} />
        )}

        <button
          type="button"
          onClick={() => !disabled && !loading && handleOpenChange(!open)}
          disabled={disabled || loading}
          className={cn(
            'px-3 py-2 relative rounded border font-medium truncate flex items-center justify-between',
            disabled || loading
              ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200'
              : 'cursor-pointer bg-white',
            error ? 'border-red-500' : 'border-gray-300',
            triggerClassName
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span
            className={cn(
              'text-right flex-1 truncate',
              currentDisplayValue ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحميل...
              </span>
            ) : (
              currentDisplayValue || placeholder
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
            <ChevronDown
              className={cn(
                'h-5 w-5 text-gray-400 transition-transform',
                open && 'rotate-180'
              )}
            />
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
              role="listbox"
            >
              {showSearch && (
                <div className="p-2 border-b border-gray-100">
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}
              <ul className="py-1">
                {getEmptyStateMessage() ||
                  filtered.map((opt, idx) => {
                    const optKey = getOptionKey(opt);
                    const isSelected = value === optKey;
                    return (
                      <li
                        key={optKey}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onMouseLeave={() => setActiveIdx(-1)}
                        onClick={() => commitSelect(opt)}
                        className={cn(
                          'px-3 py-2 cursor-pointer flex items-center justify-between gap-2',
                          'hover:bg-primary hover:text-white',
                          activeIdx === idx && !isSelected && 'bg-gray-100',
                          isSelected && 'bg-primary text-white'
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span>{getDisplayText(opt)}</span>
                        {isSelected && <CheckIcon className="h-4 w-4" />}
                      </li>
                    );
                  })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

export { SearchableSelect };
export default SearchableSelect;
