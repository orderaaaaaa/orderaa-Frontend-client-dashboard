'use client';

import React, { useState, useEffect, useCallback } from 'react';

import FilterSection from './components/FilterSection';
import OrderCard from './components/OrderCard';
import Footer from './components/Footer';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import { Order, OrderStatus } from '@/types/orders';
import PageTaps from './pageTaps';
import { getOrders } from '@/lib/api/order';
import { useUnifiedFilters } from '@/hooks/AllOrders/useUnifiedFilters';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { useInfiniteScroll } from '@/hooks/AllOrders/useInfiniteScroll';
import { exportOrdersToExcel } from '@/utils/exportOrders';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { Breadcrumb } from '@/components/dashboard-layout';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';

import { ScanLine, ArrowUp, Calendar, ArrowLeft } from 'lucide-react';
import { mockOrders, mockStatistics } from '@/mocks/mockData';

export default function AllOrdersRefactor() {
  const [select, setSelect] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
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
    updateLimit,
  } = useUnifiedFilters();

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();

  // React Hook Form setup
  const handleFormSubmit = useCallback(
    (data: OrderFiltersFormData) => {
      updateLocalFilters(data);
    },
    [updateLocalFilters]
  );

  const {
    control,
    formState: { errors },
  } = useFilterForm({
    onSubmit: handleFormSubmit,
  });

  // Handle order selection
  const handleOrderSelect = useCallback((orderId: number, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      if (checked) {
        return [...prev, orderId];
      } else {
        return prev.filter((id) => id !== orderId);
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
      setSelectedOrderIds(orders.map((o) => o.id));
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
        ordersToExport = orders.filter((order) =>
          selectedOrderIds.includes(order.id)
        );

        if (ordersToExport.length === 0) {
          alert('الرجاء تحديد طلبات للتصدير');
          return;
        }

        const fileName = exportOrdersToExcel(ordersToExport, 'selected_orders');
        alert(
          `تم تصدير ${ordersToExport.length} طلب محدد بنجاح! \nاسم الملف: ${fileName}`
        );
      } else {
        // Export all filtered orders
        try {
          // Try API first
          const exportFilters = { ...apiFilters, limit: 10000, page: 1 };
          const response = await getOrders(exportFilters);

          if (response.data.length === 0) {
            alert('لا توجد طلبات لتصديرها');
            return;
          }

          const fileName = exportOrdersToExcel(response.data, 'all_orders');
          alert(
            `تم تصدير ${response.data.length} طلب بنجاح! \nاسم الملف: ${fileName}`
          );
        } catch (apiErr) {
          // Fallback to current orders in memory (mock or loaded data)
          console.warn('API failed for export, using current orders');
          if (orders.length === 0) {
            alert('لا توجد طلبات لتصديرها');
            return;
          }

          const fileName = exportOrdersToExcel(orders, 'all_orders');
          alert(
            `تم تصدير ${orders.length} طلب بنجاح! \nاسم الملف: ${fileName}`
          );
        }
      }
    } catch (error) {
      alert('فشل في تصدير الطلبات. الرجاء المحاولة مرة أخرى.');
    }
  }, [apiFilters, select, selectedOrderIds, orders]);

  const calculateRepeatCounts = useCallback((ordersList: Order[]) => {
    const phoneCounts: Record<string, number> = {};

    ordersList.forEach((order) => {
      const phone = order.customers.phoneNumber;
      if (phone && phone !== 'غير محدد') {
        phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
      }
    });

    return phoneCounts;
  }, []);

  const [repeatCounts, setRepeatCounts] = useState<Record<string, number>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll to show/hide back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleRepeatClick = useCallback((phone: string, name: string) => {
    setSelectedCustomerPhone(phone);
    setSelectedCustomerName(name);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCustomerPhone('');
    setSelectedCustomerName('');
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || page >= totalPages) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;

      try {
        // Try API first
        const response = await getOrders({ ...apiFilters, page: nextPage });

        setOrders((prevOrders) => [...prevOrders, ...response.data]);
        goToPage(nextPage);

        const allOrders = [...orders, ...response.data];
        const counts = calculateRepeatCounts(allOrders);
        setRepeatCounts(counts);
      } catch (apiErr) {
        // For mock data, we don't need to load more as it's all client-side
        console.warn('Load more not available in mock mode');
      }
    } catch (err) {
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, page, totalPages, apiFilters, orders, goToPage, calculateRepeatCounts]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore: page < totalPages,
    isLoading: isLoadingMore,
  });

  // Fetch orders from API with unified filters
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch from API first
        const response = await getOrders(apiFilters);
        setOrders(response.data);
        setTotalOrders(response.total);
        setTotalPages(response.totalPages);

        const counts = calculateRepeatCounts(response.data);
        setRepeatCounts(counts);
      } catch (err) {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', err);
        const response = mockOrders;
        setOrders(response);
        setTotalOrders(response.length);
        setTotalPages(Math.ceil(response.length / limit));

        const counts = calculateRepeatCounts(response);
        setRepeatCounts(counts);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiFilters, calculateRepeatCounts, limit]);

  return (
    <div>
      <div className='flex flex-row items-center justify-between mb-7'>
        <Breadcrumb
          items={[
            { title: 'الطلبات', href: '/dashboard/orders' },
            { title: 'جميع الطلبات' },
          ]}
        />

        <div className="flex items-center gap-3">
          <Input
            type="date"
            name="fromDate"
            placeholder="من تاريخ"
            icon={Calendar}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 text-sm border border-[#CED4DA] rounded-[4px] placeholder:!text-black"
          />

          <ArrowLeft className="text-[#5D24E1]" size="20" />

          <Input
            type="date"
            name="toDate"
            placeholder="الى تاريخ"
            icon={Calendar}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 text-sm border border-[#CED4DA] rounded-[4px]"
          />
          <Dropdown
            value={timePeriod}
            onChange={setTimePeriod}
            options={[
              { key: 'day', value: 'يوم' },
              { key: 'week', value: 'اسبوع' },
              { key: 'month', value: 'شهر' },
              { key: 'quarter', value: 'ربع سنوي' },
              { key: 'year', value: 'سنه' },
            ]}
            placeholder="الفترة الزمنية"
            className="w-[180px]"
            selectClassName="border border-[#CED4DA] rounded-lg py-2.5 pl-10 pr-3 text-[16px] h-10"
          />
        </div>
      </div>

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
          sizeColorOptions: [
            ...(options.productSizes || []),
            ...(options.productColors || []),
          ],
          governorateOptions: options.governorates || [],
          areaOptions: options.areas || [],
        }}
      />
      3
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

      {loading && orders.length === 0 ? (
        <div className="relative">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1] mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 grid-rows-3 gap-3 flex-wrap my-4 justify-items-center">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                select={select}
                isSelected={selectedOrderIds.includes(order.id)}
                onSelectionChange={(checked) =>
                  handleOrderSelect(order.id, checked)
                }
                id={order.id}
                code={order.code}
                name={order.customers.name}
                phone={order.customers.phoneNumber}
                altPhone={order.customers.altPhone}
                government={order.customers.governorate || 'غير محدد'}
                items={order.order_products.map(
                  (op: any) =>
                    `${op.products.name}${op.products.size ? ` - ${op.products.size}` : ''
                    }${op.products.color ? ` - ${op.products.color}` : ''}`
                )}
                price={order.totalCost}
                trys={order.numberOfTriesToReach}
                status={order.status}
                city={order.customers.area || order.customers.city || 'غير محدد'}
                alert={0}
                createdAt={order.createdAt}
                repeatCount={repeatCounts[order.customers.phoneNumber] || 0}
                onRepeatClick={() => handleRepeatClick(order.customers.phoneNumber, order.customers.name)}
              />
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">لا توجد طلبات</div>
          )}

          {page < totalPages && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D24E1]"></div>
            </div>
          )}
        </>
      )}

      <CustomerOrdersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customerPhone={selectedCustomerPhone}
        customerName={selectedCustomerName}
      />

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
        currentPageSize={limit}
        onPageSizeChange={updateLimit}
        hasSelectedOrders={selectedOrderIds.length > 0}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 p-4 bg-[#5D24E1] text-white rounded-full shadow-lg hover:bg-[#682fee] transition-all duration-300 hover:scale-110"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
