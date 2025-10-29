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
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const filteredOptions = Array.isArray(options)
    ? options.filter((option) =>
        option.value.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const selectedOption = options.find((opt) => opt.key === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const inputValue = isOpen
    ? search
    : selectedOption
    ? selectedOption.value
    : search;

  // === handle flash on click ===
  const handleFlash = (key: string) => {
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), 200); // reset after 200ms
  };

  return (
    <div ref={ref} className={className ? className : 'w-full'}>
      {label && (
        <label className="block mb-1 font-medium text-[16px]">{label}</label>
      )}
      <div className="relative">
        {/* ▼ Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute cursor-pointer left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Toggle dropdown"
        >
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Optional icon */}
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={
            selectClassName
              ? selectClassName
              : `w-full border-2 !border-[#5D24E1] rounded-lg py-2.5 px-10 text-[18px]
                 bg-[#EAEAEA40] focus:border-[#5D24E1] focus:ring-[3px] focus:!ring-[#5D24E1]/50 
                 outline-none transition duration-150 ease-in-out 
                 ${
                   value
                     ? 'text-[#111827]'
                     : placeholderClassName ?? 'text-[#878A99]'
                 }`
          }
          style={!value && placeholderStyle ? placeholderStyle : undefined}
        />

        {/* Dropdown Menu */}
        {isOpen && (
          <ul className="absolute z-10 left-0 right-0 bg-white border border-[#CED4DA] rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-[#878A99]">{'لا توجد نتائج'}</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.key}
                  className={`px-3 py-2 cursor-pointer select-none transition-colors duration-150
                    ${
                      value === option.key
                        ? 'bg-[#5D24E1] text-white'
                        : flashKey === option.key
                        ? 'bg-[#5D24E1]/70 text-white'
                        : 'text-[#1F1F1F]'
                    }
                    hover:bg-[#5D24E1] hover:text-white 
                    md:hover:bg-[#5D24E1] md:hover:text-white 
                    md:active:scale-95 active:bg-[#5D24E1]/80 active:text-white
                  `}
                  onClick={() => {
                    onChange(option.key);
                    handleFlash(option.key);
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
