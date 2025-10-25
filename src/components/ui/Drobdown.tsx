'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface ComboboxOption {
  key: string;
  value: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options?: ComboboxOption[];
  placeholder?: string;
  label?: string;
  icon?: LucideIcon;
  className?: string;
  selectClassName?: string;
  placeholderClassName?: string;
  placeholderStyle?: React.CSSProperties;
}

export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'اختر',
  label,
  icon: Icon,
  className,
  selectClassName,
  placeholderClassName,
  placeholderStyle,
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
        {/* Dropdown Arrow on the LEFT */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown size={20} />
        </div>
        {/* Optional icon on the RIGHT */}
        {Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            // Do not clear selection on search
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={
            selectClassName
              ? selectClassName
              : `w-full border border-[#CED4DA] rounded-lg py-2.5 px-10 text-[18px] ${
                  value
                    ? 'text-[#111827]'
                    : placeholderClassName ?? 'text-[#878A99]'
                }`
          }
          style={!value && placeholderStyle ? placeholderStyle : undefined}
        />
        {isOpen && (
          <ul className="absolute z-10 left-0 right-0 bg-white border border-[#CED4DA] rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-[#878A99]">{'لا توجد نتائج'}</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.key}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    value === option.key ? 'bg-gray-200' : ''
                  }`}
                  onClick={() => {
                    onChange(option.key);
                    setSearch('');
                    setIsOpen(false);
                  }}
                >
                  {option.value}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
