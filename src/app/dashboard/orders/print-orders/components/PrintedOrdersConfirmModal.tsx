'use client';

import React, { useEffect, useState } from 'react';
import BaseModal from '@/components/ui/base-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { LiaCheckCircleSolid } from 'react-icons/lia';
import { Order } from '@/types/orders';

interface PrintedOrdersConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOrderIds: number[]) => void;
  printedOrders: Order[];
  isLoading?: boolean;
}

export function PrintedOrdersConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  printedOrders,
  isLoading = false,
}: PrintedOrdersConfirmModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(printedOrders.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [isOpen, printedOrders]);

  const allChecked =
    printedOrders.length > 0 &&
    printedOrders.every((o) => selectedIds.has(o.id));
  const someChecked = printedOrders.some((o) => selectedIds.has(o.id));

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(printedOrders.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedIds));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="طلبات تم طباعتها مسبقاً"
      onConfirm={handleConfirm}
      confirmText={`تأكيد (${selectedIds.size})`}
      confirmIcon={<LiaCheckCircleSolid className="w-5 h-5 text-white" />}
      cancelText="إلغاء"
      isLoading={isLoading}
      confirmDisabled={selectedIds.size === 0}
      maxWidth="max-w-[500px]"
      height="max-h-[70vh]"
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-700 text-base">
          الطلبات التالية تم طباعتها مسبقاً. حدد الطلبات التي تريد متابعة العملية معها.
        </p>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 w-12 text-center">
                  <Checkbox
                    checked={
                      allChecked
                        ? true
                        : someChecked
                          ? 'indeterminate'
                          : false
                    }
                    onCheckedChange={(checked) =>
                      toggleAll(
                        !!checked && checked !== 'indeterminate'
                          ? true
                          : !someChecked,
                      )
                    }
                  />
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-16">
                  #
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                  كود الطلب
                </th>
              </tr>
            </thead>
            <tbody>
              {printedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-3 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.has(order.id)}
                      onCheckedChange={() => toggleOne(order.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 break-words whitespace-normal">
                    {order.code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaseModal>
  );
}
