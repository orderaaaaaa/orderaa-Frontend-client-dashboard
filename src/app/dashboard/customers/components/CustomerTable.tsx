import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGetCustomers } from '../hooks/useGetCustomers';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { TABLE_HEADERS } from '../constants/CustomerHeaders';
import { Pagination } from '@/components/Pagination';
import { CustomerRow } from './CustomerRow';
import { CustomerCard } from './CustomerCard';
import CustomerDetailsModal from './modals/CustomerDetailsModal';
import { RxChevronUp } from 'react-icons/rx';

interface CustomerTableProps {
  searchTerm?: string;
  clientStatus?: string;
  orderStatus?: string;
}

const LIMIT_OPTIONS = [10, 15, 20, 25];

export default function CustomerTable({
  searchTerm = '',
  clientStatus,
  orderStatus,
}: CustomerTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  const limitRef = useRef<HTMLDivElement | null>(null);

  const isBlockedParam = useMemo(() => {
    if (clientStatus === undefined) return undefined;
    if (clientStatus === 'true') return true;
    if (clientStatus === 'false') return false;
    return undefined;
  }, [clientStatus]);

  const { data, isLoading, isError, error } = useGetCustomers({
    page: currentPage,
    limit,
    search: searchTerm,
    isBlocked: isBlockedParam,
    latestOrderStatus: orderStatus,
  });

  // Logic to determine if the Ban Notes column should appear
  const hasBlockedCustomers = useMemo(() => {
    return data?.data.some((customer: any) => customer.isBlocked) || false;
  }, [data]);

  // Filter headers based on the presence of blocked customers
  const activeHeaders = useMemo(() => {
    return TABLE_HEADERS.filter(
      (header) =>
        !header.isConditional || (header.isConditional && hasBlockedCustomers)
    );
  }, [hasBlockedCustomers]);

  const editCustomerMutation = useEditCustomer({
    onSuccess: () => setOpenMenuId(null),
  });

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const handleToggleBlock = (
    customerId: number,
    currentBlockStatus: boolean,
    note?: string
  ) => {
    editCustomerMutation.mutate({
      customerId,
      payload: {
        isBlocked: !currentBlockStatus,
        notes: note || '',
      },
    });
  };

  const handleRowClick = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setIsDetailsModalOpen(true);
  };

  const handleSelectLimit = (value: number) => {
    setLimit(value);
    setCurrentPage(1);
    setIsLimitOpen(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientStatus, orderStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        limitRef.current &&
        !limitRef.current.contains(event.target as Node)
      ) {
        setIsLimitOpen(false);
      }
      if (openMenuId && !(event.target as Element).closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-red-600">
          حدث خطأ في تحميل البيانات: {error?.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block w-[97%] mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="bg-[#f1eefa]">
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
              {data?.data.map((customer: any) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onToggleBlock={handleToggleBlock}
                  onRowClick={handleRowClick}
                  isPending={editCustomerMutation.isPending}
                  showNotesColumn={hasBlockedCustomers} // Pass the visibility state
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden w-full px-[1.5%]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 justify-items-center">
          {data?.data.map((customer: any) => (
            <div key={customer.id} className="w-full max-w-md">
              {' '}
              {/* Wrapper to control individual card width */}
              <CustomerCard
                customer={customer}
                onToggleBlock={handleToggleBlock}
                onRowClick={handleRowClick}
                isPending={editCustomerMutation.isPending}
              />
            </div>
          ))}
        </div>
      </div>

      <CustomerDetailsModal
        customerId={selectedCustomerId || undefined}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomerId(null);
        }}
      />

      <div className="flex flex-wrap justify-center max-sm:gap-4 sm:justify-between items-center w-[97%] mx-auto mt-10 mb-5">
        <div className="text-lg">
          عرض <span className="font-bold">1- {data?.data.length}</span> من اصل{' '}
          <span className="font-bold">{data?.meta.totalItems}</span> عميل
        </div>
        <Pagination
          currentPage={data?.meta.currentPage || 1}
          totalPages={data?.meta.totalPages || 1}
          hasNextPage={data?.meta.hasNextPage || false}
          hasPreviousPage={data?.meta.hasPreviousPage || false}
          onPageChange={handlePageChange}
        />
      </div>
      <div className="flex">
        <div ref={limitRef} className="relative w-fit mr-[1.5%]">
          <div
            onClick={() => setIsLimitOpen((prev) => !prev)}
            className="bg-primary w-15 py-1 px-3 rounded-full text-white flex items-center justify-center cursor-pointer select-none"
          >
            {limit}
            <RxChevronUp
              className={`transition-transform ${isLimitOpen ? 'rotate-180' : ''
                }`}
            />
          </div>

          {isLimitOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-md overflow-hidden z-10">
              {LIMIT_OPTIONS.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectLimit(option)}
                  className="text-primary text-center py-1 cursor-pointer hover:bg-[#f1eefa]"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
