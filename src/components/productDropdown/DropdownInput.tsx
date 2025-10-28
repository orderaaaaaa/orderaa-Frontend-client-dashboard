import { Product } from '@/types/orders';
import { ChevronDown, Plus } from 'lucide-react';

interface DropdownInputProps {
  isOpen: boolean;
  search: string;
  selectedProducts: Product[];
  placeholder: string;
  selectClassName?: string;
  placeholderClassName?: string;
  placeholderStyle?: React.CSSProperties;
  icon?: React.ComponentType<{ size?: number }>;
  onToggle: () => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchFocus: () => void;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  isOpen,
  search,
  selectedProducts,
  placeholder,
  selectClassName,
  placeholderClassName,
  placeholderStyle,
  icon: Icon,
  onToggle,
  onSearchChange,
  onSearchFocus,
}) => {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="absolute cursor-pointer left-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        aria-label="Toggle dropdown"
      >
        <ChevronDown
          size={20}
          className={`transition-transform mt-3 duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {Icon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon size={20} />
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={onSearchChange}
        onFocus={onSearchFocus}
        placeholder={placeholder}
        className={
          selectClassName ||
          `w-full border border-[#CED4DA] rounded-lg py-2.5 px-10 text-[18px] ${
            selectedProducts.length > 0
              ? 'text-[#111827]'
              : placeholderClassName ?? 'text-[#878A99]'
          }`
        }
        style={
          !selectedProducts.length && placeholderStyle
            ? placeholderStyle
            : undefined
        }
      />
    </>
  );
};
