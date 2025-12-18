'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import FilterSection from './components/FilterSection';
import OrderCard from './components/OrderCard';
import Footer from './components/Footer';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import BulkActionsBar from '@/components/BulkActionsBar';
import type { Order } from '@/types/orders';
import PageTaps from './pageTaps';
import { useUnifiedFilters } from '@/hooks/AllOrders/useUnifiedFilters';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { exportOrdersToExcel } from '@/utils/exportOrders';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { Breadcrumb } from '@/components/dashboard-layout';
import { DatePicker } from '@/components/ui/datepicker';
import { useOrders, useFetchOrdersForExport } from '@/services/orders';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Scan, ScanLine, ArrowUp, ArrowLeft, X } from 'lucide-react';

export default function AllOrdersRefactor() {
  const [select, setSelect] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [timePeriod, setTimePeriod] = useState('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const {
    apiFilters,
    updateLocalFilters,
    goToPage,
    page,
    limit,
    updateLimit,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
  } = useUnifiedFilters();

  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
  } = useOrders(apiFilters);

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();
  const { fetchOrdersForExport } = useFetchOrdersForExport();

  const orders = ordersData?.data ?? [];
  const totalOrders = ordersData?.total ?? 0;
  const totalPages = ordersData?.totalPages ?? 1;
  const currentPage = ordersData?.page ?? 1;
  const error = queryError?.message ?? null;

  // Track previous page to detect page changes (initialized with current page to skip initial scroll)
  const prevPageRef = useRef<number>(page);

  // Scroll to top when page changes
  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  // Calculate repeat counts from orders
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

  const repeatCounts = useMemo(() => {
    return calculateRepeatCounts(orders);
  }, [orders, calculateRepeatCounts]);

  // Get selected orders as Order objects for BulkActionsBar
  const selectedOrders = useMemo(() => {
    return orders.filter((order) => selectedOrderIds.includes(order.id));
  }, [orders, selectedOrderIds]);

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
    setValue,
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
          toast.warning('الرجاء تحديد طلبات للتصدير');
          return;
        }

        const fileName = exportOrdersToExcel(ordersToExport, 'selected_orders');
        toast.success(
          `تم تصدير ${ordersToExport.length} طلب محدد بنجاح! \nاسم الملف: ${fileName}`
        );
      } else {
        // Export all filtered orders
        try {
          const response = await fetchOrdersForExport(apiFilters);

          if (response.data.length === 0) {
            toast.warning('لا توجد طلبات لتصديرها');
            return;
          }

          const fileName = exportOrdersToExcel(response.data, 'all_orders');
          toast.success(
            `تم تصدير ${response.data.length} طلب بنجاح! \nاسم الملف: ${fileName}`
          );
        } catch (apiErr) {
          // Fallback to current orders in memory
          console.warn('API failed for export, using current orders');
          if (orders.length === 0) {
            toast.warning('لا توجد طلبات لتصديرها');
            return;
          }

          const fileName = exportOrdersToExcel(orders, 'all_orders');
          toast.success(
            `تم تصدير ${orders.length} طلب بنجاح! \nاسم الملف: ${fileName}`
          );
        }
      }
    } catch (error) {
      toast.error('فشل في تصدير الطلبات. الرجاء المحاولة مرة أخرى.');
    }
  }, [apiFilters, select, selectedOrderIds, orders, fetchOrdersForExport]);

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


  const showBulkActions = selectedOrders.length > 0 && !isModalOpen;

  // Add padding to body when bulk actions bar is visible
  useEffect(() => {
    if (showBulkActions) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '0px';
    }
    return () => {
      document.body.style.paddingBottom = '0px';
    };
  }, [showBulkActions]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-7 w-full'>
        <Breadcrumb
          items={[
            { title: 'الطلبات', href: '/dashboard/orders' },
            { title: 'جميع الطلبات' },
          ]}
        />

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 w-full sm:w-auto">
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            placeholder="من تاريخ"
            showIcon={true}
            className="w-[120px] sm:w-[140px]"
            maxDate={toDate || undefined}
          />

          <ArrowLeft className="text-[#5D24E1] flex-shrink-0" size="20" />

          <DatePicker
            selected={toDate}
            onChange={setToDate}
            placeholder="إلى تاريخ"
            showIcon={true}
            className="w-[120px] sm:w-[140px]"
            minDate={fromDate || undefined}
          />

          <div className="relative w-32 sm:w-[180px] flex-shrink-0">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className={`w-full border-[#CED4DA] rounded-lg h-10 text-[16px] ${timePeriod ? 'text-[#5D24E1] font-bold' : ''}`}>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent className="[&_[data-state=checked]]:text-[#5D24E1]">
                <SelectItem value="day">يوم</SelectItem>
                <SelectItem value="week">اسبوع</SelectItem>
                <SelectItem value="month">شهر</SelectItem>
                <SelectItem value="quarter">ربع سنوي</SelectItem>
                <SelectItem value="year">سنه</SelectItem>
              </SelectContent>
            </Select>
            {timePeriod && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTimePeriod('');
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                type="button"
              >
                <X size={16} className="text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>
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
        setValue={setValue}
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

      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-10 mb-6 select-none">
        <div className="flex justify-center sm:justify-start items-center gap-4">
          <p className="text-gray-700">عدد جميع الطلبات: {totalOrders}</p>
          {select && (
            <button
              onClick={handleSelectAllToggle}
              className="px-4 py-2 text-sm bg-[#5D24E1] text-white rounded-lg hover:bg-[#682fee] transition-colors"
            >
              {selectedOrderIds.length === orders.length && orders.length > 0
                ? 'إلغاء تحديد الكل'
                : (
                  <span className="flex items-center gap-2">
                    تحديد الكل
                    <span className="bg-white text-[#5D24E1] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {orders.length}
                    </span>
                  </span>
                )}
            </button>
          )}
        </div>
        <div className='flex flex-row items-center justify-center gap-3 text-white'>
          {select && selectedOrderIds.length > 0 && (
            <div className='flex flex-row items-center justify-center gap-2'>
              <X onClick={() => setSelect(false)} className="cursor-pointer text-[#5D24E1] h-5 w-5" />
              <span className="text-sm text-gray-600">
                تم تحديد {selectedOrderIds.length} طلب
              </span>
            </div>
          )}
          <div
            className='bg-[#5D24E1] flex flex-row items-center justify-center gap-3 px-5 py-2 rounded-full cursor-pointer'
            onClick={() => setSelect(!select)}
          >
            <p>تحديد</p>
            <div>
              {select ? (
                <ScanLine className="text-white" />
              ) : (
                <Scan className="text-white" />
              )}
            </div>
          </div>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-4 justify-items-center">
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
                address={order.customers.address || 'غير محدد'}
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
        </>
      )}

      <CustomerOrdersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customerPhone={selectedCustomerPhone}
        customerName={selectedCustomerName}
      />

      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalOrders}
        hasNextPage={currentPage < totalPages}
        hasPreviousPage={currentPage > 1}
        onPageChange={goToPage}
        onPrevious={() => goToPage(Math.max(1, currentPage - 1))}
        onNext={() => goToPage(Math.min(totalPages, currentPage + 1))}
        currentPageSize={limit}
        onPageSizeChange={updateLimit}
        hasSelectedOrders={showBulkActions}
      />

      {/* Bulk Actions Bar - fixed at bottom, hidden when modal is open */}
      {showBulkActions && (
        <BulkActionsBar
          selectedOrders={selectedOrders}
          onEditStatus={handleEditStatus}
          onExportExcel={handleExportExcel}
          onShareWhatsApp={handleShareWhatsApp}
          onShipping={handleShipping}
          onOther={handleOther}
          position="fixed"
        />
      )}

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
