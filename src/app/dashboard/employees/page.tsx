// page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/schemas/employee.schema';
import EmployeeHeader from './components/EmployeeHeader';
import { StatCard } from './components/StatCard';
import { STAT_CARDS } from '@/constants/employees/statCard';
import { EmployeeSearchFilter } from './components/EmployeeSearchFilter';
import { Else, If, Then } from 'react-if';
import { EmployeeCard } from './components/EmployeeCard';

export default function AllEmployees() {
  const { data: employees, isLoading, isError } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('ALL');

  // فلترة البيانات حسب البحث ومستوى الوصول
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    return employees.filter((emp: Employee) => {
      const matchesSearch =
        emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phoneNumber?.includes(searchQuery);

      const matchesAccessLevel =
        selectedAccessLevel === 'ALL' ||
        emp.accessLevel === selectedAccessLevel;

      return matchesSearch && matchesAccessLevel;
    });
  }, [employees, searchQuery, selectedAccessLevel]);

  const getCountByAccessLevel = (accessLevel: string) => {
    if (accessLevel === 'TOTAL') {
      return employees?.length || 0;
    }
    return (
      employees?.filter((emp: Employee) => emp.accessLevel === accessLevel)
        .length || 0
    );
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
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
      />

      <If condition={isLoading}>
        <Then>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </Then>
        <Else>
          <div className="mt-10">
            <If condition={filteredEmployees.length === 0}>
              <Then>
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">لم يتم العثور على موظفين.</p>
                </div>
              </Then>
              <Else>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredEmployees?.map((employee: Employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      performance={10}
                      vacationDays={0}
                      workDays={0}
                    />
                  ))}
                </div>
              </Else>
            </If>
          </div>
        </Else>
      </If>
    </div>
  );
}
