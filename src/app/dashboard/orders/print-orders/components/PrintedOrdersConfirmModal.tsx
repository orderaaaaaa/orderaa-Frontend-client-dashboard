'use client';

import React from 'react';
import BaseModal from '@/components/ui/base-modal';
import { LiaCheckCircleSolid } from 'react-icons/lia';
import { Order } from '@/types/orders';

interface PrintedOrdersConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="طلبات تم طباعتها مسبقاً"
      onConfirm={onConfirm}
      confirmText="تأكيد"
      confirmIcon={<LiaCheckCircleSolid className="w-5 h-5 text-white" />}
      cancelText="إلغاء"
      isLoading={isLoading}
      maxWidth="max-w-[500px]"
      height="max-h-[70vh]"
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-700 text-base">
          الطلبات التالية تم طباعتها مسبقاً. هل تريد المتابعة؟
        </p>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
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
