'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  LiaUsersSolid,
  LiaSlidersHSolid,
  LiaObjectGroupSolid,
} from 'react-icons/lia';
import { Scan, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/dashboard-layout';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import PaginationFooter from '@/components/ui/pagination-footer';
import LoadingAnimation from '@/components/ui/loadingAnimation';
import CustomersSearchBar from './CustomersSearchBar';
import CustomersFilterBar, { CustomerFilters } from './CustomersFilterBar';
import CustomerStates, { CustomerStatSelection } from './CustomerStates';
import { CustomerRow } from './CustomerRow';
import { CustomerCard } from './CustomerCard';
import CustomerDetailsModal from './modals/CustomerDetailsModal';
import { TABLE_HEADERS, CUSTOMER_BADGE_PRIORITY } from '../constants';
import { useGetCustomers, useEditCustomer } from '../hooks';
import { useDebounce } from '@/utils/debounce';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import { FIXED_BOTTOM_BAR_CLASS } from '@/constants/dashboard-layout';
import {
  Customer,
  CustomerBadge,
  CustomerBadgeFilter,
  CustomerSegment,
} from '../types/customer';
import { MergeableCustomer } from '../types/merge';
import CustomerMergeModal from '@/components/OrderDetails/CustomerMergeModal';
import { ErrorState } from '@/components/ui/state-panels';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { useCustomerBadgeSettings } from '@/app/dashboard/store-settings/hooks/useCustomerBadgeSettings';
import { toast } from 'react-toastify';

/** List-page `Customer` → the shape the shared merge popup renders. */
function toMergeableCustomer(customer: Customer): MergeableCustomer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phoneNumbers: customer.phoneNumbers,
    notes: customer.notes,
    isBlocked: customer.isBlocked,
    blockedUntil: null,
    ordersCount: customer.numberOfOrders,
  };
}

const isSegment = (value: string): value is CustomerSegment =>
  value === 'all' || value === 'premium';

