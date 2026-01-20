import React from 'react';
import { LiaEditSolid } from 'react-icons/lia';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { VariantItem } from '../types/products';
import SearchableSelect from '@/components/ui/SearchableSelect';
import LoadingAnimation from '@/components/ui/loadingAnimation';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  images: string[];
  totalSold: number;
  totalOrders: number;
  extraDetails?: {
    variants?: VariantItem[];
  };
}

interface ProductsTableMobileProps {
  data: { data: Product[] } | undefined;
  isRefetching: boolean;
  showCheckboxes: boolean;
  selectedIds: number[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSortBy: (value: string) => void;
  setSortOrder: (value: 'asc' | 'desc') => void;
  toggleSelect: (id: number) => void;
  openSoldModal: (productId: number) => void;
  openEditModal: (productId: number, variants: VariantItem[]) => void;
}

function ProductsTableMobile({
  data,
  isRefetching,
  showCheckboxes,
  selectedIds,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  toggleSelect,
  openSoldModal,
  openEditModal,
}: ProductsTableMobileProps) {
  const sortByOptions = [
    { key: 'createdAt', value: 'تاريخ الإنشاء' },
    { key: 'name', value: 'الاسم' },
    { key: 'price', value: 'السعر' },
    { key: 'totalSold', value: 'عدد القطع المباعة' },
    { key: 'totalOrders', value: 'عدد الطلبات' },
  ];

  return (
    <div className="md:hidden flex flex-col gap-3">
      {/* Mobile Sort Controls */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchableSelect
            value={sortBy}
            onChange={setSortBy}
            options={sortByOptions}
            placeholder="اختر طريقة الترتيب"
            searchPlaceholder="ابحث..."
            triggerClassName="!py-2"
            searchThreshold={10}
          />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[120px] justify-center"
        >
          {sortOrder === 'asc' ? (
            <>
              <ArrowUp className="w-4 h-4" />
              <span>تصاعدي</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-4 h-4" />
              <span>تنازلي</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Cards Container with Loading Overlay */}
      <div className="relative">
        {/* Loading Overlay */}
        {isRefetching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex justify-center rounded-lg min-h-[200px]">
            <LoadingAnimation />
          </div>
        )}

        <div className={isRefetching ? 'opacity-50 pointer-events-none' : ''}>
          {data?.data.map((product) => (
            <div
              key={product.id}
              className={`border rounded-xl p-4 bg-white shadow-sm mb-3 ${
                selectedIds.includes(product.id)
                  ? 'ring-2 ring-primary/30 border-primary/30'
                  : ''
              }`}
            >
              <div className="flex gap-4 items-center">
                <img
                  src={
                    product.image ||
                    product.images[0] ||
                    'https://placehold.net/600x600.png'
                  }
                  className="w-24 h-24 rounded-lg object-cover border"
                />
                <div className="flex-1 space-y-1 text-right" dir="rtl">
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    السعر: {product.price}
                  </p>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    الطلبات: {product.totalOrders}
                  </span>

                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={() => openSoldModal(product.id)}
                      className="text-sm text-gray-600 flex items-center gap-1"
                    >
                      <span>عدد القطع المباعه:</span>
                      <span className="font-medium">{product.totalSold}</span>
                    </button>
                    <button
                      onClick={() =>
                        openEditModal(
                          product.id,
                          product.extraDetails?.variants || [],
                        )
                      }
                      className="text-primary text-sm flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <LiaEditSolid /> تعديل
                    </button>
                  </div>
                </div>
                {showCheckboxes && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="w-5 h-5 text-primary rounded border-gray-300"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsTableMobile;
