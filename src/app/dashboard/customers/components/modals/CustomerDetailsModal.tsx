'use client';

import React, { useEffect } from 'react';
import BaseModal from '@/components/ui/base-modal';
import LoadingAnimation from '@/components/ui/loadingAnimation';
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

  const orders = data?.orders || [];
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تفاصيل العميل"
      showFooter={false}
      maxWidth="md:max-w-6xl"
    >
      {isLoading ? (
        <LoadingAnimation />
      ) : isError || !data ? (
        <div className="p-10 text-center text-red-600">
          حدث خطأ أثناء تحميل البيانات
        </div>
      ) : (
        <div>
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
      )}
    </BaseModal>
  );
};

export default CustomerDetailsModal;
