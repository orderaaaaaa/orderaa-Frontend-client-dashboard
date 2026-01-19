'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from 'react';
import { toast } from 'react-toastify';
import FilterSection from './components/FilterSection';
import OrderCard from '@/app/dashboard/orders/allOrders/components/OrderCard';
import Footer from '@/components/orders/Footer';
import CustomerOrdersModal from '@/components/orders/CustomerOrdersModal';
import BulkActionsBar from '@/components/BulkActionsBar';
import type { Order } from '@/types/orders';
import PageTaps from '../components/pageTaps';
import { buildApiFiltersFromUrlState } from '@/hooks/orders/useUnifiedFilters';
import { useOrderStatistics } from '@/hooks/orders/useOrderStatistics';
import { useFilterOptions } from '@/hooks/orders/useFilterOptions';
import { useFilterForm } from '@/hooks/orders/useFilterForm';
import { exportOrdersToExcel } from '@/utils/exportOrders';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { Breadcrumb } from '@/components/dashboard-layout';
import { DatePicker } from '@/components/ui/datepicker';
import {
  useOrders,
  useFetchOrdersForExport,
  useOrderStatusesQuery,
} from '@/services/orders';
import { useBulkOrders } from './hooks/useOrderBulk';
import { useUpdateOrdersBatch } from './hooks/useUpdateOrdersBatch';
import { useQueryClient } from '@tanstack/react-query';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { formatDateForUrl } from '@/utils/urlFilters';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

import { Scan, ScanLine, ArrowUp, ArrowLeft, X } from 'lucide-react';

// Time period options mapping
const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'day', label: 'يوم' },
  { value: 'week', label: 'اسبوع' },
  { value: 'month', label: 'شهر' },
  { value: 'quarter', label: 'ربع سنوي' },
  { value: 'year', label: 'سنه' },
];

const TIME_PERIOD_LABELS = TIME_PERIOD_OPTIONS.map((opt) => opt.label);

const getLabelFromValue = (value: TimePeriod | ''): string => {
  const option = TIME_PERIOD_OPTIONS.find((opt) => opt.value === value);
  return option?.label || '';
};

const getValueFromLabel = (label: string): TimePeriod | '' => {
  const option = TIME_PERIOD_OPTIONS.find((opt) => opt.label === label);
  return option?.value || '';
};

