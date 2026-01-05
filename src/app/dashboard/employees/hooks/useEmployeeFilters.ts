import { useMemo, useEffect } from 'react';
import { EmployeeFilters } from '@/schemas/employee.schema';
import { FILTER_ALL } from '../constants/employeesFilterOptions';
import { useEmployeesStore } from '@/app/dashboard/employees/store/employeesStore';

export function useEmployeeFilters() {
  const debouncedSearchQuery = useEmployeesStore(
    (state) => state.debouncedSearchQuery
  );
  const limit = useEmployeesStore((state) => state.filterSelections.limit);
  const filterSelections = useEmployeesStore((state) => state.filterSelections);
  const currentPage = useEmployeesStore((state) => state.currentPage);
  const setCurrentPage = useEmployeesStore((state) => state.setCurrentPage);

  const filters: EmployeeFilters = useMemo(() => {
    const query = debouncedSearchQuery.trim();

    const filterObj: EmployeeFilters = {
      page: currentPage,
      limit,
      ...(filterSelections.accessLevel !== FILTER_ALL && {
        accessLevel: filterSelections.accessLevel,
      }),
      ...(filterSelections.department !== FILTER_ALL && {
        department: filterSelections.department,
      }),
      ...(filterSelections.performance !== FILTER_ALL && {
        performance: filterSelections.performance as 'LOW' | 'HIGH',
      }),
    };

    if (!query) {
      return filterObj;
    }

    // Determine search type based on query content
    if (/^\d+$/.test(query)) {
      filterObj.phoneNumber = query;
    } else if (query.includes('@')) {
      filterObj.email = query;
    } else {
      filterObj.name = query;
    }

    return filterObj;
  }, [debouncedSearchQuery, filterSelections, currentPage, limit]);

  const hasActiveFilters = useMemo(() => {
    const query = debouncedSearchQuery.trim();
    const hasSearch = query.length > 0;
    const hasSelectFilters =
      filterSelections.accessLevel !== FILTER_ALL ||
      filterSelections.department !== FILTER_ALL ||
      filterSelections.performance !== FILTER_ALL;

    return hasSearch || hasSelectFilters;
  }, [debouncedSearchQuery, filterSelections]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterSelections, setCurrentPage]);

  return { filters, limit, hasActiveFilters };
}
