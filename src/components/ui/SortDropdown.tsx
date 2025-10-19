import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  label: string;
  value: string;
  order: 'ASC' | 'DESC';
}

interface SortDropdownProps {
  onSort: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  options?: SortOption[];
}

const defaultOptions: SortOption[] = [
  { label: 'الأحدث أولاً', value: 'createdAt', order: 'DESC' },
  { label: 'الأقدم أولاً', value: 'createdAt', order: 'ASC' },
  { label: 'السعر (الأعلى)', value: 'totalPrice', order: 'DESC' },
  { label: 'السعر (الأقل)', value: 'totalPrice', order: 'ASC' },
  { label: 'اسم العميل (أ-ي)', value: 'customerName', order: 'ASC' },
  { label: 'اسم العميل (ي-أ)', value: 'customerName', order: 'DESC' },
];

export default function SortDropdown({ onSort, options = defaultOptions }: SortDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<SortOption>(options[0]);

  const handleSelect = (option: SortOption) => {
    setSelected(option);
    onSort(option.value, option.order);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <ArrowUpDown size={18} />
        <span>{selected.label}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                className={`w-full text-right px-4 py-2 hover:bg-gray-100 transition ${
                  selected.value === option.value && selected.order === option.order
                    ? 'bg-[#5D24E1] bg-opacity-10 text-[#5D24E1] font-semibold'
                    : ''
                } ${index === 0 ? 'rounded-t-lg' : ''} ${
                  index === options.length - 1 ? 'rounded-b-lg' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
