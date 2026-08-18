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
import { CheckIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/utils/debounce';

type OptionObject = { key: string; value?: string; label?: string };
type OptionType = string | OptionObject;

interface MultiSelectDropdownProps {
  value?: string[];
  onChange?: (v: string[]) => void;
  onBlur?: () => void;
  options: OptionType[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  widthClass?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  searchThreshold?: number;
  debounceMs?: number;
  /**
   * Pins a select-all/clear row above the option list. Off by default so
   * every existing usage renders exactly as before; opt in for lists where
   * "everything except a couple" is a real use case (e.g. status pickers).
   */
  showSelectAll?: boolean;
  selectAllLabel?: string;
  clearAllLabel?: string;
}

const MultiSelectDropdown = forwardRef<HTMLDivElement, MultiSelectDropdownProps>(
  function MultiSelectDropdown(
    {
      value = [],
      onChange,
      onBlur,
      options = [],
      placeholder = 'اختر...',
      searchPlaceholder = 'بحث...',
      emptyMessage = 'لا توجد خيارات متاحة',
      noResultsMessage = 'لا توجد نتائج',
      widthClass = 'w-full',
      className,
      error,
      disabled = false,
      loading = false,
      searchThreshold = 5,
      debounceMs = 300,
      showSelectAll = false,
      selectAllLabel = 'تحديد الكل',
      clearAllLabel = 'إلغاء التحديد',
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const internalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(searchQuery, debounceMs);

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

    const selectedDisplayValues = useMemo(() => {
      if (!value.length) return [];
      return value.map((v) => {
        const opt = options.find((o) => getOptionKey(o) === v);
        return opt ? getDisplayText(opt) : v;
      });
    }, [value, options]);

    useEffect(() => {
      function onDocClick(e: MouseEvent) {
        const container = (ref || internalRef) as React.RefObject<HTMLDivElement>;
        if (
          container.current &&
          !container.current.contains(e.target as Node)
        ) {
          setOpen(false);
          onBlur?.();
        }
      }

      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') setOpen(false);
      }

      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onKey);
      };
    }, [ref, onBlur]);

    useEffect(() => {
      if (open && showSearch) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (!open) setSearchQuery('');
    }, [open, showSearch]);

    const toggleOption = useCallback(
      (optKey: string) => {
        const next = value.includes(optKey)
          ? value.filter((v) => v !== optKey)
          : [...value, optKey];
        onChange?.(next);
      },
      [value, onChange]
    );

    const removeItem = useCallback(
      (e: React.MouseEvent, optKey: string) => {
        e.stopPropagation();
        onChange?.(value.filter((v) => v !== optKey));
      },
      [value, onChange]
    );

    // Respects the active search filter on purpose: "select all" over a
    // narrowed-down list should only touch what's visible, not the full
    // option set hiding behind the query.
    const filteredKeys = useMemo(
      () => filtered.map((opt) => getOptionKey(opt)),
      [filtered]
    );

    const allFilteredSelected =
      filteredKeys.length > 0 &&
      filteredKeys.every((key) => value.includes(key));

    const toggleSelectAll = useCallback(() => {
      if (allFilteredSelected) {
        onChange?.(value.filter((v) => !filteredKeys.includes(v)));
      } else {
        onChange?.(Array.from(new Set([...value, ...filteredKeys])));
      }
    }, [allFilteredSelected, filteredKeys, value, onChange]);

    return (
      <div
        ref={ref || internalRef}
        className={cn('relative flex flex-col gap-1', widthClass, className)}
      >
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => !disabled && !loading && setOpen(!open)}
          className={cn(
            'relative px-2 py-1.5 md:px-3 md:py-2 rounded border flex items-center justify-between text-sm md:text-base cursor-pointer min-h-[40px]',
            disabled || loading
              ? 'bg-gray-100 cursor-not-allowed text-gray-400'
              : 'bg-white',
            error ? 'border-red-500' : 'border-gray-300'
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span
            className={cn(
              'flex-1 text-right',
              value.length > 0 ? 'text-gray-900' : 'text-gray-500'
            )}
          >
            {value.length > 0 ? (
              <span className="flex flex-wrap gap-1">
                {selectedDisplayValues.map((display, idx) => (
                  <span
                    key={value[idx]}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                  >
                    {display}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={(e) => removeItem(e, value[idx])}
                    />
                  </span>
                ))}
              </span>
            ) : (
              placeholder
            )}
          </span>

          <ChevronDown
            className={cn(
              'w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform flex-shrink-0 ms-1',
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
              className="md:absolute md:top-full z-50 mt-1 w-full max-h-40 md:max-h-60 overflow-auto rounded-md border bg-white shadow-lg"
              role="listbox"
              aria-multiselectable="true"
            >
              {showSearch && (
                <div className="p-1.5 md:p-2 border-b">
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-2 py-1 md:py-1.5 rounded border text-xs md:text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              {showSelectAll && filteredKeys.length > 0 && (
                <div className="sticky top-0 z-10 border-b bg-white px-2 py-1.5 md:px-3 md:py-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs md:text-sm font-medium text-primary hover:underline"
                  >
                    {allFilteredSelected ? clearAllLabel : selectAllLabel}
                  </button>
                </div>
              )}

              <ul className="py-1">
                {!options.length ? (
                  <li className="py-6 text-center text-sm text-gray-500">
                    {emptyMessage}
                  </li>
                ) : !filtered.length && debouncedQuery ? (
                  <li className="py-6 text-center text-sm text-gray-500">
                    {noResultsMessage}
                  </li>
                ) : (
                  filtered.map((opt) => {
                    const key = getOptionKey(opt);
                    const selected = value.includes(key);

                    return (
                      <li
                        key={key}
                        role="option"
                        aria-selected={selected}
                        onClick={() => toggleOption(key)}
                        className={cn(
                          'px-2 py-1.5 md:px-3 md:py-2 flex items-center gap-2 cursor-pointer text-sm md:text-base',
                          'hover:bg-gray-100',
                          selected && 'bg-primary/5'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                            selected
                              ? 'bg-primary border-primary'
                              : 'border-gray-300'
                          )}
                        >
                          {selected && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </span>
                        <span>{getDisplayText(opt)}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

export default MultiSelectDropdown;
export { MultiSelectDropdown };
