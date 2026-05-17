'use client';

import PageLoading from '@/components/ui/page-loading';
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
import {
  useOrders,
  useOrderStatusesQuery,
} from '@/services/orders';
import { useBulkOrders } from './hooks/useOrderBulk';
import type { OrderStatusKey } from './types/Bulk';
import { useQueryClient } from '@tanstack/react-query';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useStatisticsChangeDetection } from '@/hooks/orders/useStatisticsChangeDetection';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { formatDateForUrl } from '@/utils/urlFilters';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

import { Scan, ScanLine, ArrowUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  } = useUrlFilters('orderFilters');

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
    if (localFilters.productId) params.set('productId', localFilters.productId);
    if (localFilters.sizeColor) params.set('sizeColor', localFilters.sizeColor);
    if (localFilters.shipmentCode)
      params.set('shipmentCode', localFilters.shipmentCode);
    if (localFilters.address) params.set('address', localFilters.address);
    if (localFilters.executionDate)
      params.set('executionDate', localFilters.executionDate);
    if (localFilters.skipFilters !== undefined)
      params.set('skipFilters', String(localFilters.skipFilters));
    if (localFilters.orderByDirection)
      params.set('orderByDirection', localFilters.orderByDirection);
    if (localFilters.storeId) params.set('storeId', localFilters.storeId);

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

  const { mutate: bulkUpdateOrders } = useBulkOrders({
    onSuccess: (data) => {
      toast.success(data.message || 'تم تحديث حالة الطلبات بنجاح');
      setSelectedOrderIds([]);
      setSelectAllMatchingFilters(false);
      setSelect(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join('\n') : msg || 'فشل تحديث حالة الطلبات');
    },
  });

  const { statistics } = useOrderStatistics(apiFilters);

  const handleStatisticsChange = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.ORDERS],
    });
  }, [queryClient]);

  useStatisticsChangeDetection({
    onStatisticsChange: handleStatisticsChange,
    enabled: isInitialized,
  });

  const { options } = useFilterOptions();

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
    reset,
  } = useFilterForm({
    onSubmit: handleFormSubmit,
  });

  const hasResetFromUrl = useRef(false);
  useEffect(() => {
    if (isInitialized && !hasResetFromUrl.current) {
      hasResetFromUrl.current = true;
      const { localFilters } = filters;
      const hasAnyFilter = Object.entries(localFilters).some(([key, value]) => {
        if (key === 'skipFilters') return value !== undefined;
        if (key === 'cancellationReasons') return Array.isArray(value) && value.length > 0;
        return !!value;
      });
      if (hasAnyFilter) {
        reset(localFilters, { keepDefaultValues: true });
      }
    }
  }, [isInitialized, filters, reset]);

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

  const handleExportExcel = useCallback(() => {
    try {
      let ordersToExport: Order[];

      if (selectAllMatchingFilters) {
        ordersToExport = orders;
      } else {
        ordersToExport = orders.filter((order) =>
          selectedOrderIds.includes(order.id)
        );
      }

      if (ordersToExport.length === 0) {
        toast.warning('الرجاء تحديد طلبات للتصدير');
        return;
      }

      const fileName = exportOrdersToExcel(
        ordersToExport,
        selectAllMatchingFilters ? 'all_orders' : 'selected_orders',
        statusLabelsMap
      );
      toast.success(
        `تم تصدير ${ordersToExport.length} طلب بنجاح! \nاسم الملف: ${fileName}`
      );
    } catch (error) {
      toast.error('فشل في تصدير الطلبات. الرجاء المحاولة مرة أخرى.');
    }
  }, [selectAllMatchingFilters, selectedOrderIds, orders, statusLabelsMap]);

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
            status: statusKey as OrderStatusKey,
          },
          currentStatus: currentStatusFilter,
        });
      } else {
        if (selectedOrderIds.length === 0) return;

        bulkUpdateOrders({
          payload: {
            status: statusKey as OrderStatusKey,
            ordersIds: selectedOrderIds,
          },
        });
      }
    },
    [
      selectAllMatchingFilters,
      filters.status,
      selectedOrderIds,
      bulkUpdateOrders,
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

        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          timePeriod={timePeriod}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onTimePeriodChange={setTimePeriod}
          className="px-3"
        />
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
        initialFormFilters={isInitialized ? filters.localFilters : null}
        currentStatus={filters.status}
        hiddenFilters={[]}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-10 mb-6 select-none">
        <div className="flex justify-center sm:justify-start items-center gap-4">
          <p className="text-gray-700">عدد جميع الطلبات: {totalOrders}</p>
          {select && (
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSelectAllToggle}
                className="rounded-lg"
              >
                {selectAllMatchingFilters ? (
                  'إلغاء تحديد الكل'
                ) : (
                  <span className="flex items-center gap-2">تحديد الكل</span>
                )}
              </Button>
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
          <PageLoading message="جاري تحميل الطلبات..." />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid container mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 my-4 justify-items-center [&>*]:max-w-[300px]">
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
                      ? op.variants.map((v: any) => v.value).join('')
                      : '';
                  return variantDetails
                    ? `${productName} - ${variantDetails}`
                    : productName;
                })}
                itemSkus={order.order_products.map(
                  (op: any) => op.sku || op.products?.sku || null
                )}
                price={order.totalCost}
                shippingType={order.shippingType}
                trys={order.numberOfTriesToReach}
                status={order.status}
                isBlocked={order.customers.isBlocked}
                customerNotes={order.customers.notes}
                city={
                  order.customers.area || order.customers.city || 'غير محدد'
                }
                address={order.address || 'غير محدد'}
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
                states={order.states}
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
        <Button
          variant="default"
          size="icon-lg"
          onClick={scrollToTop}
          aria-label="العودة للأعلى"
          className="fixed bottom-8 left-8 z-50 rounded-full shadow-lg hover:bg-[#682fee] hover:scale-110 transition-all duration-300"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

function AllOrdersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الطلبات..." />
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
