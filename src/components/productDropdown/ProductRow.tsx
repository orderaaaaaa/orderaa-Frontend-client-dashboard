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
  const hasVariants = product.variants?.length;

  return (
    <div
      className={`border-b mb-2 border-gray-100 rounded-sm transition-colors ${
        isSelected ? 'bg-gray-50' : 'bg-white'
      }`}
      dir="rtl"
    >
      {/* Main Product Row */}
      <div
        className="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onProductClick(product)}
      >
        {/* Product Image */}
        <div className="w-1/4 flex justify-center">
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-gray-200">
            <Image
              src={product.image as string}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Product Name */}
        <div className="w-1/2 text-center font-medium">{product.name}</div>

        {/* Product Price */}
        <div className="w-1/4 text-center text-gray-700">
          {product.price} ج.م
        </div>
      </div>

      {/* Variants Section */}
      {isExpanded && hasVariants && (
        <div
          className="py-4 mr-10 border-t border-gray-200 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            {product.variants!.map((variant) => (
              <label
                key={`${product.id}-${variant.id}`}
                className="flex items-center gap-3 cursor-pointer hover:text-[#5D24E1] transition-colors"
              >
                <input
                  type="radio"
                  name={`variant-${product.id}`}
                  checked={selectedVariant?.id === variant.id}
                  onChange={(e) => onVariantSelect(product.id, variant, e)}
                  className="h-4 w-4 text-[#5D24E1] border-gray-300 focus:ring-[#5D24E1] accent-[#5D24E1] cursor-pointer"
                />
                <div className="flex flex-col text-sm">
                  <span className="text-gray-600">
                    الالوان: {variant.name} المقاسات: {variant.size}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Show indicator if no variants */}
      {isExpanded && !hasVariants && (
        <div className="p-3 pr-8 border-t border-gray-200 text-sm text-gray-500 text-center">
          لا توجد متغيرات متاحة
        </div>
      )}
    </div>
  );
};
