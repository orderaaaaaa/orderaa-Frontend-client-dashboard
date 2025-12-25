'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCustomer } from '../hooks/useGetCustomerId';

interface CustomerDetailsModalProps {
  customerId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  customerId,
  isOpen,
  onClose,
}) => {
  const { data, isLoading, isError, refetch } = useCustomer(customerId);

  // ✅ Fetch ONLY when modal opens
  useEffect(() => {
    if (isOpen && customerId) {
      refetch();
    }
  }, [isOpen, customerId, refetch]);

  if (!isOpen) return null;

  // Determine what to render
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-10">جاري التحميل...</div>;
    }

    if (isError) {
      return (
        <div className="text-center text-red-600">
          حدث خطأ أثناء تحميل البيانات
        </div>
      );
    }

    if (!data) {
      return <div className="text-center py-10">جاري التحميل...</div>;
    }

    // Data is available
    return (
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Detail label="الاسم" value={data.name} />
        <Detail label="البريد الإلكتروني" value={data.email || '—'} />
        <Detail label="عدد الطلبات" value={data.numberOfOrders} />
        <Detail label="إجمالي المشتريات" value={`${data.totalAmount} جنية`} />
        <Detail label="محظور" value={data.isBlocked ? 'نعم' : 'لا'} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">تفاصيل العميل</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

const Detail = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <span className="text-gray-500">{label}</span>
    <div className="font-medium text-gray-900">{value}</div>
  </div>
);

export default CustomerDetailsModal;
