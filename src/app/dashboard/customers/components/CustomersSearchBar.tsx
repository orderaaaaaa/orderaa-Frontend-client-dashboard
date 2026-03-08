'use client';

import { memo } from 'react';
import { LiaSearchSolid } from 'react-icons/lia';
import Input from '@/components/ui/Input';

interface CustomersSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

const CustomersSearchBar = memo(
  ({ value, onChange, onClear }: CustomersSearchBarProps) => {
    return (
      <div className="relative">
        <LiaSearchSolid className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
        <Input
          placeholder="البحث بالاسم، رقم الهاتف، أو الكود..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          clearable
          onClear={onClear}
          inputClassName="pr-10 bg-white"
        />
      </div>
    );
  },
);

CustomersSearchBar.displayName = 'CustomersSearchBar';

export default CustomersSearchBar;
