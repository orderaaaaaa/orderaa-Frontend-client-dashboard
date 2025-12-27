import React, { useState, useEffect, useMemo, useRef } from 'react';

import { useGetCustomers } from '../hooks/useGetCustomers';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { TABLE_HEADERS } from '../constants/CustomerHeaders';
import { Pagination } from '@/components/Pagination';
import { CustomerRow } from './CustomerRow';
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

  const editCustomerMutation = useEditCustomer({
    onSuccess: () => {
      setOpenMenuId(null);
    },
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleToggleBlock = (
    customerId: number,
    currentBlockStatus: boolean
  ) => {
    editCustomerMutation.mutate({
      customerId,
      payload: {
        isBlocked: !currentBlockStatus,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D24E1]"></div>
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
      <div className="w-[97%] mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="bg-[#f1eefa]">
                {TABLE_HEADERS.map((header, index) => (
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
              {data?.data.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onToggleBlock={handleToggleBlock}
                  onRowClick={handleRowClick}
                  isPending={editCustomerMutation.isPending}
                />
              ))}
            </tbody>
          </table>
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

      {/* Limit Dropdown */}
      <div ref={limitRef} className="relative w-fit">
        <div
          onClick={() => setIsLimitOpen((prev) => !prev)}
          className="bg-[#5D24E1] w-15 py-1 rounded-full text-white flex items-center justify-center cursor-pointer select-none"
        >
          {limit}
          <RxChevronUp
            className={`transition-transform ${
              isLimitOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {isLimitOpen && (
          <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-md overflow-hidden">
            {LIMIT_OPTIONS.map((option) => (
              <div
                key={option}
                onClick={() => handleSelectLimit(option)}
                className="text-[#5D24E1] text-center py-1 cursor-pointer hover:bg-[#f1eefa]"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
