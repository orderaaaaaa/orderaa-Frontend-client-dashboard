'use client';

import React from 'react';
import { If, Then, Else } from 'react-if';
import { useEmployeesList } from '@/app/dashboard/employees/hooks/useEmployeesList';
import EmployeeHeader from './components/EmployeeHeader';
import { StatCardsSection } from './components/StatCardsSection';
import { EmployeeSearchFilter } from './components/EmployeeSearchFilter';
import { EmployeeCard } from './components/EmployeeCard';
import { Pagination } from '../../../components/Pagination';
import { useEmployeesStore } from '@/app/dashboard/employees/store/employeesStore';
import { LimitSelector } from './components/LimitSelector';

export default function AllEmployees() {
  const { employees, totalItems, paginationProps, isLoading, isError } =
    useEmployeesList();

  const setCurrentPage = useEmployeesStore((state) => state.setCurrentPage);
  const limit = useEmployeesStore((state) => state.filterSelections.limit);
  const setLimit = useEmployeesStore((state) => state.setLimit);

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
                  {employees.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>
                {paginationProps && (
                  <div className="flex max-sm:flex-col max-sm:gap-4 justify-between items-center mt-6 mb-4">
                    <div className="text-lg text-gray-900">
                      عرض{' '}
                      <span className="font-bold">
                        {`${Math.min(
                          paginationProps.currentPage * limit,
                          employees.length
                        )}`}
                      </span>{' '}
                      من أصل{' '}
                      <span className="font-bold">{employees.length}</span> موظف
                    </div>
                    <Pagination
                      currentPage={paginationProps.currentPage}
                      totalPages={paginationProps.totalPages}
                      hasNextPage={paginationProps.hasNextPage}
                      hasPreviousPage={paginationProps.hasPreviousPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
                <LimitSelector limit={limit} onLimitChange={setLimit} />
              </Else>
            </If>
          </div>
        </Else>
      </If>
    </div>
  );
}
