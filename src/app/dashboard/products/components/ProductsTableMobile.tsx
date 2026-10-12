import React from 'react';
import Link from 'next/link';
import { LiaEditSolid } from 'react-icons/lia';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import { Product } from '../types/products';
import SearchableSelect from '@/components/ui/SearchableSelect';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import { ConfirmOutOfStockControl } from './ConfirmOutOfStockControl';
import { ProductThumbnailButton } from './ProductThumbnailButton';
import { productEditHref } from '../utils/productLinks';
import {
  usePendingConfirmOutOfStockIds,
  useStoreConfirmOutOfStock,
  useUpdateProductConfirmOutOfStock,
} from '../hooks/useProduct';

interface ProductsTableMobileProps {
  products: Product[];
  isRefetching: boolean;
  showCheckboxes: boolean;
  selectedIds: number[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSortBy: (value: string) => void;
  setSortOrder: (value: 'asc' | 'desc') => void;
  toggleSelect: (id: number) => void;
  openSoldModal: (productId: number) => void;
  openGallery: (product: Product) => void;
  emptyContent: React.ReactNode;
}

const SORT_BY_OPTIONS = [
  { key: 'createdAt', value: 'تاريخ الإنشاء' },
  { key: 'name', value: 'الاسم' },
  { key: 'price', value: 'السعر' },
  { key: 'totalSold', value: 'عدد القطع المباعة' },
  { key: 'totalOrders', value: 'عدد الطلبات' },
];

function ProductsTableMobile({
  products,
  isRefetching,
  showCheckboxes,
  selectedIds,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  toggleSelect,
  openSoldModal,
  openGallery,
  emptyContent,
}: ProductsTableMobileProps) {
  const storeConfirmMode = useStoreConfirmOutOfStock();
  const { mutate: saveConfirmOutOfStock } = useUpdateProductConfirmOutOfStock();
  const pendingConfirmIds = usePendingConfirmOutOfStockIds();

  return (
    <div className="lg:hidden flex flex-col gap-3">
      {/* Mobile Sort Controls */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchableSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_BY_OPTIONS}
            placeholder="اختر طريقة الترتيب"
            searchPlaceholder="ابحث..."
            triggerClassName="!py-2"
            searchThreshold={10}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="min-w-[120px] min-h-10 justify-center"
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
        </Button>
      </div>

      {/* Mobile Cards Container with Loading Overlay */}
      <div className="relative">
        {/* Loading Overlay */}
        {isRefetching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex justify-center rounded-lg min-h-[200px]">
            <LoadingAnimation />
          </div>
        )}

        {products.length === 0 ? (
          <div className="rounded-xl border bg-white">{emptyContent}</div>
        ) : (
          <ul
            className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
              isRefetching ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {products.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              return (
                <li
                  key={product.id}
                  {...(showCheckboxes
                    ? { onClick: () => toggleSelect(product.id) }
                    : {})}
                  className={`min-w-0 border rounded-xl p-4 bg-white shadow-sm ${
                    showCheckboxes ? 'cursor-pointer' : ''
                  } ${isSelected ? 'ring-2 ring-primary/30 border-primary/30' : ''}`}
                >
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <ProductThumbnailButton
                      product={product}
                      onOpen={openGallery}
                      className="w-20 h-20 sm:w-24 sm:h-24"
                    />
                    <div className="flex-1 min-w-0 space-y-1 text-right">
                      <h3 className="font-semibold text-gray-900 break-words">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        السعر: {product.price ?? '—'}
                      </p>
                      <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        الطلبات: {product.totalOrders}
                      </span>
                    </div>
                    {showCheckboxes && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        aria-label={`تحديد ${product.name}`}
                        onChange={() => toggleSelect(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 shrink-0 text-primary rounded border-gray-300"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                    <Button
                      variant="ghost"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        openSoldModal(product.id);
                      }}
                      className="text-gray-600 px-2 min-h-10"
                    >
                      <span>عدد القطع المباعة:</span>
                      <span className="font-medium">{product.totalSold}</span>
                    </Button>
                    <Can code={PERMISSIONS.PRODUCTS_UPDATE}>
                      <Button
                        asChild
                        variant="ghost"
                        className="text-primary min-h-10"
                      >
                        <Link
                          href={productEditHref(product.id)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LiaEditSolid /> تعديل المنتج
                        </Link>
                      </Button>
                    </Can>
                  </div>

                    {/* T27 — the per-product override, same control as desktop.
                        Stops click-through so choosing it never opens the card. */}
                  <div
                    className="mt-2 max-w-[260px]"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      e.stopPropagation()
                    }
                  >
                    <p className="mb-1 text-xs text-gray-500">
                      تأكيد بدون مخزون
                    </p>
                    <ConfirmOutOfStockControl
                      value={product.confirmOutOfStockMode}
                      storeMode={storeConfirmMode}
                      disabled={pendingConfirmIds.includes(product.id)}
                      onChange={(confirmOutOfStockMode) =>
                        saveConfirmOutOfStock({
                          productId: product.id,
                          confirmOutOfStockMode,
                        })
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProductsTableMobile;
