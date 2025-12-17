// components/employees/EmployeeSearchFilter.tsx
'use client';

import React, { useState } from 'react';
import { Search, SlidersVertical } from 'lucide-react';

interface EmployeeSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAccessLevel: string;
  onAccessLevelChange: (level: string) => void;
  placeholder?: string;
  className?: string;
}

const ACCESS_LEVEL_OPTIONS = [
  { value: 'ALL', label: 'جميع المستويات' },
  { value: 'SUPER_ADMIN', label: 'سوبر أدمن' },
  { value: 'ADMIN', label: 'أدمن' },
  { value: 'MANAGER', label: 'مدير' },
  { value: 'EMPLOYEE', label: 'موظف' },
];

export function EmployeeSearchFilter({
  searchQuery,
  onSearchChange,
  selectedAccessLevel,
  onAccessLevelChange,
  placeholder = 'ابحث عن موظف',
  className = '',
}: EmployeeSearchFilterProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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
          className="flex-shrink-0 hover:bg-gray-100 rounded-full p-1 cursor-pointer transition-colors"
        >
          <SlidersVertical size={20} className="text-gray-600" />
        </button>

        {/* DropDown list  */}
        {showFilterDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowFilterDropdown(false)}
            />

            <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-w-[200px]">
              {ACCESS_LEVEL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onAccessLevelChange(option.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-right px-4 py-3 text-sm hover:bg-[#5d24e1] hover:text-white transition-colors first:rounded-t-lg cursor-pointer last:rounded-b-lg ${
                    selectedAccessLevel === option.value
                      ? 'bg-[#5d24e1] text-white font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
