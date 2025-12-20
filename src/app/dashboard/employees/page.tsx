// page.tsx
'use client';

import React from 'react';
import { If, Then, Else } from 'react-if';
import { useFilteredEmployees } from '@/app/dashboard/employees/hooks/useEmployees';
import EmployeeHeader from './components/EmployeeHeader';
import { StatCardsSection } from './components/StatCardsSection';
import { EmployeeSearchFilter } from './components/EmployeeSearchFilter';
import { EmployeeCard } from './components/EmployeeCard';
import { Pagination } from './components/Pagination';
import { useEmployeeFilters } from './hooks/useEmployeeFilters';
import { useEmployeesStore } from '@/store/employeesStore';

export default function AllEmployees() {
  const { filters } = useEmployeeFilters();

  const {
    data: paginatedResponse,
    isLoading,
    isError,
  } = useFilteredEmployees(filters);

  const employees = paginatedResponse?.data || [];
  const totalItems = paginatedResponse?.totalItems || 0;
  const setCurrentPage = useEmployeesStore((state) => state.setCurrentPage);

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Failed to load employees. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6">
      <EmployeeHeader />
      <StatCardsSection totalItems={totalItems} />
      <EmployeeSearchFilter />

      <If condition={isLoading}>
        <Then>
          <div className="flex justify-center items-center h-64 mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </Then>
        <Else>
          <div className="mt-10">
            <If condition={employees.length === 0}>
              <Then>
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">لم يتم العثور على موظفين.</p>
                </div>
              </Then>
              <Else>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {employees.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>

                {paginatedResponse && (
                  <Pagination
                    currentPage={paginatedResponse.currentPage}
                    totalPages={paginatedResponse.totalPages}
                    hasNextPage={paginatedResponse.hasNextPage}
                    hasPreviousPage={paginatedResponse.hasPreviousPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </Else>
            </If>
          </div>
        </Else>
      </If>
    </div>
  );
}
