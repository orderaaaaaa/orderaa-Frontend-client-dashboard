'use client';

import React, { useState, useEffect, useCallback } from 'react';

import FilterSection from './components/FilterSection';
import OrderCard from './components/OrderCard';
import Footer from './components/Footer';
import { Order, OrderStatus } from '@/types/orders';
import PageTaps from './pageTaps';
import { getOrders } from '@/lib/api/order';
import { useUnifiedFilters } from '@/hooks/AllOrders/useUnifiedFilters';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { exportOrdersToExcel } from '@/utils/exportOrders';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';

import { ScanLine } from 'lucide-react';

export default function AllOrdersRefactor() {
  const [select, setSelect] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const {
    apiFilters,
    localFilters,
    updateLocalFilters,
    page,
    goToPage,
    limit,
  } = useUnifiedFilters();

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();

  // React Hook Form setup
  const handleFormSubmit = useCallback((data: OrderFiltersFormData) => {
    updateLocalFilters(data);
  }, [updateLocalFilters]);

  const { control, formState: { errors } } = useFilterForm({
    onSubmit: handleFormSubmit,
  });

  // Handle order selection
  const handleOrderSelect = useCallback((orderId: number, checked: boolean) => {
    setSelectedOrderIds(prev => {
      if (checked) {
        return [...prev, orderId];
      } else {
        return prev.filter(id => id !== orderId);
      }
    });
  }, []);

  // Handle select all toggle
  const handleSelectAllToggle = useCallback(() => {
    if (selectedOrderIds.length === orders.length && orders.length > 0) {
      // Deselect all
      setSelectedOrderIds([]);
    } else {
      // Select all current page orders
      setSelectedOrderIds(orders.map(o => o.id));
    }
  }, [orders, selectedOrderIds]);

  // Clear selection when select mode is turned off
  useEffect(() => {
    if (!select) {
      setSelectedOrderIds([]);
    }
  }, [select]);

  // Handle Excel export
  const handleExportExcel = useCallback(async () => {
    try {
      let ordersToExport: Order[];

      if (select && selectedOrderIds.length > 0) {
        // Export only selected orders
        ordersToExport = orders.filter(order => selectedOrderIds.includes(order.id));

        if (ordersToExport.length === 0) {
          alert('الرجاء تحديد طلبات للتصدير');
          return;
        }

        const fileName = exportOrdersToExcel(ordersToExport, 'selected_orders');
        alert(`تم تصدير ${ordersToExport.length} طلب محدد بنجاح! \nاسم الملف: ${fileName}`);
      } else {
        // Export all filtered orders
        const exportFilters = { ...apiFilters, limit: 10000, page: 1 };
        const response = await getOrders(exportFilters);

        if (response.data.length === 0) {
          alert('لا توجد طلبات لتصديرها');
          return;
        }

        const fileName = exportOrdersToExcel(response.data, 'all_orders');
        alert(`تم تصدير ${response.data.length} طلب بنجاح! \nاسم الملف: ${fileName}`);
      }
    } catch (error) {
      alert('فشل في تصدير الطلبات. الرجاء المحاولة مرة أخرى.');
    }
  }, [apiFilters, select, selectedOrderIds, orders]);

  // Fetch orders from API with unified filters
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrders(apiFilters);
        setOrders(response.data);
        setTotalOrders(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        setError('فشل في تحميل الطلبات');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiFilters]);

  return (
    <div>
      <PageTaps
        data={orders}
        statusCounts={statistics?.statusCounts || {}}
        totalOrders={totalOrders}
      />

      <FilterSection
        control={control}
        errors={errors}
        options={{
          productOptions: options.productNames || [],
          sizeColorOptions: [...(options.productSizes || []), ...(options.productColors || [])],
          governorateOptions: options.governorates || [],
          areaOptions: options.areas || [],
        }}
      />

      <div className="flex justify-between mt-10 mb-6 select-none">
        <div className="flex items-center gap-4">
          <p className="text-gray-700">عدد جميع الطلبات: {totalOrders}</p>
          {select && (
            <button
              onClick={handleSelectAllToggle}
              className="px-4 py-2 text-sm bg-[#5D24E1] text-white rounded-lg hover:bg-[#682fee] transition-colors"
            >
              {selectedOrderIds.length === orders.length && orders.length > 0
                ? 'إلغاء تحديد الكل'
                : `تحديد الكل (${orders.length})`}
            </button>
          )}
          {select && selectedOrderIds.length > 0 && (
            <span className="text-sm text-gray-600">
              تم تحديد {selectedOrderIds.length} طلب
            </span>
          )}
        </div>
        {select ? (
          <ScanLine
            className="ml-5 cursor-pointer text-[#5D24E1]"
            onClick={() => setSelect(false)}
          />
        ) : (
          <ScanLine
            className="ml-5 cursor-pointer text-[#5D24E1]"
            onClick={() => setSelect(true)}
          />
        )}
      </div>

      {loading ? (
        <div className="relative">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1] mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
            </div>
          </div>
          <div className="opacity-30 pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 grid-rows-3 gap-3 flex-wrap my-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  select={select}
                  isSelected={selectedOrderIds.includes(order.id)}
                  onSelectionChange={(checked) => handleOrderSelect(order.id, checked)}
                  id={order.id}
                  code={order.code}
                  name={order.customer.name}
                  phone={order.customer.phoneNumber}
                  government={order.customer.governorate || 'غير محدد'}
                  items={order.orderProducts.map(
                    (op: any) => `${op.product.name}${op.product.size ? ` - ${op.product.size}` : ''}${op.product.color ? ` - ${op.product.color}` : ''}`
                  )}
                  price={order.totalCost}
                  trys={order.numberOfTriesToReach}
                  status={order.status}
                  city={order.customer.area || order.customer.city || 'غير محدد'}
                  alert={0}
                  createdAt={order.createdAt}
                />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 grid-rows-3 gap-3 flex-wrap my-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                select={select}
                isSelected={selectedOrderIds.includes(order.id)}
                onSelectionChange={(checked) => handleOrderSelect(order.id, checked)}
                id={order.id}
                code={order.code}
                name={order.customer.name}
                phone={order.customer.phoneNumber}
                government={order.customer.governorate || 'غير محدد'}
                items={order.orderProducts.map(
                  (op: any) => `${op.product.name}${op.product.size ? ` - ${op.product.size}` : ''}${op.product.color ? ` - ${op.product.color}` : ''}`
                )}
                price={order.totalCost}
                trys={order.numberOfTriesToReach}
                status={order.status}
                city={order.customer.area || order.customer.city || 'غير محدد'}
                alert={0}
                createdAt={order.createdAt}
              />
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              لا توجد طلبات
            </div>
          )}
        </>
      )}

      <Footer
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalOrders}
        hasNextPage={page < totalPages}
        hasPreviousPage={page > 1}
        onPageChange={goToPage}
        onPrevious={() => goToPage(Math.max(1, page - 1))}
        onNext={() => goToPage(Math.min(totalPages, page + 1))}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}
