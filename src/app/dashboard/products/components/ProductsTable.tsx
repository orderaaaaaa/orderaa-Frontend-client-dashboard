'use client';

import React, { useState } from 'react';
import { LiaEditSolid } from 'react-icons/lia';
import { FaRegSquare } from 'react-icons/fa6';
import { PiCheckSquareFill } from 'react-icons/pi';
import { ListChecks } from 'lucide-react';

import { useGetProducts } from '../hooks/useProduct';
import { useProductStore } from '../store/useProductStore';
import Input from '@/components/ui/Input';

function ProductsTable() {
  const { page, limit } = useProductStore();
  const { data, isLoading } = useGetProducts(page, limit);

  const [showCheckboxes, setShowCheckboxes] = useState(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
        <Input
          name=""
          placeholder="ابحث عن المنتج"
          className="!px-5 min-w-[300px]"
        />

        <button
          onClick={() => setShowCheckboxes(!showCheckboxes)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-primary cursor-pointer text-white border-primary hover:opacity-90 transition-opacity"
        >
          <ListChecks className="w-5 h-5" />
          {showCheckboxes ? 'إخفاء التحديد' : 'تحديد المنتجات'}
        </button>
      </div>

      {/* ===== Desktop Table ===== */}
      <div className="hidden md:block overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-right border-collapse" dir="rtl">
          <thead>
            <tr className="bg-gray-50 border-b text-primary">
              <th className="p-4 w-12 text-center">
                {showCheckboxes && (
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center w-full"
                  >
                    {selectedIds.length > 0 &&
                    selectedIds.length === data?.data.length ? (
                      <PiCheckSquareFill className="w-6 h-6" />
                    ) : (
                      <FaRegSquare className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                )}
              </th>
              <th className="p-4 font-bold text-sm">صورة المنتج</th>
              <th className="p-4 font-bold text-sm">الاسم</th>
              <th className="p-4 font-bold text-sm">السعر</th>
              <th className="p-4 font-bold text-sm">تاريخ الإنشاء</th>
              <th className="p-4 font-bold text-sm text-center">المباع</th>
              <th className="p-4 font-bold text-sm text-center">تعديل</th>
              <th className="p-4 font-bold text-sm text-center">الطلبات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data?.data.map((product) => (
              <tr
                key={product.id}
                className={`transition-colors ${
                  selectedIds.includes(product.id)
                    ? 'bg-blue-50/40'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-4 text-center">
                  {showCheckboxes && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  )}
                </td>

                <td className="p-4">
                  <img
                    src={
                      product.images?.[0] || 'https://placehold.net/600x600.png'
                    }
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover border bg-gray-50"
                  />
                </td>

                <td className="p-4 font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="p-4 text-gray-600">{product.price}</td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(product.createdAt).toLocaleDateString('en-US')}
                </td>
                <td className="p-4 text-center text-gray-600">0</td>

                {/* Centered Edit Button */}
                <td className="p-4">
                  <div className="flex justify-center items-center">
                    <button className="text-primary flex items-center gap-1 hover:underline font-medium">
                      <LiaEditSolid className="w-5 h-5" />
                      <span>تعديل</span>
                    </button>
                  </div>
                </td>

                <td className="p-4 text-center">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    {product.totalOrders}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile Cards (kept for responsiveness) ===== */}
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
            <div className="flex gap-4">
              <img
                src={product.images?.[0] || 'https://placehold.net/600x600.png'}
                className="w-20 h-20 rounded-lg object-cover border"
              />

              <div className="flex-1 space-y-1 text-right" dir="rtl">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">السعر: {product.price}</p>
                <p className="text-sm text-gray-400">
                  {new Date(product.createdAt).toLocaleDateString('en-US')}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    الطلبات: {product.totalOrders}
                  </span>
                  <button className="text-primary text-sm flex items-center gap-1 font-medium">
                    <LiaEditSolid /> تعديل
                  </button>
                </div>
              </div>

              {showCheckboxes && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="mt-1 w-5 h-5 text-primary rounded border-gray-300"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsTable;