export function CustomersContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOverflow, setFiltersOverflow] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | ''>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selection mode for merging duplicate customers (T4) — modelled on the
  // products page's تحديد toggle. Merge is only offered for exactly two.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [filters, setFilters] = useState<CustomerFilters>({
    clientStatus: '',
    orderStatus: '',
    badge: '',
    segment: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { hasPermission } = usePermissionCheck();
  const canReadBadgeSettings = hasPermission(PERMISSIONS.MERCHANT_SETTINGS_READ);
  const { data: badgeSettings } = useCustomerBadgeSettings({
    enabled: canReadBadgeSettings,
  });
  const enabledBadges: readonly CustomerBadge[] =
    badgeSettings?.enabledBadges ?? CUSTOMER_BADGE_PRIORITY;

  const badgeParam = useMemo((): CustomerBadgeFilter | undefined => {
    if (filters.badge === 'none') return 'none';
    return enabledBadges.find((badge) => badge === filters.badge);
  }, [filters.badge, enabledBadges]);

  const segmentParam = isSegment(filters.segment) ? filters.segment : undefined;

  useEffect(() => {
    if (filters.badge && filters.badge !== 'none' && !badgeParam) {
      setFilters((prev) => ({ ...prev, badge: '' }));
    }
  }, [filters.badge, badgeParam]);

  const isBlockedParam = useMemo(() => {
    if (!filters.clientStatus) return undefined;
    const status = filters.clientStatus;
    if (status === 'active') return false;
    if (status === 'frozen') return true;
    return undefined;
  }, [filters.clientStatus]);

  const orderStatusParam = useMemo(() => {
    if (!filters.orderStatus || filters.orderStatus === 'all') return undefined;
    return filters.orderStatus;
  }, [filters.orderStatus]);

  const { data, isLoading, isError, error, refetch } = useGetCustomers({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    isBlocked: isBlockedParam,
    latestOrderStatus: orderStatusParam,
    badge: badgeParam,
    segment: segmentParam,
  });

  const editCustomerMutation = useEditCustomer({
    onSuccess: (_data, variables) => {
      toast.success(
        variables.payload.isBlocked ? 'تم الحظر بنجاح' : 'تم إلغاء الحظر بنجاح'
      );
    },
  });

  const handleToggleBlock = useCallback(
    (customerId: number, currentBlockStatus: boolean, note?: string) => {
      editCustomerMutation.mutate({
        customerId,
        payload: {
          isBlocked: !currentBlockStatus,
          notes: note || '',
        },
      });
    },
    [editCustomerMutation]
  );

  const handleRowClick = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
  }, []);

  const handleToggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const handleToggleSelect = useCallback((customer: Customer) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(customer.id)) {
        next.delete(customer.id);
      } else {
        next.add(customer.id);
      }
      return next;
    });
  }, []);

  // The two selected customers, in list order — merge is only offered when
  // exactly two are selected (spec §3 non-goals: no 3-way merge from the UI).
  const selectedCustomers = useMemo(() => {
    if (selectedIds.size !== 2 || !data?.data) return [];
    return data.data.filter((customer: Customer) => selectedIds.has(customer.id));
  }, [selectedIds, data]);

  const showBulkActions = selectMode && selectedIds.size === 2;

  useEffect(() => {
    document.body.style.paddingBottom = showBulkActions ? '80px' : '0px';
    return () => {
      document.body.style.paddingBottom = '0px';
    };
  }, [showBulkActions]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof CustomerFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleClearFilter = useCallback((key: keyof CustomerFilters) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
  }, []);

  const handleStatSelect = useCallback((selection: CustomerStatSelection) => {
    setFilters((prev) => ({
      ...prev,
      badge: selection.kind === 'badge' ? selection.badge : '',
      segment: selection.kind === 'premium' ? 'premium' : '',
    }));
  }, []);

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    filters.clientStatus,
    filters.orderStatus,
    filters.badge,
    filters.segment,
  ]);

  useEffect(() => {
    setSelectedIds((prev) => (prev.size === 0 ? prev : new Set()));
  }, [currentPage, pageSize, debouncedSearch, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.clientStatus) count++;
    if (filters.orderStatus && filters.orderStatus !== 'all') count++;
    if (filters.badge) count++;
    if (filters.segment && filters.segment !== 'all') count++;
    return count;
  }, [filters]);

  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4">
        <Breadcrumb items={[{ title: 'العملاء' }, { title: 'إدارة العملاء' }]} />
      </div>

      <CustomerStates
        enabledBadges={enabledBadges}
        activeBadge={badgeParam ?? ''}
        activeSegment={segmentParam ?? ''}
        onSelect={handleStatSelect}
      />

      <div className="px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full sm:flex-1 min-w-0">
            <CustomersSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={clearSearchQuery}
            />
          </div>
          <div className="flex flex-row items-center gap-3">
            <Button
              type="button"
              variant="default"
              aria-expanded={showFilters}
              className="h-10 rounded-full font-semibold flex items-center gap-2 text-sm px-5 relative flex-1 sm:flex-none"
              onClick={() => {
                setShowFilters((prev) => {
                  if (prev) setFiltersOverflow(false);
                  return !prev;
                });
              }}
            >
              <LiaSlidersHSolid className="w-5 h-5" />
              فلاتر متقدمة
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -end-2 bg-white text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-primary/20">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Can code={PERMISSIONS.CUSTOMERS_MERGE}>
              <Button
                type="button"
                variant="default"
                aria-pressed={selectMode}
                onClick={handleToggleSelectMode}
                className="h-10 rounded-full flex items-center justify-center gap-2 px-5 text-sm flex-1 sm:flex-none"
              >
                <span>تحديد</span>
                {selectMode ? (
                  <ScanLine className="w-5 h-5" />
                ) : (
                  <Scan className="w-5 h-5" />
                )}
              </Button>
            </Can>
          </div>
        </div>

        {selectMode && (
          <div className="flex flex-row flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="touch"
              aria-label="إلغاء التحديد"
              onClick={handleToggleSelectMode}
            >
              <X className="text-primary h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-600">
              تم تحديد {selectedIds.size} عميل (اختر عميلين للدمج)
            </span>
            <span className="text-xs text-amber-600">
              التحديد يقتصر على الصفحة الحالية
            </span>
          </div>
        )}

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: showFilters ? '1fr' : '0fr' }}
          onTransitionEnd={() => {
            if (showFilters) setFiltersOverflow(true);
          }}
        >
          <div className={filtersOverflow ? 'overflow-visible' : 'overflow-hidden'}>
            <CustomersFilterBar
              filters={filters}
              enabledBadges={enabledBadges}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-start gap-4">
          <DateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            timePeriod={timePeriod}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTimePeriodChange={setTimePeriod}
            className="px-3 sm:pe-8"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingAnimation />
      ) : isError ? (
        <ErrorState
          error={error}
          fallback="تعذّر تحميل العملاء"
          onRetry={() => refetch()}
          className="min-h-[400px]"
        />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden mx-4">
            <div className="overflow-x-auto">
              <table className="w-full" dir="rtl">
                <thead>
                  <tr className="bg-[#f1eefa]">
                    {selectMode && <th className="px-4 py-4 w-10" />}
                    {TABLE_HEADERS.map((header) => (
                      <th
                        key={header.label}
                        className={`px-4 py-4 md:text-md font-medium text-gray-700 whitespace-nowrap text-${header.align}`}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onToggleBlock={handleToggleBlock}
                      onRowClick={handleRowClick}
                      isPending={editCustomerMutation.isPending}
                      selectionMode={selectMode}
                      isSelected={selectedIds.has(customer.id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
              {data.data.map((customer) => (
                <div key={customer.id} className="w-full max-w-md">
                  <CustomerCard
                    customer={customer}
                    onToggleBlock={handleToggleBlock}
                    onRowClick={handleRowClick}
                    isPending={editCustomerMutation.isPending}
                    selectionMode={selectMode}
                    isSelected={selectedIds.has(customer.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 px-4 text-center">
          <LiaUsersSolid className="w-16 h-16 text-gray-300" />
          {debouncedSearch || activeFilterCount > 0 ? (
            <>
              <p className="text-lg font-semibold text-gray-400">لا توجد نتائج</p>
              <p className="text-sm text-gray-400">
                لا توجد نتائج مطابقة للبحث أو الفلاتر المحددة
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-400">لا يوجد عملاء</p>
              <p className="text-sm text-gray-400">لم يتم إضافة عملاء بعد</p>
            </>
          )}
        </div>
      )}

      <CustomerDetailsModal
        customerId={selectedCustomer?.id}
        badge={selectedCustomer?.badge ?? null}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomer(null);
        }}
      />

      {showBulkActions && (
        <div
          className={`${FIXED_BOTTOM_BAR_CLASS} bg-white border-t border-gray-200 shadow-lg py-4 px-6`}
        >
          <div className="mx-auto overflow-x-auto scrollbar-hide">
            <div className="pb-2 flex flex-row gap-2 items-center justify-center max-w-7xl w-max mx-auto">
              <Button
                variant="outline"
                onClick={() => setShowMergeModal(true)}
                className="grid grid-cols-[auto_1fr] items-center gap-2 px-4 py-2 rounded-3xl bg-white border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer whitespace-nowrap h-10"
              >
                <LiaObjectGroupSolid className="size-5" />
                <span>دمج العملاء (2)</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {showMergeModal && selectedCustomers.length === 2 && (
        <CustomerMergeModal
          isOpen={showMergeModal}
          onClose={() => setShowMergeModal(false)}
          customerA={toMergeableCustomer(selectedCustomers[0])}
          customerB={toMergeableCustomer(selectedCustomers[1])}
          onSuccess={() => {
            setShowMergeModal(false);
            setSelectedIds(new Set());
            setSelectMode(false);
          }}
        />
      )}

      <div className="mt-6">
        <PaginationFooter
          currentPage={data?.meta?.currentPage || 1}
          totalPages={totalPages}
          totalItems={totalItems}
          hasNextPage={data?.meta?.hasNextPage || false}
          hasPreviousPage={data?.meta?.hasPreviousPage || false}
          onPageChange={handlePageChange}
          onPrevious={() => handlePageChange(Math.max(1, (data?.meta?.currentPage || 1) - 1))}
          onNext={() => handlePageChange(Math.min(totalPages, (data?.meta?.currentPage || 1) + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
