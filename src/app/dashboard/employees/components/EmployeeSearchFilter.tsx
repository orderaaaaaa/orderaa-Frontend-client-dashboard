'use client';

import React, { useState, useEffect } from 'react';
import { Search, SlidersVertical, X } from 'lucide-react';
import {
  ACCESS_LEVEL_OPTIONS,
  DEPARTMENT_OPTIONS,
  PERFORMANCE_OPTIONS,
  FILTER_ALL,
} from '../constants/employeesFilterOptions';
import { useDebounce } from '@/utils/debounce';
import { useEmployeesStore } from '@/app/dashboard/employees/store/employeesStore';

interface EmployeeSearchFilterProps {
  placeholder?: string;
  className?: string;
}

export function EmployeeSearchFilter({
  placeholder = 'ابحث عن موظف بالاسم، الهاتف، أو البريد الإلكتروني',
  className = '',
}: EmployeeSearchFilterProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const selectedAccessLevel = useEmployeesStore(
    (state) => state.filterSelections.accessLevel
  );
  const selectedDepartment = useEmployeesStore(
    (state) => state.filterSelections.department
  );
  const selectedPerformance = useEmployeesStore(
    (state) => state.filterSelections.performance
  );

  const setDebouncedSearchQuery = useEmployeesStore(
    (state) => state.setDebouncedSearchQuery
  );
  const setAccessLevel = useEmployeesStore((state) => state.setAccessLevel);
  const setDepartment = useEmployeesStore((state) => state.setDepartment);
  const setPerformance = useEmployeesStore((state) => state.setPerformance);

  const debouncedSearchQuery = useDebounce(searchInput, 500);

  useEffect(() => {
    setDebouncedSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setDebouncedSearchQuery]);

  const hasActiveFilters =
    selectedAccessLevel !== FILTER_ALL ||
    selectedDepartment !== FILTER_ALL ||
    selectedPerformance !== FILTER_ALL;

  const clearAllFilters = useEmployeesStore((state) => state.clearFilters);

  const handleClearAllFilters = () => {
    clearAllFilters();
    setSearchInput('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex relative items-center mt-12 md:w-1/2 bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2">
        {/* أيقونة البحث على اليسار */}
        <div className="flex-shrink-0 pl-3">
          <Search className="text-gray-400" size={20} />
        </div>

        {/* حقل البحث في الوسط */}
        <div className="flex-1 flex items-center px-4">
          <input
            type="text"
            placeholder={placeholder}
            className="flex-1 border-none bg-transparent focus:outline-none  focus:ring-0 text-gray-700 text-[12px] sm:text-lg font-semibold placeholder:text-gray-400 text-right"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className={`flex-shrink-0 hover:bg-gray-100 rounded-full p-1 cursor-pointer transition-colors ${
            hasActiveFilters ? 'text-primary' : 'text-gray-600'
          }`}
        >
          <SlidersVertical size={20} />
        </button>

        {/* Filter Dropdown */}
        {showFilterDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowFilterDropdown(false)}
            />

            <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[500px] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3  items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">الفلاتر</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-sm bg-primary hover:bg-[#6b33ee] p-2 rounded-lg font-semibold text-white cursor-pointer flex items-center gap-1"
                  >
                    <X size={16} />
                    مسح الكل
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3">
                {/* Access Level Filter */}
                <div className="p-4 border-b border-gray-100">
                  <label className="block text-[12px] sm:text-sm max-sm:text-center font-bold text-gray-700 mb-2">
                    مستوى الصلاحية
                  </label>
                  <div className="space-y-1">
                    {ACCESS_LEVEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setAccessLevel(option.value);
                        }}
                        className={`w-full text-right px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedAccessLevel === option.value
                            ? 'bg-primary text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div className="p-4 border-b border-gray-100">
                  <label className="block text-xs max-sm:text-center font-bold text-gray-700 mb-2">
                    القسم
                  </label>
                  <div className="space-y-1">
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setDepartment(option.value);
                        }}
                        className={`w-full text-right px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedDepartment === option.value
                            ? 'bg-primary text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Performance Filter */}
                <div className="p-4">
                  <label className="block text-xs sm:text-sm max-sm:text-center font-bold text-gray-700 mb-2">
                    مستوى الأداء
                  </label>
                  <div className="space-y-1">
                    {PERFORMANCE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPerformance(option.value);
                        }}
                        className={`w-full text-right px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedPerformance === option.value
                            ? 'bg-primary text-white font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
