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
  onClear?: () => void;
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
      onClear,
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
    const [activeIdx, setActiveIdx] = useState(-1);

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

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || loading) return;

        if (onClear) {
          onClear();
        } else {
          handleChange('');
        }
      },
      [onClear, handleChange, disabled, loading]
    );

    const isObjectOptions = useMemo(
      () => options.length > 0 && typeof options[0] === 'object',
      [options]
    );

    const getDisplayText = (opt: OptionType) =>
      typeof opt === 'string' ? opt : opt.value || opt.label || '';

    const getOptionKey = (opt: OptionType) =>
      typeof opt === 'string' ? opt : opt.key;

    const showSearch = options.length > searchThreshold;

    const filtered = useMemo(() => {
      const query = debouncedQuery.toLowerCase().trim();
      return options.filter((o) => {
        const text = getDisplayText(o);
        if (!query) return true;
        return text.toLowerCase().includes(query);
      });
    }, [options, debouncedQuery]);

    const currentDisplayValue = useMemo(() => {
      if (displayValue) return displayValue;
      if (!value) return '';
      if (!isObjectOptions) return value;

      const opt = (options as OptionObject[]).find((o) => o.key === value);
      return opt?.value || opt?.label || value;
    }, [value, displayValue, options, isObjectOptions]);

    useEffect(() => {
      function onDocClick(e: MouseEvent) {
        const container = (ref ||
          internalRef) as React.RefObject<HTMLDivElement>;
        if (
          container.current &&
          !container.current.contains(e.target as Node)
        ) {
          handleOpenChange(false);
          setActiveIdx(-1);
          onBlur?.();
        }
      }

      function onKey(e: KeyboardEvent) {
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
    }, [handleOpenChange, onBlur, ref]);

    useEffect(() => {
      if (open && showSearch) {
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

    const renderEmptyState = () => {
      if (loading) {
        return (
          <div className="py-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحميل...
          </div>
        );
      }

      if (!options.length) {
        return (
          <div className="py-6 text-center text-sm text-gray-500">
            {emptyMessage}
          </div>
        );
      }

      if (!filtered.length && debouncedQuery) {
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
        ref={ref || internalRef}
        className={cn('relative flex flex-col gap-1', widthClass, className)}
      >
        {name && <input type="hidden" name={name} value={value} />}

        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => !disabled && !loading && handleOpenChange(!open)}
          className={cn(
            'relative px-2 py-1.5 md:px-3 md:py-2 rounded border flex items-center justify-between truncate text-sm md:text-base',
            disabled || loading
              ? 'bg-gray-100 cursor-not-allowed text-gray-400'
              : 'bg-white',
            error ? 'border-red-500' : 'border-gray-300',
            triggerClassName
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span
            className={cn(
              'flex-1 truncate text-right',
              currentDisplayValue ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </span>
            ) : (
              currentDisplayValue || placeholder
            )}
          </span>

          {clearable && value && !disabled && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-10 top-1/2 -translate-y-1/2 z-20
                         text-gray-400 hover:text-primary"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <ChevronDown
            className={cn(
              'w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="md:absolute md:top-full z-50 mt-1 w-full max-h-40 md:max-h-60 overflow-auto
                         rounded-md border bg-white shadow-lg"
              role="listbox"
            >
              {showSearch && (
                <div className="p-1.5 md:p-2 border-b">
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-2 py-1 md:py-1.5 rounded border text-xs md:text-sm
                               focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <ul className="py-1">
                {renderEmptyState() ||
                  filtered.map((opt, idx) => {
                    const key = getOptionKey(opt);
                    const selected = value === key;

                    return (
                      <li
                        key={key}
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onMouseLeave={() => setActiveIdx(-1)}
                        onClick={() => commitSelect(opt)}
                        className={cn(
                          'px-2 py-1.5 md:px-3 md:py-2 flex justify-between cursor-pointer text-sm md:text-base',
                          'hover:bg-primary hover:text-white',
                          selected && 'bg-primary text-white',
                          activeIdx === idx && !selected && 'bg-gray-100'
                        )}
                      >
                        <span>{getDisplayText(opt)}</span>
                        {selected && <CheckIcon className="w-4 h-4" />}
                      </li>
                    );
                  })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

export default SearchableSelect;
export { SearchableSelect };
