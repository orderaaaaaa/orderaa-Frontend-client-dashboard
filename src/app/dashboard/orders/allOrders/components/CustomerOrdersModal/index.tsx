import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Order } from '@/types/orders';
import { useCustomerOrders, useOrderStatusesQuery } from '@/services/orders';
import OrderCard from '../OrderCard';
import { Button } from '@/components/ui/button';
import BulkActionsBar from '@/components/BulkActionsBar';
import { exportOrdersToExcel } from '@/utils/exportOrders';

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

  // Use React Query for fetching customer orders
  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
  } = useCustomerOrders(customerPhone, { enabled: isOpen && !!customerPhone });

  const orders = ordersData?.data ?? [];
  const error = queryError ? 'فشل في تحميل طلبات العميل' : null;

  const { data: statusOptions } = useOrderStatusesQuery();

  const statusLabelsMap = useMemo(() => {
    if (!statusOptions) return new Map<string, string>();
    return new Map(statusOptions.map((s) => [s.key, s.label]));
  }, [statusOptions]);

  // Get selected orders as Order objects
  const selectedOrders = useMemo(() => {
    return orders.filter((order: Order) => selectedOrderIds.includes(order.id));
  }, [orders, selectedOrderIds]);

  // Reset selection when modal opens
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

  // Handle select all toggle
  const handleSelectAllToggle = useCallback(() => {
    if (selectedOrderIds.length === orders.length && orders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o: Order) => o.id));
    }
  }, [orders, selectedOrderIds]);

  // Handle Excel export for modal orders
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

  // Handle Edit Status
  const handleEditStatus = useCallback(() => {
    // TODO: Implement edit status functionality
    toast.info(`سيتم تعديل حالة ${selectedOrders.length} طلب`);
  }, [selectedOrders]);

  // Handle WhatsApp Share
  const handleShareWhatsApp = useCallback(() => {
    // TODO: Implement WhatsApp share functionality
    toast.info(`سيتم مشاركة ${selectedOrders.length} طلب عبر واتساب`);
  }, [selectedOrders]);

  // Handle Shipping
  const handleShipping = useCallback(() => {
    // TODO: Implement shipping functionality
    toast.info(`سيتم شحن ${selectedOrders.length} طلب`);
  }, [selectedOrders]);

  // Handle Other
  const handleOther = useCallback(() => {
    // TODO: Implement other functionality
    toast.info(`${selectedOrders.length} طلب محدد`);
  }, [selectedOrders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-[#5D24E1]/5 to-[#682fee]/5">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 4L24 21H4L14 4Z"
                  fill="#DC2626"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11V15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="14" cy="18" r="1" fill="white" />
              </svg>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-xs font-bold text-white">
                  {orders.length}
                </span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="test-lg sm:text-2xl font-bold text-gray-800">
                جميع طلبات العميل
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {customerName && customerName !== 'غير محدد'
                  ? customerName + ' - '
                  : ''}
                <span dir="ltr" className="inline-block">
                  {customerPhone}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="cursor-pointer w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Selection toolbar */}
        {orders.length > 0 && !loading && !error && (
          <div className="flex items-center justify-between px-8 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSelectAllToggle}
                className="px-4 py-2 text-sm bg-[#5D24E1] text-white rounded-lg hover:bg-[#682fee] transition-colors"
              >
                {selectedOrderIds.length === orders.length &&
                orders.length > 0 ? (
                  'إلغاء تحديد الكل'
                ) : (
                  <span className="flex items-center gap-2">
                    تحديد الكل
                    <span className="bg-white text-[#5D24E1] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
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

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5D24E1] mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg">
                  جاري تحميل الطلبات...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-500 text-lg">
                  لا توجد طلبات لهذا العميل
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
              {orders.map((order: Order) => (
                <div key={order.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={(e) =>
                      handleCheckboxChange(order.id, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="relative right-10 z-100 w-5 h-5 mt-2 border-2 border-[#5D24E1] rounded-[4px] cursor-pointer accent-[#5D24E1] flex-shrink-0"
                  />
                  <OrderCard
                    id={order.id}
                    select={false}
                    isSelected={false}
                    code={order.code}
                    name={order.customers.name}
                    phoneNumbers={order.customers.phone_numbers}
                    government={
                      order.governorate ||
                      order.externalGovernorate ||
                      'غير محدد'
                    }
                    items={order.order_products.map(
                      (op: any) =>
                        `${op.products.name}${
                          op.products.size ? ` - ${op.products.size}` : ''
                        }${op.products.color ? ` - ${op.products.color}` : ''}`
                    )}
                    price={order.totalCost}
                    trys={order.numberOfTriesToReach}
                    status={order.status}
                    city={
                      order.customers.area || order.customers.city || 'غير محدد'
                    }
                    address={order.customers.address || 'غير محدد'}
                    alert={0}
                    createdAt={order.createdAt}
                    repeatCount={orders.length}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`px-8 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl ${
            selectedOrders.length > 0 ? 'pb-20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <Button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#5D24E1] text-white rounded-full hover:bg-[#682fee] transition-colors font-medium"
            >
              إغلاق
            </Button>
            <p className="text-sm text-gray-600">
              إجمالي الطلبات:{' '}
              <span className="font-bold text-[#5D24E1]">{orders.length}</span>
            </p>
          </div>
        </div>

        {/* Bulk Actions Bar - absolute positioned inside modal */}
        <BulkActionsBar
          selectedOrders={selectedOrders}
          onEditStatus={handleEditStatus}
          onExportExcel={handleExportExcel}
          onShareWhatsApp={handleShareWhatsApp}
          onShipping={handleShipping}
          onOther={handleOther}
          position="absolute"
          className="rounded-b-2xl"
        />
      </div>
    </div>
  );
}
