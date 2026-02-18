'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { toast } from 'react-toastify';
import { ArrowUp, Scan, ScanLine, X } from 'lucide-react';
import {
  useBarcodeScanner,
  useScannerFeedback,
  useScannedOrders,
  usePrepareOrders,
  useWaitingForPackaging,
  useCallAgainOrders,
} from '../hooks';
import { getOrderByCode } from '../services/printOrders';
import { ORDER_STATUS_ARABIC_LABELS } from '../../../constants/statusMappings';
import { ScannedOrdersModal } from './ScannedOrdersModal';
import { ChangeProductModal } from './ChangeProductModal';
import { PrintedOrdersConfirmModal } from './PrintedOrdersConfirmModal';

import { Breadcrumb } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import PrintOrdersActionsBar from './PrintOrdersActionsBar';
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

import { PageTabs } from '../../components/PageTabs';
import { StatisticsSection } from '../../components/StatisticsSection';
import { FilterSection } from '../../components/FilterSection';
import {
  usePrintOrdersFilters,
  usePrintOrderStatistics,
  usePrintOrderBulk,
} from '../hooks';
import { buildStatisticsCards } from '../constants/statisticsCards';
import PageTaps from '../../components/pageTaps';
import { useDepartment } from '../../hooks';

export function PrintOrdersContent() {
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isScannedOrdersModalOpen, setIsScannedOrdersModalOpen] =
    useState(false);
  const [flashingCode, setFlashingCode] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [isChangeProductModalOpen, setIsChangeProductModalOpen] =
    useState(false);
  const [isPrintedConfirmModalOpen, setIsPrintedConfirmModalOpen] =
    useState(false);
  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const [isScannerChangeProductMode, setIsScannerChangeProductMode] =
    useState(false);
  const [scannerPackagingNotes, setScannerPackagingNotes] = useState<
    Record<string, string>
  >({});
  const department = useDepartment();
  const queryClient = useQueryClient();
  const { data: departmentStatuses, isLoading: isDepartmentStatusesLoading } =
    useDepartmentStatusesQuery(department);

  const { mutateAsync: prepareOrdersMutation } = usePrepareOrders();
  const { mutateAsync: waitingMutation } = useWaitingForPackaging();
  const { mutateAsync: callAgainMutation } = useCallAgainOrders();

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
  const { statistics: printStatistics, loading: statsLoading } =
    usePrintOrderStatistics();

  useEffect(() => {
    if (filters.status !== 'CONFIRMED') {
      setPrintStatus(null);
    }
  }, [filters.status, setPrintStatus]);

  const apiFilters = useMemo(() => {
    const baseFilters = buildApiFiltersFromUrlState(filters);

    if (printStatus === 'printed') {
      return { ...baseFilters, isPrinted: true };
    } else if (printStatus === 'not_printed') {
      return { ...baseFilters, isPrinted: false };
    }

    return baseFilters;
  }, [filters, printStatus]);

  const statisticsCards = useMemo(
    () => buildStatisticsCards(printStatistics),
    [printStatistics]
  );

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

  const { page, limit } = filters;

  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useOrders(apiFilters);

  const { statistics } = useOrderStatistics();

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
  const error = useMemo(() => {
    if (!queryError) return null;
    const axiosError = queryError as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || queryError.message;
  }, [queryError]);

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
  const {
    scannedOrders,
    confirmedOrders,
    nonConfirmedGroups,
    addOrder,
    removeOrder,
    clearOrders,
    hasOrder,
    searchQuery,
    setSearchQuery,
    filteredOrders,
    confirmedFilteredOrders,
  } = useScannedOrders();

  const handleScan = useCallback(
    async (barcode: string) => {
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
        const order = await getOrderByCode(barcode);
        addOrder({ id: order.id, code: barcode, status: order.status });
        playSuccessSound();
        setFlashingCode(barcode);
        setTimeout(() => setFlashingCode(null), 600);
        if (order.status !== 'CONFIRMED') {
          const statusLabel = ORDER_STATUS_ARABIC_LABELS[order.status] || order.status;
          toast.info(`هذا الطلب ليس مؤكد - الحالة: ${statusLabel}`);
        }
      } catch (error: any) {
        playErrorSound();
        toast.error(error?.response?.data?.message || 'هذا الطلب غير موجود');
      } finally {
        setIsScanLoading(false);
      }
    },
    [addOrder, hasOrder, playSuccessSound, playErrorSound, isScannedOrdersModalOpen]
  );

  useBarcodeScanner({
    onScan: handleScan,
    enabled: true,
    minCharLength: 1,
    maxCharLength: 1000,
  });

  const handleScannerPrepared = useCallback(async () => {
    if (confirmedOrders.length === 0) return;
    setIsActionLoading(true);
    try {
      await prepareOrdersMutation({
        orderCodes: confirmedOrders.map((o) => o.code),
      });
      toast.success('تم تحديث الطلبات إلى تم التحضير');
      clearOrders();
      setIsScannedOrdersModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الطلبات');
    } finally {
      setIsActionLoading(false);
    }
  }, [confirmedOrders, prepareOrdersMutation, clearOrders]);

  const handleScannerAwaitingPackaging = useCallback(async () => {
    if (confirmedOrders.length === 0) return;
    setIsActionLoading(true);
    try {
      await waitingMutation({
        orderIds: confirmedOrders.map((o) => o.id),
      });
      toast.success('تم تحديث الطلبات إلى فى انتظار التغليف');
      clearOrders();
      setIsScannedOrdersModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الطلبات');
    } finally {
      setIsActionLoading(false);
    }
  }, [confirmedOrders, waitingMutation, clearOrders]);

  const handleScannerCallAgain = useCallback(async () => {
    if (confirmedOrders.length === 0) return;
    setIsActionLoading(true);
    try {
      await callAgainMutation({
        orders: confirmedOrders.map((o) => ({ id: o.id })),
      });
      toast.success('تم تحديث الطلبات إلى اعادة اتصال');
      clearOrders();
      setIsScannedOrdersModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الطلبات');
    } finally {
      setIsActionLoading(false);
    }
  }, [confirmedOrders, callAgainMutation, clearOrders]);

  const handleScannerChangeProduct = useCallback(() => {
    setIsScannerChangeProductMode((prev) => !prev);
  }, []);

  const handleScannerPackagingNoteChange = useCallback(
    (code: string, note: string) => {
      setScannerPackagingNotes((prev) => ({
        ...prev,
        [code]: note,
      }));
    },
    []
  );

  const handleScannerChangeProductSubmit = useCallback(async () => {
    if (confirmedOrders.length === 0) return;
    setIsActionLoading(true);
    try {
      await callAgainMutation({
        orders: confirmedOrders.map((o) => ({
          id: o.id,
          packagingNote: scannerPackagingNotes[o.code]?.trim() || '',
        })),
      });
      toast.success('تم تغيير المنتج بنجاح');
      clearOrders();
      setScannerPackagingNotes({});
      setIsScannerChangeProductMode(false);
      setIsScannedOrdersModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تغيير المنتج');
    } finally {
      setIsActionLoading(false);
    }
  }, [confirmedOrders, callAgainMutation, clearOrders, scannerPackagingNotes]);

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

  const {
    control,
    formState: { errors },
    setValue,
  } = useFilterForm({
    onSubmit: handleFormSubmit,
  });

  const printedOrdersInSelection = useMemo(() => {
    const ordersToProcess = selectAllMatchingFilters ? orders : selectedOrders;
    return ordersToProcess.filter((o) => o.isPrinted);
  }, [selectAllMatchingFilters, orders, selectedOrders]);

  const hasPrintedOrdersInSelection = printedOrdersInSelection.length > 0;

  const withPrintedCheck = useCallback(
    (action: () => void | Promise<void>) => {
      if (hasPrintedOrdersInSelection) {
        pendingActionRef.current = action;
        setIsPrintedConfirmModalOpen(true);
      } else {
        action();
      }
    },
    [hasPrintedOrdersInSelection]
  );

  const handlePrintedConfirmClose = useCallback(() => {
    setIsPrintedConfirmModalOpen(false);
    pendingActionRef.current = null;
  }, []);

  const handlePrintedConfirm = useCallback(() => {
    setIsPrintedConfirmModalOpen(false);
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }, []);

  const executePrepared = useCallback(async () => {
    const ordersToProcess = selectAllMatchingFilters ? orders : selectedOrders;
    if (ordersToProcess.length === 0) return;
    setIsActionLoading(true);
    try {
      await prepareOrdersMutation({
        orderCodes: ordersToProcess.map((o) => o.code),
      });
      toast.success('تم تحديث الطلبات إلى تم التحضير');
      clearSelections();
      setSelectMode(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الطلبات');
    } finally {
      setIsActionLoading(false);
    }
  }, [selectAllMatchingFilters, orders, selectedOrders, prepareOrdersMutation, clearSelections, setSelectMode]);

  const handlePrepared = useCallback(() => {
    withPrintedCheck(executePrepared);
  }, [withPrintedCheck, executePrepared]);

  const executeAwaitingPackaging = useCallback(async () => {
    const ordersToProcess = selectAllMatchingFilters ? orders : selectedOrders;
    if (ordersToProcess.length === 0) return;
    setIsActionLoading(true);
    try {
      await waitingMutation({
        orderIds: ordersToProcess.map((o) => o.id),
      });
      toast.success('تم تحديث الطلبات إلى فى انتظار التغليف');
      clearSelections();
      setSelectMode(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الطلبات');
    } finally {
      setIsActionLoading(false);
    }
  }, [selectAllMatchingFilters, orders, selectedOrders, waitingMutation, clearSelections, setSelectMode]);

  const handleAwaitingPackaging = useCallback(() => {
    withPrintedCheck(executeAwaitingPackaging);
  }, [withPrintedCheck, executeAwaitingPackaging]);

  const executeCallAgain = useCallback(async () => {
    const ordersToProcess = selectAllMatchingFilters ? orders : selectedOrders;
    if (ordersToProcess.length === 0) return;
    setIsActionLoading(true);
    try {
      await callAgainMutation({
        orders: ordersToProcess.map((o) => ({ id: o.id })),
      });
      toast.success('تم تحديث الطلبات إلى اعادة اتصال');
      clearSelections();
      setSelectMode(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الطلبات');
    } finally {
      setIsActionLoading(false);
    }
  }, [selectAllMatchingFilters, orders, selectedOrders, callAgainMutation, clearSelections, setSelectMode]);

  const handleCallAgain = useCallback(() => {
    withPrintedCheck(executeCallAgain);
  }, [withPrintedCheck, executeCallAgain]);

  const executeChangeProduct = useCallback(() => {
    setIsChangeProductModalOpen(true);
  }, []);

  const handleChangeProduct = useCallback(() => {
    const ordersToProcess = selectAllMatchingFilters ? orders : selectedOrders;
    if (ordersToProcess.length === 0) return;
    withPrintedCheck(executeChangeProduct);
  }, [selectAllMatchingFilters, orders, selectedOrders, withPrintedCheck, executeChangeProduct]);

  const handleChangeProductSubmit = useCallback(
    async (ordersWithNotes: { id: number; packagingNote: string }[]) => {
      setIsActionLoading(true);
      try {
        await callAgainMutation({
          orders: ordersWithNotes,
        });
        toast.success('تم تغيير المنتج بنجاح');
        setIsChangeProductModalOpen(false);
        clearSelections();
        setSelectMode(false);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'فشل تغيير المنتج');
        throw error;
      } finally {
        setIsActionLoading(false);
      }
    },
    [callAgainMutation, clearSelections, setSelectMode]
  );

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
        <Breadcrumb
          items={[{ title: 'الطلبات' }, { title: 'طباعة الطلبات' }]}
        />
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
        printStatus={printStatus}
        onPrintStatusChange={setPrintStatus}
        printStatistics={printStatistics}
        selectedOrders={selectedOrders}
        showPrintStatusToggle={filters.status === 'CONFIRMED'}
      />

      <div className="flex flex-col sm:flex-row justify-between gap-2 mt-10 mb-6 select-none">
        <div className="flex justify-center sm:justify-start items-center gap-4">
          <p className="text-gray-700">عدد جميع الطلبات: {totalOrders}</p>
          {selectMode && (
            <Button variant="default" size="sm" onClick={handleSelectAllToggle}>
              {selectAllMatchingFilters ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </Button>
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
          <Button
            variant="default"
            onClick={toggleSelectMode}
            className="rounded-full px-5"
          >
            <span>تحديد</span>
            {selectMode ? <ScanLine /> : <Scan />}
          </Button>
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
                city=""
                address=""
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
                isPrinted={order.isPrinted}
                disableNavigation
                hideCustomerInfo
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
          isLoading={isActionLoading}
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
          setIsScannerChangeProductMode(false);
          setScannerPackagingNotes({});
          clearOrders();
        }}
        scannedOrders={scannedOrders}
        confirmedOrders={confirmedOrders}
        nonConfirmedGroups={nonConfirmedGroups}
        onRemoveOrder={removeOrder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredOrders={filteredOrders}
        confirmedFilteredOrders={confirmedFilteredOrders}
        onPrepared={handleScannerPrepared}
        onAwaitingPackaging={handleScannerAwaitingPackaging}
        onCallAgain={handleScannerCallAgain}
        onChangeProduct={handleScannerChangeProduct}
        isLoading={isActionLoading}
        isScanLoading={isScanLoading}
        flashingCode={flashingCode}
        isChangeProductMode={isScannerChangeProductMode}
        packagingNotes={scannerPackagingNotes}
        onPackagingNoteChange={handleScannerPackagingNoteChange}
        onChangeProductSubmit={handleScannerChangeProductSubmit}
      />

      <PrintedOrdersConfirmModal
        isOpen={isPrintedConfirmModalOpen}
        onClose={handlePrintedConfirmClose}
        onConfirm={handlePrintedConfirm}
        printedOrders={printedOrdersInSelection}
      />

      <ChangeProductModal
        isOpen={isChangeProductModalOpen}
        onClose={() => setIsChangeProductModalOpen(false)}
        orders={selectAllMatchingFilters ? orders : selectedOrders}
        onSubmit={handleChangeProductSubmit}
        isLoading={isActionLoading}
      />
    </div>
  );
}
