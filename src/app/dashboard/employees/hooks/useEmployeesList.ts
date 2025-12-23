'use client';

import React from 'react';
import {
  useEmployees,
  useFilteredEmployees,
} from '@/app/dashboard/employees/hooks/useEmployees';
import { useEmployeeFilters } from './useEmployeeFilters';

export function useEmployeesList() {
  const { filters, limit, hasActiveFilters } = useEmployeeFilters();
  const currentPage = filters.page || 1;

  const filtered = useFilteredEmployees(filters, { enabled: hasActiveFilters });
  const all = useEmployees({ enabled: !hasActiveFilters });

  const { employees, totalItems, paginationProps, isLoading, isError } =
    React.useMemo(() => {
      const activeSource = hasActiveFilters ? filtered : all;
      const loading = !!activeSource.isLoading;
      const error = !!(hasActiveFilters ? filtered.isError : all.isError);

      const total = hasActiveFilters
        ? filtered.data?.totalItems ?? 0
        : all.data?.length ?? 0;

      const safeTotalPages = Math.max(1, Math.ceil(total / limit));

      const list = hasActiveFilters
        ? filtered.data?.data ?? []
        : (all.data ?? []).slice(
            (currentPage - 1) * limit,
            currentPage * limit
          );

      const pagination = hasActiveFilters
        ? filtered.data && {
            currentPage: filtered.data.currentPage ?? currentPage,
            totalPages: filtered.data.totalPages ?? safeTotalPages,
            hasNextPage:
              filtered.data.hasNextPage ??
              (filtered.data.currentPage ?? currentPage) < safeTotalPages,
            hasPreviousPage:
              filtered.data.hasPreviousPage ??
              (filtered.data.currentPage ?? currentPage) > 1,
          }
        : {
            currentPage,
            totalPages: safeTotalPages,
            hasNextPage: currentPage < safeTotalPages,
            hasPreviousPage: currentPage > 1,
          };

      return {
        employees: list,
        totalItems: total,
        paginationProps: pagination,
        isLoading: loading,
        isError: error,
      };
    }, [
      hasActiveFilters,
      filtered.data,
      filtered.isLoading,
      filtered.isError,
      all.data,
      all.isLoading,
      all.isError,
      currentPage,
      limit,
    ]);

  return {
    filters,
    employees,
    totalItems,
    paginationProps,
    isLoading,
    isError,
  };
}
