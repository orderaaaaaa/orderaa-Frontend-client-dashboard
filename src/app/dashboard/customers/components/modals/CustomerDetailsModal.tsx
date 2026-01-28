'use client';

import React, { useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { LiaTimesSolid } from 'react-icons/lia';
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
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-[95vw] sm:w-[90vw] md:w-auto md:max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogPrimitive.Title className="sr-only">
            تفاصيل العميل
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            عرض تفاصيل العميل والطلبات والإحصائيات
          </DialogPrimitive.Description>

          <DialogPrimitive.Close className="p-2 absolute hover:bg-gray-100 rounded-lg left-3 top-3 cursor-pointer z-10">
            <LiaTimesSolid className="w-5 h-5" />
          </DialogPrimitive.Close>

          {isLoading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : isError || !data ? (
            <div className="p-10 text-center text-red-600">
              حدث خطأ أثناء تحميل البيانات
            </div>
          ) : (
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
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CustomerDetailsModal;
