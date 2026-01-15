'use client';

import React, { useState } from 'react';
import { LiaEditSolid } from 'react-icons/lia';
import { FaRegSquare } from 'react-icons/fa6';
import { PiCheckSquareFill } from 'react-icons/pi';
import { ListChecks } from 'lucide-react';

import { useGetProducts } from '../hooks/useProduct';
import { useProductStore } from '../store/useProductStore';
import { VariantItem } from '../types/products';
import Input from '@/components/ui/Input';
import ProductAddVariantsModal from './modals/productAddVariants';
import { getTimeAgo } from '@/utils';

function ProductsTable() {
  const { page, limit } = useProductStore();
  const { data, isLoading } = useGetProducts(page, limit);

  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    variants: VariantItem[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.data) return;

    setSelectedIds(
      selectedIds.length === data.data.length ? [] : data.data.map((p) => p.id)
    );
  };

  const openEditModal = (productId: number, variants: VariantItem[]) => {
    setActiveProduct({ id: productId, variants });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveProduct(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <Input
            name=""
            placeholder="ابحث عن المنتج"
            className="!px-5 min-w-[300px]"
          />

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
                <th className="p-4 text-center">الاسم</th>
                <th className="p-4 text-center">السعر</th>
                <th className="p-4 text-center">تاريخ الإنشاء</th>
                <th className="p-4 text-center">عدد القطع المباعة</th>
                <th className="p-4 text-center">تعديل</th>
                <th className="p-4 text-center">الطلبات</th>
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
                  <td className="p-4 text-center">0</td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        openEditModal(
                          product.id,
                          product.extraDetails?.variants || []
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
                    <span className="text-sm text-gray-600">
                      عدد القطع المباعه: 0
                    </span>
                    <button
                      onClick={() =>
                        openEditModal(
                          product.id,
                          product.extraDetails?.variants || []
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
    </>
  );
}

export default ProductsTable;
