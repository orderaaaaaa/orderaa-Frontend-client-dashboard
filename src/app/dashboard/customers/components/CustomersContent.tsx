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
import CustomersFilterBar from './CustomersFilterBar';
import CustomerStates from './CustomerStates';
import { CustomerRow } from './CustomerRow';
import { CustomerCard } from './CustomerCard';
import CustomerDetailsModal from './modals/CustomerDetailsModal';
import { TABLE_HEADERS } from '../constants';
import { useGetCustomers, useEditCustomer } from '../hooks';
import { useDebounce } from '@/utils/debounce';
import { TimePeriod } from '@/utils/dateRangeUtils';
import { Can } from '@/components/Can';
import { PERMISSIONS } from '@/lib/permissions';
import { Customer } from '../types/customer';
import { MergeableCustomer } from '../types/merge';
import CustomerMergeModal from '@/components/OrderDetails/CustomerMergeModal';

/** List-page `Customer` → the shape the shared merge popup renders. */
function toMergeableCustomer(customer: Customer): MergeableCustomer {
  const notes = Array.isArray(customer.notes)
    ? customer.notes
    : customer.notes
      ? [customer.notes]
      : [];

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phoneNumbers: customer.phoneNumbers,
    notes,
    isBlocked: customer.isBlocked,
    blockedUntil: customer.blockedUntil ?? null,
    ordersCount: customer.numberOfOrders,
  };
}

interface CustomerFilters {
  clientStatus: string;
  orderStatus: string;
  activityType: string;
  allCustomers: string;
}

export function CustomersContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtersOverflow, setFiltersOverflow] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | ''>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selection mode for merging duplicate customers (T4) — modelled on the
  // products page's تحديد toggle. Merge is only offered for exactly two.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showMergeModal, setShowMergeModal] = useState(false);

  const [filters, setFilters] = useState<CustomerFilters>({
    clientStatus: '',
    orderStatus: '',
    activityType: '',
    allCustomers: '',
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

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

  const { data, isLoading, isError, error } = useGetCustomers({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    isBlocked: isBlockedParam,
    latestOrderStatus: orderStatusParam,
  });

  const hasBlockedCustomers = useMemo(() => {
    return data?.data.some((customer: any) => customer.isBlocked) || false;
  }, [data]);

  const activeHeaders = useMemo(() => {
    return TABLE_HEADERS.filter(
      (header) =>
        !header.isConditional || (header.isConditional && hasBlockedCustomers)
    );
  }, [hasBlockedCustomers]);

  const editCustomerMutation = useEditCustomer({
    onSuccess: () => {},
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

  const handleRowClick = useCallback((customerId: number) => {
    setSelectedCustomerId(customerId);
    setIsDetailsModalOpen(true);
  }, []);

  const handleToggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const handleToggleSelect = useCallback((customerId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
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

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters.clientStatus, filters.orderStatus]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.clientStatus) count++;
    if (filters.orderStatus && filters.orderStatus !== 'all') count++;
    if (filters.activityType) count++;
    if (filters.allCustomers) count++;
    return count;
  }, [filters]);

  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4">
        <Breadcrumb items={[{ title: 'العملاء' }, { title: 'إدارة العملاء' }]} />
      </div>

      <CustomerStates />

      <div className="sm:px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <div className="flex-1">
            <CustomersSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={clearSearchQuery}
            />
          </div>
          <Button
            variant="default"
            className="rounded-full font-semibold flex items-center gap-2 text-xs sm:text-sm px-5 relative"
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
              <span className="absolute -top-2 -left-2 bg-white text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-primary/20">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Can code={PERMISSIONS.CUSTOMERS_MERGE}>
            <div
              className="bg-primary flex flex-row items-center justify-center gap-2 px-5 py-2 rounded-full cursor-pointer text-white text-xs sm:text-sm flex-shrink-0"
              onClick={handleToggleSelectMode}
            >
              <p>تحديد</p>
              {selectMode ? (
                <ScanLine className="w-5 h-5" />
              ) : (
                <Scan className="w-5 h-5" />
              )}
            </div>
          </Can>
        </div>

        {selectMode && (
          <div className="flex flex-row items-center gap-2">
            <X
              onClick={handleToggleSelectMode}
              className="cursor-pointer text-primary h-5 w-5"
            />
            <span className="text-sm text-gray-600">
              تم تحديد {selectedIds.size} عميل (اختر عميلين للدمج)
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>حدث خطأ في تحميل البيانات: {error?.message}</p>
          </div>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden mx-4">
            <div className="overflow-x-auto">
              <table className="w-full" dir="rtl">
                <thead>
                  <tr className="bg-[#f1eefa]">
                    {selectMode && <th className="px-4 py-4 w-10" />}
                    {activeHeaders.map((header, index) => (
                      <th
                        key={index}
                        className={`px-4 py-4 md:text-md font-medium text-gray-700 whitespace-nowrap text-${header.align}`}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.data.map((customer: any) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onToggleBlock={handleToggleBlock}
                      onRowClick={handleRowClick}
                      isPending={editCustomerMutation.isPending}
                      showNotesColumn={hasBlockedCustomers}
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
              {data.data.map((customer: any) => (
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
        <div className="flex flex-col items-center justify-center py-16 gap-3">
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
        customerId={selectedCustomerId || undefined}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomerId(null);
        }}
      />

      {showBulkActions && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg py-4 px-6">
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
