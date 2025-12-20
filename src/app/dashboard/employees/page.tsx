// page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFilteredEmployees } from '@/app/dashboard/employees/hooks/useEmployees';
import { Employee, EmployeeFilters } from '@/schemas/employee.schema';
import EmployeeHeader from './components/EmployeeHeader';
import { StatCard } from './components/StatCard';
import { STAT_CARDS } from '@/app/dashboard/employees/constants/statCard';
import { EmployeeSearchFilter } from './components/EmployeeSearchFilter';
import { Else, If, Then } from 'react-if';
import { EmployeeCard } from './components/EmployeeCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination as CustomPagination } from './components/Pagination';
import { Pagination as SwiperPagination } from 'swiper/modules';
import { FILTER_ALL } from './constants/employeesFilterOptions';
import 'swiper/css';
import 'swiper/css/pagination';

const limit = 10;

type FilterSelections = {
  accessLevel: string;
  department: string;
  performance: string;
};

export default function AllEmployees() {
  const [searchQuery, setSearchQuery] = useState('');
  //TODO:search logic rerender problem from parent to child component

  const [filterSelections, setFilterSelections] = useState<FilterSelections>({
    accessLevel: FILTER_ALL,
    department: FILTER_ALL,
    performance: FILTER_ALL,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Wrapper functions to maintain API compatibility with child component
  const setSelectedAccessLevel = (level: string) => {
    setFilterSelections((prev) => ({ ...prev, accessLevel: level }));
  };

  const setSelectedDepartment = (department: string) => {
    setFilterSelections((prev) => ({ ...prev, department }));
  };

  const setSelectedPerformance = (performance: string) => {
    setFilterSelections((prev) => ({ ...prev, performance }));
  };

  // Build filters object
  const filters: EmployeeFilters = useMemo(() => {
    const query = searchQuery.trim();

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

    if (/^\d+$/.test(query)) {
      filterObj.phoneNumber = query;
    } else if (query.includes('@')) {
      filterObj.email = query;
    } else {
      filterObj.name = query;
    }

    return filterObj;
  }, [searchQuery, filterSelections, currentPage]);

  const {
    data: paginatedResponse,
    isLoading,
    isError,
  } = useFilteredEmployees(filters);

  const employees = paginatedResponse?.data || [];
  const totalItems = paginatedResponse?.totalItems || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSelections]);

  const getCountByAccessLevel = (accessLevel: string) => {
    if (accessLevel === 'TOTAL') {
      return totalItems;
    }
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
      <div className="block sm:hidden mt-6">
        <Swiper
          modules={[SwiperPagination]}
          spaceBetween={16}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="stat-cards-swiper"
        >
          {STAT_CARDS.map((card) => (
            <SwiperSlide key={card.title}>
              <StatCard
                title={card.title}
                count={getCountByAccessLevel(card.accessLevel)}
                borderColor={card.borderColor}
                iconBgColor={card.iconBgColor}
                iconPath={card.iconPath}
                alt={card.alt}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
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
        selectedAccessLevel={filterSelections.accessLevel}
        onAccessLevelChange={setSelectedAccessLevel}
        selectedDepartment={filterSelections.department}
        onDepartmentChange={setSelectedDepartment}
        selectedPerformance={filterSelections.performance}
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
            <If condition={employees.length < 0}>
              {' '}
              <Then>
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">لم يتم العثور على موظفين.</p>
                </div>
              </Then>
              <Else>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {employees?.map((employee: Employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>

                {paginatedResponse && (
                  <CustomPagination
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
