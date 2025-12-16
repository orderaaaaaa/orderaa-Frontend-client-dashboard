'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface ComboboxOption {
  key: string;
  value: string;
  icon?: LucideIcon;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: ComboboxOption[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  selectClassName?: string;
  placeholderClassName?: string;
  placeholderStyle?: React.CSSProperties;
  arrowClassName?: string;
  dropdownClassName?: string;
  readOnly?: boolean;
}

export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'اختر',
  label,
  icon,
  className,
  selectClassName,
  placeholderClassName,
  placeholderStyle,
  arrowClassName,
  dropdownClassName,
  readOnly = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = Array.isArray(options)
    ? options.filter((option) =>
        option.value.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Find the selected option value
  const selectedOption = options.find((opt) => opt.key === value);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Set input value logic
  const inputValue = isOpen
    ? search
    : selectedOption
    ? selectedOption.value
    : search;

  return (
    <div ref={ref} className={className ? className : 'w-full'}>
      {label && (
        <label className="block mb-1 font-medium text-[16px]">{label}</label>
      )}
      <div className="relative">
        {/* Dropdown Arrow on the LEFT - Clickable */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={
            arrowClassName ||
            'absolute cursor-pointer px-3 left-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
          }
          aria-label="Toggle dropdown"
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 relative ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {/* Optional icon on the RIGHT */}
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            if (!readOnly) {
              setSearch(e.target.value);
              setIsOpen(true);
            }
          }}
          onFocus={() => !readOnly && setIsOpen(true)}
          onClick={() => readOnly && setIsOpen(!isOpen)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={
            selectClassName
              ? selectClassName
              : `w-full border border-[#CED4DA] rounded-lg py-2.5 pl-10 ${
                  icon ? 'pr-10' : 'pr-3'
                } text-[18px] overflow-hidden text-ellipsis whitespace-nowrap ${
                  value
                    ? '!text-[#1F1F1F]'
                    : placeholderClassName ?? '!text-[#1F1F1F]'
                } ${readOnly ? 'cursor-pointer' : ''}`
          }
          style={!value && placeholderStyle ? placeholderStyle : undefined}
        />
        {isOpen && (
          <ul
            className={
              dropdownClassName ||
              'absolute z-10 left-0 right-0 bg-white rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg'
            }
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-[#878A99]">{'لا توجد نتائج'}</li>
            ) : (
              filteredOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <li
                    key={option.key}
                    className={`px-3 py-2 cursor-pointer text-[#111827] hover:!bg-[#5D24E1] hover:text-white flex items-center gap-2 ${
                      value === option.key ? 'bg-[#5D24E1] text-white' : ''
                    }`}
                    style={{ direction: 'rtl' }}
                    onClick={() => {
                      onChange(option.key);
                      setSearch('');
                      setIsOpen(false);
                    }}
                  >
                    <span className="flex-1">{option.value}</span>
                    {IconComponent && (
                      <IconComponent
                        size={20}
                        className="text-gray-400 flex-shrink-0"
                      />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
