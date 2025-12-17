// page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFilteredEmployees } from '@/hooks/useEmployees';
import { Employee, EmployeeFilters } from '@/schemas/employee.schema';
import EmployeeHeader from './components/EmployeeHeader';
import { StatCard } from './components/StatCard';
import { STAT_CARDS } from '@/constants/employees/statCard';
import { EmployeeSearchFilter } from './components/EmployeeSearchFilter';
import { Else, If, Then } from 'react-if';
import { EmployeeCard } from './components/EmployeeCard';
import { Pagination } from './components/Pagination';

export default function AllEmployees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Build filters object
  const filters: EmployeeFilters = useMemo(() => {
    const filterObj: EmployeeFilters = {
      page: currentPage,
      limit: limit,
    };

    // Add search query to appropriate field (name, phoneNumber, or email)
    if (searchQuery.trim()) {
      // Try to detect if it's a phone number (only digits)
      if (/^\d+$/.test(searchQuery.trim())) {
        filterObj.phoneNumber = searchQuery.trim();
      } else if (searchQuery.includes('@')) {
        // Email contains @
        filterObj.email = searchQuery.trim();
      } else {
        // Default to name search
        filterObj.name = searchQuery.trim();
      }
    }

    if (selectedAccessLevel !== 'ALL') {
      filterObj.accessLevel = selectedAccessLevel;
    }

    if (selectedDepartment !== 'ALL') {
      filterObj.department = selectedDepartment;
    }

    if (selectedPerformance !== 'ALL') {
      filterObj.performance = selectedPerformance as 'LOW' | 'HIGH';
    }

    return filterObj;
  }, [searchQuery, selectedAccessLevel, selectedDepartment, selectedPerformance, currentPage, limit]);

  const { data: paginatedResponse, isLoading, isError } = useFilteredEmployees(filters);

  const employees = paginatedResponse?.data || [];
  const totalItems = paginatedResponse?.totalItems || 0;

  // Reset to page 1 when filters change (except page changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAccessLevel, selectedDepartment, selectedPerformance]);

  const getCountByAccessLevel = (accessLevel: string) => {
    // This would need to be updated to use the API if needed
    // For now, we'll return the totalItems as a fallback
    if (accessLevel === 'TOTAL') {
      return totalItems;
    }
    // We could fetch counts per access level if needed
    return 0;
  };

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

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            count={getCountByAccessLevel(card.accessLevel)}
            borderColor={card.borderColor}
            iconBgColor={card.iconBgColor}
            iconPath={card.iconPath}
            alt={card.alt}
          />
        ))}
      </div>

      <EmployeeSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAccessLevel={selectedAccessLevel}
        onAccessLevelChange={setSelectedAccessLevel}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedPerformance={selectedPerformance}
        onPerformanceChange={setSelectedPerformance}
      />

      <If condition={isLoading}>
        <Then>
          <div className="flex justify-center items-center h-64">
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
                  {employees?.map((employee: Employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                    />
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
