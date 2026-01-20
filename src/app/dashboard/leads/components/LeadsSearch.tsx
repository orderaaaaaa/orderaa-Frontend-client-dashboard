'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, SlidersVertical, X as XIcon } from 'lucide-react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  LEAD_TYPE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  PAY_STATUS_OPTIONS,
} from '../constants/leadsDummyData';
import debounce from 'lodash/debounce';
import { StatusSelect } from './ui/StatusSelect';

interface LeadsSearchProps {
  onSearchChange: (search: string) => void;
  onLeadTypeChange: (type: string) => void;
  onLeadSourceChange: (source: string) => void;
  onPayStatusChange: (source: string) => void;
}

export default function LeadsSearch({
  onSearchChange,
  onLeadTypeChange,
  onLeadSourceChange,
  onPayStatusChange,
}: LeadsSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [leadType, setLeadType] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [payStatus, setPayStatus] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        onSearchChange(searchTerm);
      }, 500),
    [onSearchChange],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleLeadTypeChange = useCallback(
    (value: string) => {
      setLeadType(value);
      onLeadTypeChange(value);
    },
    [onLeadTypeChange],
  );

  const handleLeadSourceChange = useCallback(
    (value: string) => {
      setLeadSource(value);
      onLeadSourceChange(value);
    },
    [onLeadSourceChange],
  );
  const handlePayStatusChange = useCallback(
    (value: string) => {
      setPayStatus(value);
      onPayStatusChange(value);
    },
    [onPayStatusChange],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="bg-white  mx-auto rounded-lg shadow-md mb-6 mt-10">
      <div className="p-4 md:p-6">
        {/* Main Search Row */}
        <div className="flex flex-col-reverse md:flex-row-reverse items-stretch md:items-center gap-4">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-6 md:px-12 py-2.5 rounded-lg transition-all cursor-pointer border ${
              isFilterOpen
                ? 'bg-primary text-white shadow-md border-primary'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <SlidersVertical className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">فلاتر متقدمة</span>
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              placeholder="البحث بالاسم، رقم الواتساب، البريد الالكتروني"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right placeholder-gray-500"
              dir="rtl"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  debouncedSearch.cancel();
                  onSearchChange('');
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {isFilterOpen && (
        <div className="px-4 md:px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-1/2">
            {/* Lead Type */}
            <div className="space-y-1">
              <SearchableSelect
                value={leadSource}
                onChange={handleLeadSourceChange}
                options={LEAD_SOURCE_OPTIONS}
                placeholder="جميع المصادر"
                widthClass="w-full"
                clearable
                triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 px-3 !text-sm font-semibold bg-white text-right"
              />
            </div>

            {/* Lead Source */}
            <div className="space-y-1">
              <StatusSelect
                value={leadType}
                onChange={handleLeadTypeChange}
                placeholder="نوع الشارة"
                triggerClassName="w-full border border-gray-300 !rounded-lg !py-2 h-full px-3 !text-sm font-semibold bg-white text-right"
              />
            </div>
            <SearchableSelect
              value={payStatus}
              onChange={handlePayStatusChange}
              options={PAY_STATUS_OPTIONS}
              placeholder="حالة الدفع"
              widthClass="w-full"
              clearable
              triggerClassName="w-full border border-gray-300 rounded-lg py-2.5 px-3 !text-sm font-semibold bg-white text-right"
            />
          </div>
        </div>
      )}
    </div>
  );
}
