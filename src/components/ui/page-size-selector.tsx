import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatNumber } from '@/utils/format';

interface PageSizeSelectorProps {
  currentSize: number;
  totalItems: number;
  onSizeChange: (size: number) => void;
  showAllOption?: boolean;
  maxSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export default function PageSizeSelector({
  currentSize,
  totalItems,
  onSizeChange,
  showAllOption = true,
  maxSize,
}: PageSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const isCapped = maxSize !== undefined && totalItems > maxSize;
  const allSize = isCapped ? maxSize : totalItems;
  const allLabel = isCapped
    ? `أول ${formatNumber(maxSize)} من ${formatNumber(totalItems)}`
    : `الكل (${formatNumber(totalItems)})`;

  const isCappedSelected = showAllOption && isCapped && currentSize === maxSize;
  const isAllSelected = showAllOption && currentSize === totalItems;
  const displayValue = isCappedSelected
    ? allLabel
    : isAllSelected
      ? 'الكل'
      : formatNumber(currentSize);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex gap-2 min-h-10 text-sm bg-primary rounded-full text-white py-2 px-4 justify-center items-center cursor-pointer hover:bg-primary/90 transition-colors min-w-[80px]"
      >
        <span className="font-medium">{displayValue}</span>
        <ChevronDown
          width={20}
          height={20}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full start-[-15px] mb-2 bg-popover border border-gray-200 rounded-lg shadow-lg z-(--z-inpage-popup) min-w-[120px] overflow-hidden">
          <div className="py-1">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`w-full min-h-10 text-start px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${currentSize === size && !(isCapped && size === maxSize)
                    ? 'bg-primary/20 text-primary-text font-medium'
                    : 'text-gray-700'
                  }`}
              >
                {formatNumber(size)}
              </button>
            ))}
            {showAllOption && (
              <button
                type="button"
                onClick={() => handleSizeSelect(allSize)}
                className={`w-full min-h-10 text-start px-4 py-2 text-sm hover:bg-primary/10 transition-colors border-t border-gray-100 ${currentSize === allSize
                    ? 'bg-primary/20 text-primary-text font-medium'
                    : 'text-gray-700'
                  }`}
              >
                {allLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
