'use client';

import React from 'react';
import PageLoading from '@/components/ui/page-loading';
import BaseModal from '@/components/ui/base-modal';
import { ErrorState } from '@/components/ui/state-panels';
import { useGetProductAttributeCounts } from '../../hooks/useProduct';

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
  const { data, isLoading, isError, error, refetch } =
    useGetProductAttributeCounts(productId);

  const counts = data?.attributeCounts ?? [];
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
      ) : isError ? (
        <ErrorState
          error={error}
          fallback="تعذر تحميل تفاصيل القطع المباعة"
          onRetry={() => refetch()}
          className="py-8"
        />
      ) : counts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          لا توجد بيانات للقطع المباعة
        </div>
      ) : (
        <div className="space-y-3">
          {counts.map((item) => (
            <div
              key={`${item.label}|${item.value}`}
              className="flex justify-between items-center gap-3 border rounded-lg px-4 py-2"
            >
              <div className="text-sm text-gray-700 min-w-0 break-words">
                <span className="font-medium">{item.label}</span>
                {item.value && <span>: {item.value}</span>}
              </div>
              <span className="font-semibold text-primary shrink-0">
                {item.count}
              </span>
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
