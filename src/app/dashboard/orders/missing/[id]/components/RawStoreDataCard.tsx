import type { MissingOrderDetail } from '@/types/missing-orders';

const NOT_AVAILABLE = 'غير متوفر';

interface RawStoreDataCardProps {
  row: MissingOrderDetail;
}

export function RawStoreDataCard({ row }: RawStoreDataCardProps) {
  const unknownProducts = row.products.filter((product) => product.productId === null);

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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
