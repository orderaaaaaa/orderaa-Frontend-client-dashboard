'use client';

import { useProductDropdownStore } from '@/store/productDropdownStore';
import type { MissingOrderDetail } from '@/types/missing-orders';

const LINKABLE_FORMAT = 'LIGHTFUNNELS';
const NO_LINK_VALUE = '';

const NOT_AVAILABLE = 'غير متوفر';

interface RawStoreDataCardProps {
  row: MissingOrderDetail;
}

export function RawStoreDataCard({ row }: RawStoreDataCardProps) {
  const unknownProducts = row.products.filter((product) => product.productId === null);
  const canLink = row.format === LINKABLE_FORMAT;
  const selectedProducts = useProductDropdownStore((state) => state.selectedProducts);
  const setSelectedProducts = useProductDropdownStore((state) => state.setSelectedProducts);

  const linkedPositionOf = (sourceIndex: number): string => {
    const position = selectedProducts.findIndex((p) => p.sourceIndex === sourceIndex);
    return position === -1 ? NO_LINK_VALUE : String(position);
  };

  const handleLink = (sourceIndex: number, value: string) => {
    setSelectedProducts(
      selectedProducts.map((product, position) => {
        if (value !== NO_LINK_VALUE && String(position) === value) {
          return { ...product, sourceIndex };
        }
        if (product.sourceIndex === sourceIndex) {
          return { ...product, sourceIndex: undefined };
        }
        return product;
      }),
    );
  };

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm flex flex-col gap-4">
        <h1 className="font-bold text-[22px]">بيانات المتجر الأصلية</h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-gray-500">المحافظة</span>
            <span className="font-semibold">{row.governorateText || NOT_AVAILABLE}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500">المدينة</span>
            <span className="font-semibold">{row.cityText || NOT_AVAILABLE}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-xs text-gray-500">العنوان</span>
            <span className="font-semibold">{row.address || NOT_AVAILABLE}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-xs text-gray-500">ملاحظات</span>
            <span className="font-semibold">{row.notes || NOT_AVAILABLE}</span>
          </div>
        </div>

        {unknownProducts.length > 0 && (
          <div>
            <h2 className="font-semibold text-sm mb-2">منتجات غير معروفة</h2>
            <div className="flex flex-col gap-2">
              {unknownProducts.map((product) => (
                <div
                  key={product.index}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex flex-col"
                >
                  <span className="font-semibold">{product.name || NOT_AVAILABLE}</span>
                  <span className="text-xs text-gray-500">
                    SKU: {product.sku || NOT_AVAILABLE} — الكمية: {product.quantity ?? NOT_AVAILABLE}
                  </span>
                  {product.variants.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {product.variants
                        .map((variant) =>
                          [variant.attribute, variant.option].filter(Boolean).join(': '),
                        )
                        .join(' — ')}
                    </span>
                  )}
                  {canLink && (
                    <label className="mt-2 flex flex-col gap-1 text-xs text-gray-600">
                      ربط بمنتج
                      <select
                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                        value={linkedPositionOf(product.index)}
                        onChange={(event) => handleLink(product.index, event.target.value)}
                        disabled={selectedProducts.length === 0}
                      >
                        <option value={NO_LINK_VALUE}>
                          {selectedProducts.length === 0
                            ? 'اختر منتجاً في الطلب أولاً'
                            : 'بدون ربط'}
                        </option>
                        {selectedProducts.map((selected, position) => (
                          <option key={`${selected.id}-${position}`} value={String(position)}>
                            {selected.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
