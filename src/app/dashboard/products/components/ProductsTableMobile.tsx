import React from 'react';
import { LiaEditSolid } from 'react-icons/lia';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  /**
   * Opens the "تعديل خصائص المنتج والخيارات" popup. The parent owns the
   * attribute-options fetch and its error fallback — never fetch here.
   */
  openEditAttrsModal: (productId: number) => void;
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
  openEditAttrsModal,
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

        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="min-w-[120px] justify-center"
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

        <div className={isRefetching ? 'opacity-50 pointer-events-none' : ''}>
          {data?.data.map((product) => {
            // The whole box is the tap target: below md the desktop table —
            // and with it the image/name triggers for this popup — is hidden,
            // so the card is the only way to reach it on a phone (T19).
            // Select mode wins: while picking products to merge, a tap ticks
            // the box instead of opening the popup.
            const handleCardActivate = () => {
              if (showCheckboxes) {
                toggleSelect(product.id);
                return;
              }
              openEditAttrsModal(product.id);
            };

            return (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                aria-label={
                  showCheckboxes
                    ? `تحديد ${product.name}`
                    : `تعديل خصائص ${product.name}`
                }
                onClick={handleCardActivate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardActivate();
                  }
                }}
                className={`border rounded-xl p-4 bg-white shadow-sm mb-3 cursor-pointer ${
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          openSoldModal(product.id);
                        }}
                        className="text-gray-600 px-1"
                      >
                        <span>عدد القطع المباعه:</span>
                        <span className="font-medium">{product.totalSold}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          openEditModal(
                            product.id,
                            product.extraDetails?.variants || [],
                          );
                        }}
                        className="text-primary"
                      >
                        <LiaEditSolid /> تعديل
                      </Button>
                    </div>
                  </div>
                  {showCheckboxes && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      // onChange does not bubble, but the click that triggers it
                      // does — without this the card handler would toggle the
                      // selection a second time and cancel it out.
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 text-primary rounded border-gray-300"
                    />
                  )}
                </div>

                {/* Hint that the box itself is tappable. Not a button — it has no
                    handler of its own and must never be the only tap target.
                    Hidden in select mode, where a tap selects instead. */}
                {!showCheckboxes && (
                  <div className="mt-2 flex items-center justify-end gap-1 text-xs text-primary/70">
                    <LiaEditSolid className="w-3.5 h-3.5" />
                    <span>الخصائص</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductsTableMobile;
