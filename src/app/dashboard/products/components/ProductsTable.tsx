'use client';

import React, { useState } from 'react';
import { LiaEditSolid } from 'react-icons/lia';
import { FaRegSquare } from 'react-icons/fa6';
import { PiCheckSquareFill } from 'react-icons/pi';
import { ListChecks, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { useGetProducts } from '../hooks/useProduct';
import { useProductStore } from '../store/useProductStore';
import { VariantItem } from '../types/products';
import Input from '@/components/ui/Input';
import ProductAddVariantsModal from './modals/productAddVariants';
import { getTimeAgo } from '@/utils';
import ProductVariantCountsModal from './modals/ProductVariantCountsModal';
import SearchableSelect from '@/components/ui/SearchableSelect';
import LoadingAnimation from '@/components/ui/loadingAnimation';

function ProductsTable() {
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    setSearch,
    setSortBy,
    setSortOrder,
  } = useProductStore();
  const { data, isLoading } = useGetProducts({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    variants: VariantItem[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldProductId, setSoldProductId] = useState<number | null>(null);

  const sortByOptions = [
    { key: 'createdAt', value: 'تاريخ الإنشاء' },
    { key: 'name', value: 'الاسم' },
    { key: 'price', value: 'السعر' },
    { key: 'totalSold', value: 'عدد القطع المباعة' },
    { key: 'totalOrders', value: 'عدد الطلبات' },
  ];

  const sortOrderOptions = [
    { key: 'desc', value: 'تنازلي' },
    { key: 'asc', value: 'تصاعدي' },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with desc as default
      setSortBy(field);
      setSortOrder('desc');
    }
  };

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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (!data?.data) return;

    setSelectedIds(
      selectedIds.length === data.data.length ? [] : data.data.map((p) => p.id),
    );
  };

  const openSoldModal = (productId: number) => {
    setSoldProductId(productId);
    setShowSoldModal(true);
  };

  const closeSoldModal = () => {
    setShowSoldModal(false);
    setSoldProductId(null);
  };

  const openEditModal = (productId: number, variants: VariantItem[]) => {
    setActiveProduct({ id: productId, variants });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveProduct(null);
  };

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[300px]" />
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-[150px]" />
      </div>

      {/* Loading Animation */}
      <LoadingAnimation />
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <div className="flex gap-2 items-center flex-wrap">
            <Input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن المنتج"
              className="!px-5 min-w-[300px]"
            />
          </div>

          <button
            onClick={() => setShowCheckboxes((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-primary text-white border-primary hover:opacity-90"
          >
            <ListChecks className="w-5 h-5" />
            {showCheckboxes ? 'إخفاء التحديد' : 'تحديد المنتجات'}
          </button>
        </div>

        {/* ================= Desktop Table ================= */}
        <div className="hidden md:block overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full table-fixed border-collapse" dir="rtl">
            <thead>
              <tr className="bg-gray-50 border-b text-primary">
                <th className="p-4 w-14 text-center">
                  {showCheckboxes && (
                    <button onClick={toggleSelectAll}>
                      {selectedIds.length > 0 &&
                      selectedIds.length === data?.data.length ? (
                        <PiCheckSquareFill className="w-6 h-6" />
                      ) : (
                        <FaRegSquare className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
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

            <tbody className="divide-y">
              {data?.data.map((product) => (
                <tr
                  key={product.id}
                  className={
                    selectedIds.includes(product.id)
                      ? 'bg-blue-50/40'
                      : 'hover:bg-gray-50'
                  }
                >
                  <td className="p-4 text-center">
                    {showCheckboxes && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4"
                      />
                    )}
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
                    <button
                      onClick={() => openSoldModal(product.id)}
                      className="text-gray-800 cursor-pointer font-semibold"
                    >
                      {product.totalSold}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        openEditModal(
                          product.id,
                          product.extraDetails?.variants || [],
                        )
                      }
                      className="text-primary flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <LiaEditSolid className="w-5 h-5" />
                      تعديل
                    </button>
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

        {/* ===== Mobile Cards ===== */}
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

          {data?.data.map((product) => (
            <div
              key={product.id}
              className={`border rounded-xl p-4 bg-white shadow-sm ${
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
                      className="text-sm text-gray-600 flex items-center gap-1 "
                    >
                      <span>عدد القطع المباعه:</span>
                      <span className="font-medium ">{product.totalSold}</span>
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

      {showModal && activeProduct && (
        <ProductAddVariantsModal
          productId={activeProduct.id}
          variants={activeProduct.variants}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
      {showSoldModal && soldProductId && (
        <ProductVariantCountsModal
          productId={soldProductId}
          isOpen={showSoldModal}
          onClose={closeSoldModal}
        />
      )}
    </>
  );
}

export default ProductsTable;
