'use client';

import React from 'react';
import PageLoading from '@/components/ui/page-loading';
import BaseModal from '@/components/ui/base-modal';
import { useGetProductVariantCounts } from '../../hooks/useProduct';

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

  const hasVariants = data?.variantCounts && data.variantCounts.length > 0;
  const totalOrders = data?.totalOrders ?? 0;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تفاصيل القطع المباعة"
      showFooter={false}
      maxWidth="md:max-w-lg"
    >
      {isLoading ? (
        <PageLoading size="sm" className="py-10 min-h-0" />
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
                {item.attribute}:{' '}
                <span className="font-medium">{item.option}</span>
              </div>
              <span className="font-semibold text-primary">{item.count}</span>
            </div>
          ))}

          <div className="border-t pt-3 text-end text-sm text-gray-600">
            إجمالي الطلبات:{' '}
            <span className="font-semibold text-gray-900">{totalOrders}</span>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
