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
import OrderCard from '@/app/dashboard/orders/allOrders/components/OrderCard';
import { ShippingActionsBar } from './ShippingActionsBar';
import { ScannedOrdersModal } from '../../components/ScannedOrdersModal';
import { useBarcodeScanner, useScannerFeedback } from '../../print-orders/hooks';
import { useScannedOrders } from '../../hooks';
import { useSubmitForApproval } from '../hooks';
import { getOrderByCodeWithShipping } from '../services/shippingOrders';
import { ORDER_STATUS_ARABIC_LABELS } from '../../../constants/statusMappings';
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

import { PageTabs } from '../../components/PageTabs';
import { StatisticsSection } from '../../components/StatisticsSection';
import { FilterSection } from '../../components/FilterSection';
import {
  usePrintOrdersFilters,
  usePrintOrderStatistics,
  usePrintOrderBulk,
} from '../../print-orders/hooks';

import { buildStatisticsCards } from '../constants/statisticsCards';
import OrdersSelectionHeader from '../../components/OrdersSelectionHeader';
import PageTaps from '../../components/pageTaps';
import { useDepartment, useDefaultStatusByPath } from '../../hooks';
import useShippingCompanies from '@/hooks/useShippingCompanies';

export function ShippingOrdersContent() {
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedShippingCompany, setSelectedShippingCompany] = useState('');
  const [isScannedOrdersModalOpen, setIsScannedOrdersModalOpen] = useState(false);
  const [flashingCode, setFlashingCode] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);

  const department = useDepartment();
  const queryClient = useQueryClient();
  const DEFAULT_STATUS = useDefaultStatusByPath();
  const { shippingCompanies, isLoading: isLoadingShippingCompanies } =
    useShippingCompanies();
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
  } = usePrintOrdersFilters('orderFilters', { ignoreDateRange: true });
  const { statistics: printStatistics, loading: statsLoading } =
    usePrintOrderStatistics();

  const apiFilters = useMemo(() => {
    const baseFilters = buildApiFiltersFromUrlState(filters);
    if (selectedShippingCompany) {
      return { ...baseFilters, shippingCompany: selectedShippingCompany };
    }
    return baseFilters;
  }, [filters, selectedShippingCompany]);

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

  const { playSuccessSound, playErrorSound } = useScannerFeedback();
  const shippingActionableStatuses = useMemo(() => ['PREPARED'], []);
  const {
    scannedOrders,
    actionableOrders,
    actionableFilteredGroups,
    actionableFilteredOrders,
    nonConfirmedGroups,
    addOrder,
    removeOrder,
    clearOrders,
    hasOrder,
    forceActionable,
    searchQuery,
    setSearchQuery,
  } = useScannedOrders(shippingActionableStatuses);
  const { mutateAsync: submitForApprovalMutation } = useSubmitForApproval();

  const handleScan = useCallback(
    async (barcode: string) => {
      if (!selectedShippingCompany) {
        playErrorSound();
        toast.error('يرجى اختيار شركة الشحن أولاً');
        return;
      }

      if (!isScannedOrdersModalOpen) {
        setIsScannedOrdersModalOpen(true);
      }

      if (hasOrder(barcode)) {
        playErrorSound();
        toast.warning('هذا الطلب تم مسحه مسبقاً');
        return;
      }

      setIsScanLoading(true);
      try {
        const order = await getOrderByCodeWithShipping(
          barcode,
          selectedShippingCompany
        );
        addOrder({
          id: order.id,
          code: barcode,
          status: order.status,
          cancelReason: order.cancelReason,
          packagingWarning: order.packagingWarning,
          printCount: order.printCount,
        });
        setFlashingCode(barcode);
        setTimeout(() => setFlashingCode(null), 600);
        if (order.status === 'PREPARED') {
          playSuccessSound();
        } else {
          playErrorSound();
          const statusLabel =
            ORDER_STATUS_ARABIC_LABELS[order.status] || order.status;
          toast.info(`هذا الطلب ليس جاهزاً للشحن - الحالة: ${statusLabel}`);
        }
      } catch (error: any) {
        playErrorSound();
        const msg = error?.response?.data?.message;
        toast.error(
          Array.isArray(msg) ? msg.join('\n') : msg || 'هذا الطلب غير موجود'
        );
      } finally {
        setIsScanLoading(false);
      }
    },
    [
      addOrder,
      hasOrder,
      playSuccessSound,
      playErrorSound,
      isScannedOrdersModalOpen,
      selectedShippingCompany,
    ]
  );

  useBarcodeScanner({
    onScan: handleScan,
    enabled: true,
    minCharLength: 1,
    maxCharLength: 1000,
  });

  const handleShipScannedOrders = useCallback(async () => {
    if (actionableOrders.length === 0) return;

    setIsActionLoading(true);
    try {
      await submitForApprovalMutation({
        orderIds: actionableOrders.map((o) => o.id),
      });
      toast.success('تم إرسال الطلبات للشحن بنجاح');
      clearOrders();
      setIsScannedOrdersModalOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join('\n') : msg || 'فشل إرسال الطلبات للشحن'
      );
    } finally {
      setIsActionLoading(false);
    }
  }, [actionableOrders, submitForApprovalMutation, clearOrders]);

  const handleShipSelectedOrders = useCallback(async () => {
    const ordersToProcess = selectAllMatchingFilters ? orders : selectedOrders;
    if (ordersToProcess.length === 0) return;

    setIsActionLoading(true);
    try {
      await submitForApprovalMutation({
        orderIds: ordersToProcess.map((o) => o.id),
      });
      toast.success('تم إرسال الطلبات للشحن بنجاح');
      clearSelections();
      setSelectMode(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل إرسال الطلبات للشحن');
    } finally {
      setIsActionLoading(false);
    }
  }, [
    selectAllMatchingFilters,
    orders,
    selectedOrders,
    submitForApprovalMutation,
    clearSelections,
    setSelectMode,
  ]);

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

  const statisticsCards = useMemo(
    () => buildStatisticsCards(printStatistics),
    [printStatistics]
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
        <Breadcrumb items={[{ title: 'الطلبات' }, { title: 'شحن الطلبات' }]} />
      </div>
      <PageTaps
        statusCounts={statistics?.statusCounts || {}}
        totalOrders={statistics?.totalOrders || 0}
        onStatusChange={setStatus}
        currentStatus={filters.status}
        allowedStatuses={departmentStatuses}
        showAllOrdersTab={false}
        isLoadingAllowedStatuses={isDepartmentStatusesLoading}
      />
      {/* //TODO: Update props to match shipping orders context */}
      <StatisticsSection cards={statisticsCards} isLoading={statsLoading} />
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
        printStatus={printStatus}
        onPrintStatusChange={setPrintStatus}
        selectedOrders={selectedOrders}
        showPrintStatusToggle={false}
        showShippingCompanySelect
        shippingCompanyOptions={shippingCompanies}
        selectedShippingCompany={selectedShippingCompany}
        onShippingCompanyChange={setSelectedShippingCompany}
        isLoadingShippingCompanies={isLoadingShippingCompanies}
        hiddenFilters={[]}
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
                shippingCompany={order.shippingCompany}
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
        <ShippingActionsBar
          onShip={handleShipSelectedOrders}
          position="fixed"
          isLoading={isActionLoading}
          selectedCount={selectAllMatchingFilters ? totalOrders : selectedOrders.length}
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

      <ScannedOrdersModal
        isOpen={isScannedOrdersModalOpen}
        onClose={() => {
          setIsScannedOrdersModalOpen(false);
          clearOrders();
        }}
        title="الطلبات للشحن"
        scannedOrders={scannedOrders}
        actionableOrders={actionableOrders}
        actionableFilteredGroups={actionableFilteredGroups}
        actionableFilteredOrders={actionableFilteredOrders}
        nonConfirmedGroups={nonConfirmedGroups}
        onRemoveOrder={removeOrder}
        onForceActionable={forceActionable}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isScanLoading={isScanLoading}
        flashingCode={flashingCode}
        actionsBar={
          <ShippingActionsBar
            forceShow
            position="static"
            isLoading={isActionLoading}
            disableActions={actionableOrders.length === 0}
            onShip={handleShipScannedOrders}
            selectedCount={actionableOrders.length}
          />
        }
      />
    </div>
  );
}
