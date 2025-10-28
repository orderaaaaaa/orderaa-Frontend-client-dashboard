import { Product, Variant } from '@/types/orders';
import Image from 'next/image';

interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  isExpanded: boolean;
  selectedVariant?: Variant;
  onProductClick: (product: Product) => void;
  onVariantSelect: (
    productId: number,
    variant: Variant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  isSelected,
  isExpanded,
  selectedVariant,
  onProductClick,
  onVariantSelect,
}) => {
  return (
    <div
      className={`border-b mb-2 border-gray-100 rounded-sm ${
        isSelected ? 'bg-gray-50' : ''
      }`}
      dir="rtl"
    >
      <div
        className="flex items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => onProductClick(product)}
      >
        <div className="w-1/4 flex justify-center">
          <div className="relative left-5 h-12 w-12 overflow-hidden rounded-md">
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
        <div className="w-1/2 text-center">{product.name}</div>
        <div className="w-1/4 text-center">{product.price}</div>
      </div>

      {isExpanded && product.variants.length > 0 && (
        <div
          className="p-3 pr-8 border-t border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {product.variants.map((variant) => (
            <div
              key={`${product.id}-${variant.id}`}
              className="flex items-center mb-2 last:mb-0"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="radio"
                id={`variant-${product.id}-${variant.id}`}
                name={`variant-${product.id}`}
                checked={selectedVariant?.id === variant.id}
                onChange={(e) => onVariantSelect(product.id, variant, e)}
                className="h-4 w-4 text-[#5D24E1] border-gray-300 focus:ring-[#5D24E1] accent-[#5D24E1] cursor-pointer"
              />
              <label
                htmlFor={`variant-${product.id}-${variant.id}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {variant.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
