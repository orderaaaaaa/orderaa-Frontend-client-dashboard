import React from 'react';
import { LiaEditSolid } from 'react-icons/lia';
import { FaRegSquare } from 'react-icons/fa6';
import { PiCheckSquareFill } from 'react-icons/pi';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VariantItem } from '../types/products';
import { getTimeAgo } from '@/utils';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import { ConfirmOutOfStockControl } from './ConfirmOutOfStockControl';
import { useStoreConfirmOutOfStock } from '../hooks/useProduct';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  images: string[];
  createdAt: string;
  totalSold: number;
  totalOrders: number;
  extraDetails?: {
    variants?: VariantItem[];
  };
  /** T27: true allow / false forbid / null inherit the store. Never a plain boolean. */
  allowConfirmOutOfStock: boolean | null;
}

interface ProductsTableDesktopProps {
  data: { data: Product[] } | undefined;
  isRefetching: boolean;
  showCheckboxes: boolean;
  selectedIds: number[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (field: string) => void;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  openSoldModal: (productId: number) => void;
  openEditModal: (productId: number, variants: VariantItem[]) => void;
}

function ProductsTableDesktop({
  data,
  isRefetching,
  showCheckboxes,
  selectedIds,
  sortBy,
  sortOrder,
  handleSort,
  toggleSelect,
  toggleSelectAll,
  openSoldModal,
  openEditModal,
}: ProductsTableDesktopProps) {
  // T27: what "اتبع المتجر" resolves to for every row on this page.
  const storeAllowsConfirmOutOfStock = useStoreConfirmOutOfStock();

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  return (
    <div className="hidden md:block overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="w-full table-fixed border-collapse" dir="rtl">
        <thead>
          <tr className="bg-gray-50 border-b text-primary">
            <th className="p-4 w-14 text-center">
              <button onClick={toggleSelectAll}>
                {selectedIds.length > 0 &&
                selectedIds.length === data?.data.length ? (
                  <PiCheckSquareFill className="w-6 h-6" />
                ) : (
                  <FaRegSquare className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </th>

            <th className="p-4 text-center">صورة المنتج</th>

            <th
              className={`p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors select-none ${
                sortBy === 'name' ? 'text-primary' : ''
              }`}
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>الاسم</span>
                {getSortIcon('name')}
              </div>
            </th>

            <th
              className={`p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors select-none ${
                sortBy === 'price' ? 'text-primary' : ''
              }`}
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>السعر</span>
                {getSortIcon('price')}
              </div>
            </th>

            <th
              className={`p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors select-none ${
                sortBy === 'createdAt' ? 'text-primary' : ''
              }`}
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>تاريخ الإنشاء</span>
                {getSortIcon('createdAt')}
              </div>
            </th>

            <th
              className={`p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors select-none ${
                sortBy === 'totalSold' ? 'text-primary' : ''
              }`}
              onClick={() => handleSort('totalSold')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>عدد القطع المباعة</span>
                {getSortIcon('totalSold')}
              </div>
            </th>

            {/* T27 — the per-product override of the store's rule. */}
            <th className="p-4 text-center">تأكيد بدون مخزون</th>

            <th className="p-4 text-center">تعديل</th>

            <th
              className={`p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors select-none ${
                sortBy === 'totalOrders' ? 'text-primary' : ''
              }`}
              onClick={() => handleSort('totalOrders')}
            >
              <div className="flex items-center justify-center gap-2">
                <span>الطلبات</span>
                {getSortIcon('totalOrders')}
              </div>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y relative">
          {/* Loading Overlay */}
          {isRefetching && (
            <tr>
              <td colSpan={9} className="relative p-0">
                <div className="absolute inset-0 z-20 flex items-center justify-center min-h-[200px]">
                  <LoadingAnimation />
                </div>
              </td>
            </tr>
          )}

          <tr
            className={isRefetching ? 'opacity-50 pointer-events-none' : ''}
            style={{ display: isRefetching ? 'none' : 'table-row' }}
          >
            <td colSpan={9} className="p-0"></td>
          </tr>

          {data?.data.map((product) => (
            <tr
              key={product.id}
              className={`${
                selectedIds.includes(product.id)
                  ? 'bg-blue-50/40'
                  : 'hover:bg-gray-50'
              } ${isRefetching ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <td className="p-4 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="w-4 h-4"
                />
              </td>

              <td className="p-4 text-center">
                <img
                  src={
                    product.image ||
                    product.images[0] ||
                    'https://placehold.net/600x600.png'
                  }
                  className="w-20 h-20 mx-auto rounded-lg object-cover border"
                />
              </td>

              <td className="p-4 text-center">{product.name}</td>
              <td className="p-4 text-center">{product.price}</td>
              <td className="p-4 text-center text-sm text-gray-800">
                {getTimeAgo(product.createdAt)}
              </td>
              <td className="p-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => openSoldModal(product.id)}
                  className="font-semibold text-gray-800"
                >
                  {product.totalSold}
                </Button>
              </td>
              <td className="p-4 text-center min-w-[170px]">
                <ConfirmOutOfStockControl
                  productId={product.id}
                  value={product.allowConfirmOutOfStock}
                  storeDefault={storeAllowsConfirmOutOfStock}
                />
              </td>

              <td className="p-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() =>
                    openEditModal(
                      product.id,
                      product.extraDetails?.variants || [],
                    )
                  }
                  className="text-primary mx-auto"
                >
                  <LiaEditSolid className="size-5" />
                  تعديل
                </Button>
              </td>

              <td className="p-4 text-center">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {product.totalOrders}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsTableDesktop;
