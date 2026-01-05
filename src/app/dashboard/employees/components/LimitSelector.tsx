import React, { useState, useRef, useEffect } from 'react';
import { RxChevronUp } from 'react-icons/rx';

const LIMIT_OPTIONS = [10, 15, 20, 25];

interface LimitSelectorProps {
  limit: number;
  onLimitChange: (value: number) => void;
}

export const LimitSelector = ({ limit, onLimitChange }: LimitSelectorProps) => {
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitRef = useRef<HTMLDivElement | null>(null);

  const handleSelectLimit = (value: number) => {
    onLimitChange(value);
    setIsLimitOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        limitRef.current &&
        !limitRef.current.contains(event.target as Node)
      ) {
        setIsLimitOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={limitRef} className="relative w-fit">
      <div
        onClick={() => setIsLimitOpen((prev) => !prev)}
        className="bg-primary w-15 py-1 px-3 rounded-full text-white flex items-center justify-center cursor-pointer select-none gap-2"
      >
        {limit}
        <RxChevronUp
          className={`transition-transform ${isLimitOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isLimitOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-md overflow-hidden z-10">
          {LIMIT_OPTIONS.map((option) => (
            <div
              key={option}
              onClick={() => handleSelectLimit(option)}
              className="text-primary text-center py-1 cursor-pointer hover:bg-[#f1eefa]"
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
