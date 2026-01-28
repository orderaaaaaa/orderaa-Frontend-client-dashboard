'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
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

  const hasVariants = data?.variantCounts && data.variantCounts.length > 0;
  const totalOrders = data?.totalOrders ?? 0;

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full max-w-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto mx-4">
          <DialogPrimitive.Title className="text-lg font-semibold text-gray-900 mb-4">
            تفاصيل القطع المباعة
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="sr-only">
            تفاصيل القطع المباعة للمنتج
          </DialogPrimitive.Description>

          <DialogPrimitive.Close className="absolute top-6 left-6 hover:opacity-70 transition-opacity">
            <LiaTimesSolid className="w-5 h-5 text-gray-500 cursor-pointer" />
          </DialogPrimitive.Close>

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

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
