'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { ArrowUp, ArrowLeft, Scan, ScanLine, X } from 'lucide-react';

import { Breadcrumb } from '@/components/dashboard-layout';
import { DatePicker } from '@/components/ui/datepicker';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import BulkActionsBar from '@/components/BulkActionsBar';
import OrderCard from '@/app/dashboard/orders/allOrders/components/OrderCard';
import Footer from '@/app/dashboard/orders/allOrders/components/Footer';
import CustomerOrdersModal from '@/app/dashboard/orders/allOrders/components/CustomerOrdersModal';

import { useOrders, useOrderStatusesQuery } from '@/services/orders';
import { useOrderStatistics } from '@/hooks/AllOrders/useOrderStatistics';
import { useFilterOptions } from '@/hooks/AllOrders/useFilterOptions';
import { useFilterForm } from '@/hooks/AllOrders/useFilterForm';
import { buildApiFiltersFromUrlState } from '@/hooks/AllOrders/useUnifiedFilters';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { formatDateForUrl } from '@/utils/urlFilters';

import { PageTabs } from './PageTabs';
import { StatisticsSection } from './StatisticsSection';
import { FilterSection } from './FilterSection';
import {
  useConfirmOrdersFilters,
  useConfirmOrderStatistics,
  useConfirmOrderBulk,
} from '../hooks';

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

export function ConfirmOrdersContent() {
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // URL-based filter state with print status
  const {
    filters,
    setStatus,
    setFromDate,
    setToDate,
    setTimePeriod,
    setPage,
    setLimit,
    updateLocalFilters,
    isInitialized,
    printStatus,
    setPrintStatus,
  } = useConfirmOrdersFilters();

  // Build API filters from URL state
  const apiFilters = useMemo(() => {
    return buildApiFiltersFromUrlState(filters);
  }, [filters]);

  // Build filter params for order details navigation
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

    return params.toString();
  }, [filters]);

  const { fromDate, toDate, timePeriod, page, limit } = filters;

  // Fetch orders
  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useOrders(apiFilters);

  const { data: statusOptions } = useOrderStatusesQuery();

  // Statistics
  const { statistics } = useOrderStatistics();
  const { statistics: confirmStatistics, loading: statsLoading } =
    useConfirmOrderStatistics();
  const { options } = useFilterOptions();

  const orders = ordersData?.data ?? [];
  const totalOrders = ordersData?.meta?.totalItems ?? 0;
  const totalPages = ordersData?.meta?.totalPages ?? 1;
  const currentPage = ordersData?.meta?.currentPage ?? 1;
  const error = queryError?.message ?? null;

  // Bulk selection
  const {
    selectMode,
    toggleSelectMode,
    setSelectMode,
    selectedOrderIds,
    selectedOrders,
    selectAllMatchingFilters,
    handleOrderSelect,
    handleSelectAllToggle,
    clearSelections,
  } = useConfirmOrderBulk({ orders });

  // Track previous page for scroll
  const prevPageRef = useRef<number>(page);

  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  // Form setup
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

  // Handle bulk status edit
  const handleEditStatus = useCallback(
    (statusKey: string) => {
      if (!statusKey) return;
      // TODO: Implement batch/bulk update logic
      toast.info(`سيتم تحديث حالة الطلبات إلى ${statusKey}`);
    },
    []
  );

  // Handle Excel export
  const handleExportExcel = useCallback(() => {
    toast.info('سيتم تصدير الطلبات إلى Excel');
  }, []);

  // Handle WhatsApp share
  const handleShareWhatsApp = useCallback(() => {
    toast.info(`سيتم مشاركة ${selectedOrders.length} طلب عبر واتساب`);
  }, [selectedOrders]);

  // Handle Shipping
  const handleShipping = useCallback(() => {
    toast.info(`سيتم شحن ${selectedOrders.length} طلب`);
  }, [selectedOrders]);

  // Handle Other
  const handleOther = useCallback(() => {
    toast.info(`${selectedOrders.length} طلب محدد`);
  }, [selectedOrders]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Add padding when bulk actions bar is visible
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-7 w-full">
        <Breadcrumb
          items={[{ title: 'الطلبات' }, { title: 'تأكيد الطلبات' }]}
        />

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

      {/* Status Tabs */}
      <PageTabs
        statusCounts={statistics?.statusCounts || {}}
        totalOrders={statistics?.totalOrders || 0}
        onStatusChange={setStatus}
        currentStatus={filters.status}
      />

      {/* Statistics Section */}
      <StatisticsSection statistics={confirmStatistics} isLoading={statsLoading} />

      {/* Filter Section */}
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
        printStatus={printStatus}
        onPrintStatusChange={setPrintStatus}
        printedCount={0}
        notPrintedCount={0}
      />

      {/* Selection Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-10 mb-6 select-none">
        <div className="flex justify-center sm:justify-start items-center gap-4">
          <p className="text-gray-700">عدد جميع الطلبات: {totalOrders}</p>
          {selectMode && (
            <button
              onClick={handleSelectAllToggle}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-[#682fee] transition-colors"
            >
              {selectAllMatchingFilters ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>
          )}
        </div>

        <div className="flex flex-row items-center justify-center gap-3 text-white">
          {selectMode && selectedOrderIds.length > 0 && (
            <div className="flex flex-row items-center justify-center gap-2">
              <X
                onClick={() => setSelectMode(false)}
                className="cursor-pointer text-primary h-5 w-5"
              />
              <span className="text-sm text-gray-600">
                تم تحديد {selectedOrderIds.length} طلب
              </span>
            </div>
          )}
          <div
            className="bg-primary flex flex-row items-center justify-center gap-3 px-5 py-2 rounded-full cursor-pointer"
            onClick={toggleSelectMode}
          >
            <p>تحديد</p>
            <div>
              {selectMode ? (
                <ScanLine className="text-white" />
              ) : (
                <Scan className="text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
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
                select={selectMode}
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
                trys={order.numberOfTriesToReach}
                status={order.status}
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
              />
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">لا توجد طلبات</div>
          )}
        </>
      )}

      {/* Customer Orders Modal */}
      <CustomerOrdersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customerPhone={selectedCustomerPhone}
        customerName={selectedCustomerName}
      />

      {/* Footer */}
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

      {/* Bulk Actions Bar */}
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
