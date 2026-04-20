'use client';

import React from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { usePageNamesQuery, useUtmSourcesQuery } from '@/services/lookups';
import { OrderProps } from './types';

function Order({
  utmSource,
  pageName,
  onUtmSourceChange,
  onPageNameChange,
  errors,
}: OrderProps) {
  const { data: utmSources = [], isLoading } = useUtmSourcesQuery();
  const { data: pageNames = [], isLoading: isLoadingPageNames } = usePageNamesQuery();

  return (
    <div className="bg-gray-50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="w-full bg-white border border-gray-200 rounded-xl max-sm:p-5 p-8 shadow-sm">
        <h1 className="font-bold text-[22px] mb-6">مصدر الطلب</h1>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-8 max-sm:gap-6 mb-8">
          <div className="max-w-[502px]" data-field-error="utmSource">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                المنصة <span className="text-red-500">*</span>
              </label>
            </div>
            <SearchableSelect
              name="utmSource"
              placeholder="اختر المنصة"
              value={utmSource}
              onChange={onUtmSourceChange}
              options={utmSources}
              loading={isLoading}
              error={errors?.utmSource}
              emptyMessage="لا توجد مصادر متاحة"
            />
          </div>
          <div className="max-w-[502px]" data-field-error="pageName">
            <div className="mb-1">
              <label className="block font-medium text-[16px]">
                اسم الصفحة <span className="text-red-500">*</span>
              </label>
            </div>
            <SearchableSelect
              name="pageName"
              placeholder="اختر اسم الصفحة"
              value={pageName}
              onChange={onPageNameChange}
              options={pageNames}
              loading={isLoadingPageNames}
              error={errors?.pageName}
              emptyMessage="لا توجد صفحات متاحة"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order;