function AllOrdersContent() {
  const [select, setSelect] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectAllMatchingFilters, setSelectAllMatchingFilters] =
    useState(false);
  const queryClient = useQueryClient();
  const [selectedCustomerPhone, setSelectedCustomerPhone] =
    useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // URL-based filter state
  const {
    filters,
    setStatus,
    setFromDate,
    setToDate,
    setTimePeriod,
    setPage,
    setLimit,
    updateLocalFilters,
    resetFilters,
    isInitialized,
  } = useUrlFilters();

  // Build API filters from URL state
  const apiFilters = useMemo(() => {
    return buildApiFiltersFromUrlState(filters);
  }, [filters]);

  // Build filter params string for navigation to order details (excludes page/limit)
  const orderDetailsFilterParams = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.status) params.set('status', filters.status);
    if (filters.timePeriod) params.set('period', filters.timePeriod);

    if (!filters.localFilters.executionDate) {
      const fromStr = formatDateForUrl(filters.fromDate);
      if (fromStr) params.set('from', fromStr);
      const toStr = formatDateForUrl(filters.toDate);
      if (toStr) params.set('to', toStr);
    }

    const { localFilters } = filters;
    if (localFilters.customerName)
      params.set('customerName', localFilters.customerName);
    if (localFilters.phone) params.set('phone', localFilters.phone);
    if (localFilters.governorate)
      params.set('governorate', localFilters.governorate);
    if (localFilters.city) params.set('city', localFilters.city);
    if (localFilters.area) params.set('area', localFilters.area);
    if (localFilters.productName)
      params.set('productName', localFilters.productName);
    if (localFilters.sizeColor) params.set('sizeColor', localFilters.sizeColor);
    if (localFilters.shipmentCode)
      params.set('shipmentCode', localFilters.shipmentCode);
    if (localFilters.address) params.set('address', localFilters.address);
    if (localFilters.executionDate)
      params.set('executionDate', localFilters.executionDate);
    if (localFilters.newFirst !== undefined)
      params.set('newFirst', String(localFilters.newFirst));
    if (localFilters.orderByDirection)
      params.set('orderByDirection', localFilters.orderByDirection);

    return params.toString();
  }, [filters]);

  // Destructure for easier access
  const { fromDate, toDate, timePeriod, page, limit } = filters;

  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useOrders(apiFilters);

  const { data: statusOptions } = useOrderStatusesQuery();

  // Create status labels map for export
  const statusLabelsMap = useMemo(() => {
    if (!statusOptions) return new Map<string, string>();
    return new Map(statusOptions.map((s) => [s.key, s.label]));
  }, [statusOptions]);

  // Batch update mutation (for specific IDs)
  const { mutate: batchUpdateOrders } = useUpdateOrdersBatch({
    onSuccess: (data) => {
      toast.success(data.message || 'تم تحديث حالة الطلبات بنجاح');
      setSelectedOrderIds([]);
      setSelect(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'فشل تحديث حالة الطلبات');
    },
  });

  const { mutate: bulkUpdateOrders } = useBulkOrders({
    onSuccess: (data) => {
      toast.success(data.message || 'تم تحديث حالة الطلبات بنجاح');
      setSelectedOrderIds([]);
      setSelectAllMatchingFilters(false);
      setSelect(false);
      refetch();
      // Invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'فشل تحديث حالة الطلبات');
    },
  });

  const { statistics } = useOrderStatistics();
  const { options } = useFilterOptions();
  const { fetchOrdersForExport } = useFetchOrdersForExport();

  const orders = ordersData?.data ?? [];
  const totalOrders = ordersData?.meta?.totalItems ?? 0;
  const totalPages = ordersData?.meta?.totalPages ?? 1;
  const currentPage = ordersData?.meta?.currentPage ?? 1;
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

  // Get selected orders as Order objects for BulkActionsBar (only relevant for current page visual)
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
  const handleOrderSelect = useCallback(
    (orderId: number, checked: boolean) => {
      // If we were in "Select All Store" mode, interacting with individual checkbox breaks it
      if (selectAllMatchingFilters) {
        setSelectAllMatchingFilters(false);
        // If unchecked, we can't easily keep "all except one" without complex logic, so we reset to empty or current page
        // For simplicity, we just fallback to selecting only the current page (minus the one unchecked)??
        // Or just start fresh:
        if (checked) {
          setSelectedOrderIds([orderId]);
        } else {
          setSelectedOrderIds([]);
        }
        return;
      }

      setSelectedOrderIds((prev) => {
        if (checked) {
          return [...prev, orderId];
        } else {
          return prev.filter((id) => id !== orderId);
        }
      });
    },
    [selectAllMatchingFilters]
  );

  // Handle select all toggle (Selects All Store to trigger Bulk logic)
  const handleSelectAllToggle = useCallback(() => {
    if (selectAllMatchingFilters) {
      // Deselect all
      setSelectAllMatchingFilters(false);
      setSelectedOrderIds([]);
    } else {
      // Select ALL matching filters (Bulk Mode)
      // "When ever the user touches this تحديد الكل button then select the state use bulk"
      setSelectAllMatchingFilters(true);
      // We don't need individual IDs for bulk
      setSelectedOrderIds([]);
    }
  }, [selectAllMatchingFilters]);

  // Handle select all matching filters (All Store)
  const handleSelectAllStore = useCallback(() => {
    setSelectAllMatchingFilters(true);
  }, []);

  // Clear selection when select mode is turned off
  useEffect(() => {
    if (!select) {
      setSelectedOrderIds([]);
      setSelectAllMatchingFilters(false);
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

        const fileName = exportOrdersToExcel(
          ordersToExport,
          'selected_orders',
          statusLabelsMap
        );
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

          const fileName = exportOrdersToExcel(
            response.data,
            'all_orders',
            statusLabelsMap
          );
          toast.success(
            `تم تصدير ${response.data.length} طلب بنجاح! \nاسم الملف: ${fileName}`
          );
        } catch (apiErr) {
          console.warn('API failed for export, using current orders');
          if (orders.length === 0) {
            toast.warning('لا توجد طلبات لتصديرها');
            return;
          }

          const fileName = exportOrdersToExcel(
            orders,
            'all_orders',
            statusLabelsMap
          );
          toast.success(
            `تم تصدير ${orders.length} طلب بنجاح! \nاسم الملف: ${fileName}`
          );
        }
      }
    } catch (error) {
      toast.error('فشل في تصدير الطلبات. الرجاء المحاولة مرة أخرى.');
    }
  }, [
    apiFilters,
    select,
    selectedOrderIds,
    orders,
    fetchOrdersForExport,
    statusLabelsMap,
  ]);

  // Handle Edit Status
  const handleEditStatus = useCallback(
    (statusKey: string) => {
      if (!statusKey) return;

      if (selectAllMatchingFilters) {
        const currentStatusFilter = filters.status;

        if (!currentStatusFilter) {
          toast.warning('يجب تحديد  فلتر الطلبات قبل استخدام تحديث الكل');
          return;
        }

        bulkUpdateOrders({
          payload: {
            status: statusKey as any,
          },
          currentStatus: currentStatusFilter,
        });
      } else {
        if (selectedOrderIds.length === 0) return;

        const batchPayload = {
          orders: selectedOrderIds.map((id) => ({
            id,
            updates: { status: statusKey as any },
          })),
        };

        batchUpdateOrders(batchPayload);
      }
    },
    [
      selectAllMatchingFilters,
      filters.status,
      selectedOrderIds,
      bulkUpdateOrders,
      batchUpdateOrders,
    ]
  );

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
      behavior: 'smooth',
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

  const showBulkActions =
    (selectedOrders.length > 0 || selectAllMatchingFilters) && !isModalOpen;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-7 w-full">
        <Breadcrumb items={[{ title: 'الطلبات' }, { title: 'جميع الطلبات' }]} />

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              placeholder="من تاريخ"
              showIcon={true}
              className="flex-1 sm:flex-none sm:w-[140px]"
              maxDate={toDate || undefined}
            />

            <ArrowLeft className="text-primary flex-shrink-0" size="20" />

            <DatePicker
              selected={toDate}
              onChange={setToDate}
              placeholder="إلى تاريخ"
              showIcon={true}
              className="flex-1 sm:flex-none sm:w-[140px]"
              minDate={fromDate || undefined}
            />
          </div>

          <div className="w-full sm:w-[180px] flex-shrink-0">
            <SearchableSelect
              value={getLabelFromValue(timePeriod)}
              onValueChange={(label) => setTimePeriod(getValueFromLabel(label))}
              options={TIME_PERIOD_LABELS}
              placeholder="الفترة الزمنية"
              triggerClassName={`w-full border-[#CED4DA] rounded-lg h-10 text-[16px] ${
                timePeriod ? 'text-primary font-bold' : ''
              }`}
              searchThreshold={10}
              clearable
            />
          </div>
        </div>
      </div>

      <PageTaps
        data={orders}
        statusCounts={statistics?.statusCounts || {}}
        totalOrders={statistics?.totalOrders || 0}
        onStatusChange={setStatus}
        currentStatus={filters.status}
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
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSelectAllToggle}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-[#682fee] transition-colors"
              >
                {selectAllMatchingFilters ? (
                  'إلغاء تحديد الكل'
                ) : (
                  <span className="flex items-center gap-2">تحديد الكل</span>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-row items-center justify-center gap-3 text-white">
          {select && selectedOrderIds.length > 0 && (
            <div className="flex flex-row items-center justify-center gap-2">
              <X
                onClick={() => setSelect(false)}
                className="cursor-pointer text-primary h-5 w-5"
              />
              <span className="text-sm text-gray-600">
                تم تحديد {selectedOrderIds.length} طلب
              </span>
            </div>
          )}
          <div
            className="bg-primary flex flex-row items-center justify-center gap-3 px-5 py-2 rounded-full cursor-pointer"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
          <div className="grid container mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 my-4 justify-items-center">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                select={select}
                isSelected={
                  selectAllMatchingFilters ||
                  selectedOrderIds.includes(order.id)
                }
                onSelectionChange={(checked) =>
                  handleOrderSelect(order.id, checked)
                }
                id={order.id}
                code={order.code}
                name={order.customers.name}
                phoneNumbers={order.customers.phone_numbers}
                government={
                  order.governorate || order.externalGovernorate || 'غير محدد'
                }
                shippingId={order.shippingId}
                // Updated Mapping Logic for Items and Variants
                items={order.order_products.map((op: any) => {
                  const productName = op.products?.name || 'منتج غير معروف';

                  const variantDetails =
                    op.variants && op.variants.length > 0
                      ? op.variants.map((v: any) => v.value).join('') // Use empty join for "42black"
                      : '';

                  return variantDetails
                    ? `${productName} - ${variantDetails}`
                    : productName;
                })}
                price={order.totalCost}
                trys={order.numberOfTriesToReach}
                status={order.status}
                isBlocked={order.customers.isBlocked}
                city={
                  order.customers.area || order.customers.city || 'غير محدد'
                }
                address={order.customers.address || 'غير محدد'}
                alert={0}
                createdAt={order.createdAt}
                repeatCount={order.customers.totalCustomerOrders || 0}
                onRepeatClick={() =>
                  handleRepeatClick(
                    order.customers.phone_numbers?.[0],
                    order.customers.name
                  )
                }
                filterParams={orderDetailsFilterParams}
                cancelReason={order.cancelReason}
                cancelNotes={order.cancelNotes}
                postponedUntil={order.postponedUntil}
                showAllItems
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
        onPageChange={setPage}
        onPrevious={() => setPage(Math.max(1, currentPage - 1))}
        onNext={() => setPage(Math.min(totalPages, currentPage + 1))}
        currentPageSize={limit}
        onPageSizeChange={setLimit}
        hasSelectedOrders={showBulkActions}
      />

      {/* Bulk Actions Bar - fixed at bottom, hidden when modal is open */}
      {showBulkActions && (
        <BulkActionsBar
          selectedOrders={selectedOrders}
          onEditStatus={handleEditStatus}
          statusOptions={statusOptions || []}
          onExportExcel={handleExportExcel}
          onShareWhatsApp={handleShareWhatsApp}
          onShipping={handleShipping}
          onOther={handleOther}
          position="fixed"
          isAllSelected={selectAllMatchingFilters}
          totalStoreOrders={totalOrders}
        />
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-[#682fee] transition-all duration-300 hover:scale-110"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// Loading fallback component
function AllOrdersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense wrapper for useSearchParams
export default function AllOrdersRefactor() {
  return (
    <Suspense fallback={<AllOrdersLoading />}>
      <AllOrdersContent />
    </Suspense>
  );
}
