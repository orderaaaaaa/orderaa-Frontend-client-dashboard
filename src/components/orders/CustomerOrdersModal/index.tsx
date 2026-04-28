import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LiaExclamationTriangleSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import type { Order } from '@/types/orders';
import { useCustomerOrders, useOrderStatusesQuery } from '@/services/orders';
import OrderCard from '../../../app/dashboard/orders/allOrders/components/OrderCard';
import { Button } from '@/components/ui/button';
import BulkActionsBar from '@/components/BulkActionsBar';
import { exportOrdersToExcel } from '@/utils/exportOrders';
import { useUpdateOrdersBatch } from '@/app/dashboard/orders/allOrders/hooks/useUpdateOrdersBatch';
import type { OrderStatusKey } from '@/app/dashboard/orders/allOrders/types/Bulk';
import BaseModal from '@/components/ui/base-modal';
import PageLoading from '@/components/ui/page-loading';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPhone: string;
  customerName: string;
}

export default function CustomerOrdersModal({
  isOpen,
  onClose,
  customerPhone,
  customerName,
}: CustomerOrdersModalProps) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
  } = useCustomerOrders(customerPhone, { enabled: isOpen && !!customerPhone });

  const orders = ordersData?.data ?? [];
  const error = queryError ? 'فشل في تحميل طلبات العميل' : null;

  const { data: statusOptions } = useOrderStatusesQuery();
  const { mutateAsync: batchUpdateOrders } = useUpdateOrdersBatch();

  const statusLabelsMap = useMemo(() => {
    if (!statusOptions) return new Map<string, string>();
    return new Map(statusOptions.map((s) => [s.key, s.label]));
  }, [statusOptions]);

  const selectedOrders = useMemo(() => {
    return orders.filter((order: Order) => selectedOrderIds.includes(order.id));
  }, [orders, selectedOrderIds]);

  useEffect(() => {
    if (isOpen) {
      setSelectedOrderIds([]);
    }
  }, [isOpen]);

  const handleCheckboxChange = useCallback(
    (orderId: number, checked: boolean) => {
      if (checked) {
        setSelectedOrderIds((prev) => [...prev, orderId]);
      } else {
        setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
      }
    },
    []
  );

  const handleSelectAllToggle = useCallback(() => {
    if (selectedOrderIds.length === orders.length && orders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o: Order) => o.id));
    }
  }, [orders, selectedOrderIds]);

  const handleExportExcel = useCallback(() => {
    try {
      if (selectedOrders.length === 0) {
        toast.warning('الرجاء تحديد طلبات للتصدير');
        return;
      }

      const fileName = exportOrdersToExcel(
        selectedOrders,
        `customer_${customerPhone}_orders`,
        statusLabelsMap
      );
      toast.success(
        `تم تصدير ${selectedOrders.length} طلب بنجاح! \nاسم الملف: ${fileName}`
      );
    } catch (err) {
      toast.error('فشل في تصدير الطلبات. الرجاء المحاولة مرة أخرى.');
    }
  }, [selectedOrders, customerPhone, statusLabelsMap]);

  const handleEditStatus = useCallback(
    async (statusKey: string) => {
      if (!statusKey || selectedOrderIds.length === 0) return;
      try {
        await batchUpdateOrders({
          orders: selectedOrderIds.map((id) => ({
            id,
            updates: { status: statusKey as OrderStatusKey },
          })),
        });
        toast.success(`تم تعديل حالة ${selectedOrderIds.length} طلب بنجاح`);
        setSelectedOrderIds([]);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'فشل تعديل حالة الطلبات');
      }
    },
    [selectedOrderIds, batchUpdateOrders]
  );

  const handleShareWhatsApp = useCallback(() => {
    toast.info(`سيتم مشاركة ${selectedOrders.length} طلب عبر واتساب`);
  }, [selectedOrders]);

  const handleShipping = useCallback(() => {
    toast.info(`سيتم شحن ${selectedOrders.length} طلب`);
  }, [selectedOrders]);

  const handleOther = useCallback(() => {
    toast.info(`${selectedOrders.length} طلب محدد`);
  }, [selectedOrders]);

  const modalTitle = useMemo(() => {
    const nameText = customerName && customerName !== 'غير محدد' ? `${customerName} - ` : '';
    return `جميع طلبات العميل (${nameText}${customerPhone})`;
  }, [customerName, customerPhone]);

  
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      showFooter={false}
      maxWidth="md:max-w-6xl"
    >
      <div className="relative">
        {orders.length > 0 && !loading && !error && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-red-600">
                <LiaExclamationTriangleSolid className="w-5 h-5" />
                <span className="text-sm font-bold">
                  إجمالي الطلبات: {orders.length}
                </span>
              </div>
              <Button
                type="button"
                onClick={handleSelectAllToggle}
                size="sm"
                className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-[#682fee] transition-colors"
              >
                {selectedOrderIds.length === orders.length && orders.length > 0 ? (
                  'إلغاء تحديد الكل'
                ) : (
                  <span className="flex items-center gap-2">
                    تحديد الكل
                    <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {orders.length}
                    </span>
                  </span>
                )}
              </Button>
              {selectedOrderIds.length > 0 && (
                <span className="text-sm text-gray-600">
                  تم تحديد {selectedOrderIds.length} طلب
                </span>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <PageLoading message="جاري تحميل الطلبات..." size="sm" className="py-16 min-h-0" />
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-500 text-lg">لا توجد طلبات لهذا العميل</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order: Order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                select={true}
                isSelected={selectedOrderIds.includes(order.id)}
                onSelectionChange={(checked) =>
                  handleCheckboxChange(order.id, checked)
                }
                code={order.code}
                name={order.customers.name}
                phoneNumbers={order.customers.phone_numbers}
                government={
                  order.governorate ||
                  order.externalGovernorate ||
                  'غير محدد'
                }
                items={order.order_products.map((op: any) => {
                  const productName = op.products?.name || 'منتج غير معروف';
                  const variantDetails =
                    op.variants && op.variants.length > 0
                      ? op.variants.map((v: any) => v.value).join('')
                      : '';
                  return variantDetails
                    ? `${productName} - ${variantDetails}`
                    : productName;
                })}
                price={order.totalCost}
                shippingType={order.shippingType}
                trys={order.numberOfTriesToReach}
                status={order.status}
                city={
                  order.customers.area || order.customers.city || 'غير محدد'
                }
                address={order.address || 'غير محدد'}
                alert={0}
                createdAt={order.createdAt}
                repeatCount={orders.length}
                showAllItems
                states={order.states}
                isBlocked={order.customers.isBlocked}
                customerNotes={order.customers.notes}
                hideCustomerInfo
              />
            ))}
          </div>
        )}

        <BulkActionsBar
          selectedOrders={selectedOrders}
          onEditStatus={handleEditStatus}
          statusOptions={statusOptions || []}
          onExportExcel={handleExportExcel}
          onShareWhatsApp={handleShareWhatsApp}
          onShipping={handleShipping}
          onOther={handleOther}
          position="absolute"
        />
      </div>
    </BaseModal>
  );
}
