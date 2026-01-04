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

  selectedProducts,
  placeholder,
  placeholderClassName,
  icon: Icon,
  onToggle,
}) => {
  const hasSelection = selectedProducts.length > 0;

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full border border-primary cursor-pointer rounded-lg py-2.5 px-10 text-[18px] transition-colors text-left flex items-center justify-between"
        aria-label="Toggle dropdown"
      >
        <span
          className={
            hasSelection
              ? 'text-[#111827]'
              : placeholderClassName ?? 'text-[#878A99]'
          }
        >
          {hasSelection ? `${selectedProducts.length} منتج مختار` : placeholder}
        </span>

        <div className="flex items-center">
          {/* Optional Icon */}

          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>
      </button>
    </>
  );
};
