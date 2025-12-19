'use client';

import React, { useState } from 'react';
import { Search, SlidersVertical, X } from 'lucide-react';
import { EmployeeSearchFilterProps } from '../types/filter.types';

const ACCESS_LEVEL_OPTIONS = [
  { value: 'ALL', label: 'جميع المستويات' },
  { value: 'SUPER_ADMIN', label: 'سوبر أدمن' },
  { value: 'ADMIN', label: 'أدمن' },
  { value: 'MANAGER', label: 'مدير' },
  { value: 'EMPLOYEE', label: 'موظف' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'ALL', label: 'جميع الأقسام' },
  { value: 'CALL_CENTER', label: 'خدمة العملاء' },
  { value: 'PACKAGING', label: 'التغليف' },
  { value: 'SHIPPING', label: 'الشحن' },
];

const PERFORMANCE_OPTIONS = [
  { value: 'ALL', label: 'جميع المستويات' },
  { value: 'HIGH', label: 'أداء عالي' },
  { value: 'LOW', label: 'أداء منخفض' },
];

export function EmployeeSearchFilter({
  searchQuery,
  onSearchChange,
  selectedAccessLevel,
  onAccessLevelChange,
  selectedDepartment,
  onDepartmentChange,
  selectedPerformance,
  onPerformanceChange,
  placeholder = 'ابحث عن موظف بالاسم، الهاتف، أو البريد الإلكتروني',
  className = '',
}: EmployeeSearchFilterProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const hasActiveFilters =
    selectedAccessLevel !== 'ALL' ||
    selectedDepartment !== 'ALL' ||
    selectedPerformance !== 'ALL';

  const clearAllFilters = () => {
    onAccessLevelChange('ALL');
    onDepartmentChange('ALL');
    onPerformanceChange('ALL');
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
            className="flex-1 border-none bg-transparent focus:outline-none  focus:ring-0 text-gray-700 text-lg font-semibold placeholder:text-gray-400 text-right"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className={`flex-shrink-0 hover:bg-gray-100 rounded-full p-1 cursor-pointer transition-colors ${
            hasActiveFilters ? 'text-[#5d24e1]' : 'text-gray-600'
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

            <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-[280px] max-h-[500px] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">الفلاتر</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-[#5d24e1] hover:text-[#4a1db8] flex items-center gap-1"
                  >
                    <X size={16} />
                    مسح الكل
                  </button>
                )}
              </div>

              {/* Access Level Filter */}
              <div className="p-4 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الصلاحية
                </label>
                <div className="space-y-1">
                  {ACCESS_LEVEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onAccessLevelChange(option.value);
                      }}
                      className={`w-full text-right px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedAccessLevel === option.value
                          ? 'bg-[#5d24e1] text-white font-medium'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القسم
                </label>
                <div className="space-y-1">
                  {DEPARTMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onDepartmentChange(option.value);
                      }}
                      className={`w-full text-right px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedDepartment === option.value
                          ? 'bg-[#5d24e1] text-white font-medium'
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الأداء
                </label>
                <div className="space-y-1">
                  {PERFORMANCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onPerformanceChange(option.value);
                      }}
                      className={`w-full text-right px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedPerformance === option.value
                          ? 'bg-[#5d24e1] text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
