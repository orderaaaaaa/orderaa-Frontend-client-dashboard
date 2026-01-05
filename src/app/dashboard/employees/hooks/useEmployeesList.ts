'use client';

import React from 'react';
import {
  useFilteredEmployees,
} from '@/app/dashboard/employees/hooks/useEmployees';
import { useEmployeeFilters } from './useEmployeeFilters';

export function useEmployeesList() {
  const { filters, limit, hasActiveFilters } = useEmployeeFilters();
  const currentPage = filters.page || 1;

  // Always use filtered employees query, which handles pagination on server
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useFilteredEmployees(filters);

  const { employees, totalItems, paginationProps } = React.useMemo(() => {
    return {
      employees: paginatedData?.data ?? [],
      totalItems: paginatedData?.totalItems ?? 0,
      paginationProps: {
        currentPage: paginatedData?.currentPage ?? currentPage,
        totalPages: paginatedData?.totalPages ?? 1,
        hasNextPage: paginatedData?.hasNextPage ?? false,
        hasPreviousPage: paginatedData?.hasPreviousPage ?? false,
      },
    };
  }, [paginatedData, currentPage]);

  return {
    filters,
    employees,
    totalItems,
    paginationProps,
    isLoading,
    isError,
  };
}
