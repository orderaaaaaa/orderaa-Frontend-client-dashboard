'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useGetProductVariantCounts } from '../../hooks/useProduct';
import { Button } from '@/components/ui/button';

interface Props {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductVariantCountsModal({
  productId,
  isOpen,
  onClose,
}: Props) {
  const { data, isLoading } = useGetProductVariantCounts(productId);

  if (!isOpen) return null;

  const hasVariants = data?.variantCounts && data.variantCounts.length > 0;
  const totalOrders = data?.totalOrders ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 md:p-0">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            تفاصيل القطع المباعة
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
          </div>
        ) : !hasVariants ? (
          <div className="text-center py-10 text-gray-500">
            لا توجد بيانات للقطع المباعة
          </div>
        ) : (
          <div className="space-y-3">
            {data.variantCounts.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded-lg px-4 py-2"
              >
                <div className="text-sm text-gray-700 truncate">
                  {item.label}:{' '}
                  <span className="font-medium">{item.value}</span>
                </div>
                <span className="font-semibold text-primary">{item.count}</span>
              </div>
            ))}

            <div className="border-t pt-3 text-right text-sm text-gray-600">
              إجمالي الطلبات:{' '}
              <span className="font-semibold text-gray-900">{totalOrders}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
