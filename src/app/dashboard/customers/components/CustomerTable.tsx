import React, { useState, useEffect } from 'react';

import { useGetCustomers } from '../hooks/useGetCustomers';
import { useEditCustomer } from '../hooks/useEditCustomer';
import { TABLE_HEADERS } from '../constants/CustomerHeaders';
import { Pagination } from '@/components/Pagination';
import { CustomerRow } from './CustomerRow';
import CustomerDetailsModal from './modals/CustomerDetailsModal'; // Import the modal

interface CustomerTableProps {
  searchTerm?: string;
  clientStatus?: string;
  orderStatus?: string;
}

export default function CustomerTable({
  searchTerm = '',
  clientStatus,
  orderStatus,
}: CustomerTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  ); // Add this state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Add this state
  const limit = 10;

  // Convert clientStatus string to boolean or undefined
  const isBlockedParam = React.useMemo(() => {
    if (clientStatus === undefined) return undefined;
    if (clientStatus === 'true') return true;
    if (clientStatus === 'false') return false;
    return undefined;
  }, [clientStatus]);

  const { data, isLoading, isError, error } = useGetCustomers({
    page: currentPage,
    limit: limit,
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

  // Add this handler
  const handleRowClick = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setIsDetailsModalOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientStatus, orderStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
                  onRowClick={handleRowClick} // Pass the handler
                  isPending={editCustomerMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add single modal at the table level */}
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
    </>
  );
}
