'use client';

import { useState, useRef, useEffect } from 'react';
import { LiaEditSolid, LiaExchangeAltSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';

interface ProductActionMenuProps {
  onModify: () => void;
  onSwap: () => void;
  disabled?: boolean;
}

const menuOptions = [
  { label: 'تعديل المتغيرات', action: 'modify' as const, icon: <LiaEditSolid className="w-5 h-5" /> },
  { label: 'تغيير المنتج', action: 'swap' as const, icon: <LiaExchangeAltSolid className="w-5 h-5" /> },
];

export default function ProductActionMenu({ onModify, onSwap, disabled = false }: ProductActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action: 'modify' | 'swap') => {
    setIsOpen(false);
    if (action === 'modify') {
      onModify();
    } else {
      onSwap();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="hover:text-purple-700 transition-colors"
      >
        <LiaEditSolid className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
          dir="rtl"
        >
          {menuOptions.map((option) => (
            <Button
              key={option.action}
              variant="ghost"
              onClick={() => handleActionClick(option.action)}
              className="w-full px-4 py-3 text-sm font-bold text-[#1F1F1F] hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 justify-start"
            >
              <div className="flex flex-row items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
