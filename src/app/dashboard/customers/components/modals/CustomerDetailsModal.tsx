'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCustomer } from '../../hooks/useGetCustomerId';
import OrdersTab from './CustomerModalComponents/CustomersDetailsOrders';
import StatsTab from './CustomerModalComponents/CustomersDetailsStats';
import { Customer, Order } from '../../types/customer';
import { CustomersDetailsHeader } from './CustomerModalComponents/CustomersDetailsHeader';
import CustomersDetailsShare from './CustomerModalComponents/CustomersDetailsShare';
import CustomersDetailsTotalStats from './CustomerModalComponents/CustomersDetailsTotalStats';

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
  const { data, isLoading, isError, refetch } = useCustomer(customerId) as {
    data: (Customer & { orders: Order[] }) | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  useEffect(() => {
    if (isOpen && customerId) {
      refetch();
    }
  }, [isOpen, customerId, refetch]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1]"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-10 text-center text-red-600">
          حدث خطأ أثناء تحميل البيانات
        </div>
      </div>
    );
  }

  const orders = data.orders || [];
  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
  const returned = orders.filter(
    (o) => o.status === 'RETURNED_DELIVERED'
  ).length;

  const deliveryRate =
    totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
  const cancellationRate =
    totalOrders > 0 ? Math.round((cancelled / totalOrders) * 100) : 0;
  const returnRate =
    totalOrders > 0 ? Math.round((returned / totalOrders) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 md:p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="p-2 absolute hover:bg-gray-100 rounded-lg left-3 top-3 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 md:p-8">
          <CustomersDetailsHeader
            isBlocked={data.isBlocked}
            username={data.name}
          />

          <CustomersDetailsShare
            email={data.email}
            phoneNumbers={data.phoneNumbers}
          />

          <CustomersDetailsTotalStats
            latestOrder={data.latestOrder}
            delivered={delivered}
            email={data.email}
            numberOfOrders={data.numberOfOrders}
            totalAmount={data.totalAmount}
            returned={returned}
            phoneNumbers={data.phoneNumbers}
          />

          <div className="mt-4">
            <StatsTab
              deliveryRate={deliveryRate}
              cancellationRate={cancellationRate}
              returnRate={returnRate}
              totalOrders={totalOrders}
              delivered={delivered}
              cancelled={cancelled}
              returned={returned}
            />
            <OrdersTab orders={data.orders} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
