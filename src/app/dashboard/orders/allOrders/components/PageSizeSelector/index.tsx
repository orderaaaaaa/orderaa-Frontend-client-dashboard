import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface PageSizeSelectorProps {
  currentSize: number;
  totalItems: number;
  onSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export default function PageSizeSelector({
  currentSize,
  totalItems,
  onSizeChange,
}: PageSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSizeSelect = (size: number) => {
    onSizeChange(size);
    setIsOpen(false);
  };

  const displayValue = currentSize === totalItems ? 'الكل' : currentSize.toString();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex gap-2 text-sm bg-[#5D24E1] rounded-full text-white py-2 px-4 justify-center items-center cursor-pointer hover:bg-[#682fee] transition-colors min-w-[80px]"
      >
        <span className="font-medium">{displayValue}</span>
        <ChevronDown
          width={20}
          height={20}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px] overflow-hidden">
          <div className="py-1">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`w-full text-right px-4 py-2 text-sm hover:bg-[#5D24E1]/10 transition-colors ${
                  currentSize === size ? 'bg-[#5D24E1]/20 text-[#5D24E1] font-medium' : 'text-gray-700'
                }`}
              >
                {size} طلب
              </button>
            ))}
            <button
              onClick={() => handleSizeSelect(totalItems)}
              className={`w-full text-right px-4 py-2 text-sm hover:bg-[#5D24E1]/10 transition-colors border-t border-gray-100 ${
                currentSize === totalItems ? 'bg-[#5D24E1]/20 text-[#5D24E1] font-medium' : 'text-gray-700'
              }`}
            >
              الكل ({totalItems})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

