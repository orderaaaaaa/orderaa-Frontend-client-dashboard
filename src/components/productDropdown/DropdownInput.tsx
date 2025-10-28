import { SelectedProduct } from '@/types/orders';
import { ChevronDown } from 'lucide-react';

interface DropdownInputProps {
  isOpen: boolean;
  search: string;
  selectedProducts: SelectedProduct[];
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
  const defaultClassName =
    'w-full border border-[#CED4DA] rounded-lg py-2.5 px-10 text-[18px] transition-colors';
  const hasSelection = selectedProducts.length > 0;

  const inputClassName =
    selectClassName ||
    `${defaultClassName} ${
      hasSelection ? 'text-[#111827]' : placeholderClassName ?? 'text-[#878A99]'
    }`;

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        aria-label="Toggle dropdown"
      >
        <ChevronDown
          size={20}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Optional Icon */}
      {Icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon size={20} />
        </div>
      )}

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={onSearchChange}
        onFocus={onSearchFocus}
        placeholder={placeholder}
        className={inputClassName}
        style={!hasSelection && placeholderStyle ? placeholderStyle : undefined}
      />
    </>
  );
};
