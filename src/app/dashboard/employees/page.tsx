// page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/schemas/employee.schema';
import EmployeeHeader from './components/EmployeeHeader';
import { StatCard } from './components/StatCard';
import { STAT_CARDS } from '@/constants/employees/statCard';
import { EmployeeSearchFilter } from './components/EmployeeSearchFilter'; // المسار المعدل

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      {/* قائمة الموظفين بعد التصفية */}
      <div className="mt-10">
        {filteredEmployees?.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">لم يتم العثور على موظفين.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredEmployees?.map((employee: Employee) => (
                <li key={employee.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee.fullName}
                      </p>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <p className="text-sm text-gray-400">
                        {employee.phoneNumber}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {employee.accessLevel}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
