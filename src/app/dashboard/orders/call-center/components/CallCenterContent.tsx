'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { toast } from 'react-toastify';
import { ArrowUp } from 'lucide-react';

import { Breadcrumb } from '@/components/dashboard-layout';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import { Button } from '@/components/ui/button';
import PrintOrdersActionsBar from '../../print-orders/components/PrintOrdersActionsBar';
import OrderCard from '@/app/dashboard/orders/allOrders/components/OrderCard';
import Footer from '@/components/orders/Footer';
import CustomerOrdersModal from '@/components/orders/CustomerOrdersModal';

import { useQueryClient } from '@tanstack/react-query';
import { useOrders, useDepartmentStatusesQuery } from '@/services/orders';
import { useStatisticsChangeDetection } from '@/hooks/orders/useStatisticsChangeDetection';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { useOrderStatistics } from '@/hooks/orders/useOrderStatistics';
import { useFilterOptions } from '@/hooks/orders/useFilterOptions';
import { useFilterForm } from '@/hooks/orders/useFilterForm';
import { buildApiFiltersFromUrlState } from '@/hooks/orders/useUnifiedFilters';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { formatDateForUrl } from '@/utils/urlFilters';

import { useGetProducts } from '@/app/dashboard/products/hooks/useProduct';
import { FilterKey } from '@/app/dashboard/orders/allOrders/components/FilterSection/FilterPanelRHF';
import { PageTabs } from '../../components/PageTabs';
import { FilterSection } from '../../components/FilterSection';
import {
  usePrintOrdersFilters,
  usePrintOrderBulk,
} from '../../print-orders/hooks';
import OrdersSelectionHeader from '../../components/OrdersSelectionHeader';
import PageTaps from '../../components/pageTaps';
import { useDepartment, useDefaultStatusByPath } from '../../hooks';

export function CallCenterContent() {
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isProductFilterActive, setIsProductFilterActive] = useState(false);
  const department = useDepartment();
  const queryClient = useQueryClient();
  const DEFAULT_STATUS = useDefaultStatusByPath();
  const { data: departmentStatuses, isLoading: isDepartmentStatusesLoading } =
    useDepartmentStatusesQuery(department);

  const {
    filters,
    setStatus,
    setPage,
    setLimit,
    updateLocalFilters,
    printStatus,
    setPrintStatus,
    isInitialized,
  } = usePrintOrdersFilters();

  const apiFilters = useMemo(() => {
    const shouldSendDepartment = !filters.status && department;
    return {
      ...buildApiFiltersFromUrlState(filters),
      ...(shouldSendDepartment && { department }),
    };
  }, [filters, department]);

  const orderDetailsFilterParams = useMemo(() => {
    const params = new URLSearchParams();

    const statusToUse = filters.status || DEFAULT_STATUS;
    if (statusToUse) params.set('status', statusToUse);
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

    return params.toString();
  }, [filters, DEFAULT_STATUS]);

  const { page, limit } = filters;

  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useOrders(apiFilters);

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

  const { data: productsData } = useGetProducts(
    { page: 1, limit: 9999, sortBy: 'createdAt', sortOrder: 'desc' },
    isProductFilterActive,
  );

  const productIdOptions = useMemo(
    () =>
      (productsData?.data ?? []).map((p) => ({
        key: String(p.id),
        value: p.name,
      })),
    [productsData],
  );

  const orders = ordersData?.data ?? [];
  const totalOrders = ordersData?.meta?.totalItems ?? 0;
  const totalPages = ordersData?.meta?.totalPages ?? 1;
  const currentPage = ordersData?.meta?.currentPage ?? 1;
  const error = queryError?.message ?? null;

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
  } = usePrintOrderBulk({ orders });

  const prevPageRef = useRef<number>(page);

  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  const handleFormSubmit = useCallback(
    (data: OrderFiltersFormData) => {
      updateLocalFilters(data);
    },
    [updateLocalFilters]
  );

  const handleActiveFiltersChange = useCallback((activeFilters: FilterKey[]) => {
    setIsProductFilterActive(activeFilters.includes('productId'));
  }, []);

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

  const handlePrepared = useCallback(() => {
    toast.info(`سيتم تحديث ${selectedOrders.length} طلب إلى تم التحضير`);
  }, [selectedOrders]);

  const handleAwaitingPackaging = useCallback(() => {
    toast.info(`سيتم تحديث ${selectedOrders.length} طلب إلى فى انتظار التغليف`);
  }, [selectedOrders]);

  const handleCallAgain = useCallback(() => {
    toast.info(`سيتم تحديث ${selectedOrders.length} طلب إلى اعادة اتصال`);
  }, [selectedOrders]);

  const handleChangeProduct = useCallback(() => {
    toast.info(`سيتم تحديث ${selectedOrders.length} طلب إلى تغيير المنتج`);
  }, [selectedOrders]);

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
        <Breadcrumb items={[{ title: 'الطلبات' }, { title: 'كول سنتر' }]} />
      </div>
      <PageTaps
        statusCounts={statistics?.statusCounts || {}}
        totalOrders={statistics?.totalOrders || 0}
        onStatusChange={setStatus}
        currentStatus={filters.status}
        allowedStatuses={departmentStatuses}
        isLoadingAllowedStatuses={isDepartmentStatusesLoading}
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
          productIdOptions,
        }}
        initialFormFilters={isInitialized ? filters.localFilters : null}
        currentStatus={filters.status}
        printStatus={printStatus}
        onPrintStatusChange={setPrintStatus}
        selectedOrders={selectedOrders}
        showPrintButton={false}
        showPrintStatusToggle={false}
        onActiveFiltersChange={handleActiveFiltersChange}
      />

      <OrdersSelectionHeader
        totalOrders={totalOrders}
        selectMode={selectMode}
        selectedOrderIds={selectedOrderIds}
        selectAllMatchingFilters={selectAllMatchingFilters}
        toggleSelectMode={toggleSelectMode}
        handleSelectAllToggle={handleSelectAllToggle}
        setSelectMode={setSelectMode}
      />

      {loading && orders.length === 0 ? (
        <LoadingAnimation />
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        // TODO: Create a reusable component for the orders grid
        <>
          <div className="grid container mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 my-4 justify-items-center [&>*]:max-w-[300px]">
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
                itemSkus={order.order_products.map(
                  (op: any) => op.sku || op.products?.sku || null
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
                isBlocked={order.customers.isBlocked}
                customerNotes={order.customers.notes}
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
      {showBulkActions && (
        <PrintOrdersActionsBar
          selectedOrders={selectedOrders}
          onPrepared={handlePrepared}
          onAwaitingPackaging={handleAwaitingPackaging}
          onCallAgain={handleCallAgain}
          onChangeProduct={handleChangeProduct}
          position="fixed"
          isAllSelected={selectAllMatchingFilters}
          totalStoreOrders={totalOrders}
        />
      )}
      {showBackToTop && (
        <Button
          variant="default"
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="size-6" />
        </Button>
      )}
    </div>
  );
}
