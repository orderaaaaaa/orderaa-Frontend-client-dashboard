'use client';

import React, { useState, useCallback, useMemo } from 'react';
import BaseModal from '@/components/ui/base-modal';
import Input from '@/components/ui/Input';
import { LiaExchangeAltSolid } from 'react-icons/lia';
import type { Order } from '@/types/orders';

interface ChangeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSubmit: (orders: { id: number; packagingNote: string }[]) => Promise<void>;
  isLoading?: boolean;
}

export function ChangeProductModal({
  isOpen,
  onClose,
  orders,
  onSubmit,
  isLoading = false,
}: ChangeProductModalProps) {
  const [packagingNotes, setPackagingNotes] = useState<Record<number, string>>(
    {}
  );

  const handleNoteChange = useCallback((orderId: number, value: string) => {
    setPackagingNotes((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  }, []);

  const allFieldsFilled = useMemo(() => {
    return orders.every(
      (order) => packagingNotes[order.id]?.trim().length > 0
    );
  }, [orders, packagingNotes]);

  const handleSubmit = useCallback(async () => {
    const ordersWithNotes = orders.map((order) => ({
      id: order.id,
      packagingNote: packagingNotes[order.id]?.trim() || '',
    }));
    await onSubmit(ordersWithNotes);
    setPackagingNotes({});
  }, [orders, packagingNotes, onSubmit]);

  const handleClose = useCallback(() => {
    setPackagingNotes({});
    onClose();
  }, [onClose]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="تغيير المنتج"
      onConfirm={handleSubmit}
      confirmText="تغيير المنتج"
      confirmIcon={<LiaExchangeAltSolid className="w-5 h-5 text-white" />}
      confirmDisabled={!allFieldsFilled}
      isLoading={isLoading}
      maxWidth="w-[600px]"
      height="max-h-[80vh]"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          يرجى إدخال ملاحظة التغليف لكل طلب
        </p>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 w-1/3">
                  كود الطلب
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  سبب تغيير المنتج
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {order.code}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={packagingNotes[order.id] || ''}
                      onChange={(e) =>
                        handleNoteChange(order.id, e.target.value)
                      }
                      placeholder="أدخل ملاحظة التغليف..."
                      inputClassName="text-sm !bg-transparent"
                    />
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

export default ChangeProductModal;
