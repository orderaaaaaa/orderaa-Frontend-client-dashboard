'use client';

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type OptionObject = { key: string; value?: string; label?: string };
type OptionType = string | OptionObject;

type Props = {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  options: OptionType[];
  placeholder?: string;
  widthClass?: string;
  error?: string;
  name?: string;
  disabled?: boolean;
  displayValue?: string;
};

const SearchableSelect = forwardRef<HTMLDivElement, Props>(
  function SearchableSelect(
    {
      value,
      onChange,
      onBlur,
      options,
      placeholder = 'ابحث...',
      widthClass = 'w-56',
      error,
      name,
      disabled = false,
      displayValue,
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [activeIdx, setActiveIdx] = useState<number>(-1);
    const internalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if options are objects or strings
    const isObjectOptions = useMemo(() => {
      return options.length > 0 && typeof options[0] === 'object';
    }, [options]);

    // Get display text for an option - support both 'value' and 'label'
    const getDisplayText = (opt: OptionType): string => {
      if (typeof opt === 'string') return opt;
      return opt.value || opt.label || '';
    };

    // Get key/value for an option
    const getOptionKey = (opt: OptionType): string => {
      if (typeof opt === 'string') return opt;
      return opt.key;
    };

    const filtered = useMemo(
      () =>
        (options || []).filter((o) => {
          if (!o) return false;
          const text = getDisplayText(o);
          return text && text.toLowerCase().includes(q.toLowerCase());
        }),
      [options, q]
    );

    // Get the display value for the current selection
    const currentDisplayValue = useMemo(() => {
      if (displayValue) return displayValue;
      if (!value) return '';
      if (!isObjectOptions) return value;
      // Find the option that matches the key
      const opt = (options as OptionObject[]).find((o) => o.key === value);
      return opt ? opt.value || opt.label || value : value;
    }, [value, displayValue, options, isObjectOptions]);

    useEffect(() => {
      function onDocClick(e: MouseEvent) {
        if (!internalRef.current) return;
        if (!internalRef.current.contains(e.target as Node)) {
          setOpen(false);
          setActiveIdx(-1);
          if (onBlur) onBlur();
        }
      }
      function onKey(e: KeyboardEvent) {
        if (!open) return;
        if (e.key === 'Escape') {
          setOpen(false);
          setActiveIdx(-1);
        }
      }
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onKey);
      };
    }, [open]);

    useEffect(() => {
      if (open) {
        setActiveIdx(-1);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [open]);

    const commitSelect = (opt: OptionType) => {
      onChange(getOptionKey(opt));
      setQ('');
      setOpen(false);
      setActiveIdx(-1);
    };

    return (
      <div
        className={`relative flex flex-col gap-1  ${widthClass}`}
        ref={ref || internalRef}
      >
        <button
          type="button"
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          className={`px-3 py-2 relative rounded border font-medium truncate flex items-center justify-between ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200'
              : 'cursor-pointer bg-white'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span
            className={`text-right ${
              currentDisplayValue ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            {currentDisplayValue || `${placeholder}`}
          </span>
          <svg
            className={`w-6 h-6 absolute left-2 top-2 text-gray-400 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.084l3.71-3.854a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z" />
          </svg>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 38 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="absolute !z-100 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
              role="listbox"
            >
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-2 py-1 rounded border border-gray-200"
                />
              </div>
              <ul>
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    لا توجد نتائج
                  </li>
                ) : (
                  filtered.map((opt, idx) => (
                    <li
                      key={getOptionKey(opt)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseLeave={() => setActiveIdx(-1)}
                      onClick={() => commitSelect(opt)}
                      className={`px-3 py-2 z-20 cursor-pointer hover:bg-[#5D24E1] text-semibold  hover:text-white  ${
                        activeIdx === idx ? 'bg-gray-100' : ''
                      }`}
                      role="option"
                      aria-selected={value === getOptionKey(opt)}
                    >
                      {getDisplayText(opt)}
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

export default SearchableSelect;
