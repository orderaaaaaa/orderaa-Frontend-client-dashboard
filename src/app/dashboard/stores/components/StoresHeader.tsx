'use client';

import React from 'react';
import { DatePicker } from '@/components/ui/datepicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';

interface StoresProps {
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: string;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  onTimePeriodChange: (period: string) => void;
}

export default function StoresHeader({
  fromDate,
  toDate,
  timePeriod,
  onFromDateChange,
  onToDateChange,
  onTimePeriodChange,
}: StoresProps) {
  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 px-3 w-full sm:w-auto">
        <DatePicker
          selected={fromDate}
          onChange={onFromDateChange}
          placeholder="من تاريخ"
          showIcon={true}
          className="w-[120px] sm:w-[140px]"
          maxDate={toDate || undefined}
        />

        <ArrowLeft className="text-primary flex-shrink-0" size="20" />

        <DatePicker
          selected={toDate}
          onChange={onToDateChange}
          placeholder="إلى تاريخ"
          showIcon={true}
          className="w-[120px] sm:w-[140px]"
          minDate={fromDate || undefined}
        />

        <div className="relative w-32 sm:w-[180px] flex-shrink-0">
          <Select value={timePeriod} onValueChange={onTimePeriodChange}>
            <SelectTrigger
              className={`w-full border-[#CED4DA] rounded-lg h-10 text-[16px] ${
                timePeriod ? 'text-primary font-bold' : ''
              }`}
            >
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent className="[&_[data-state=checked]]:text-primary">
              <SelectItem value="day">يوم</SelectItem>
              <SelectItem value="week">اسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنه</SelectItem>
            </SelectContent>
          </Select>
          {timePeriod && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTimePeriodChange('');
              }}
              className="absolute left-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
              type="button"
            >
              <X size={16} className="text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl mb-4 mt-5 font-semibold">
        قائمة المتاجر
      </h1>
      <p className="font-medium text-xl md:text-2xl">
        تقارير شاملة عن الإيرادات والأداء والنمو
      </p>
    </header>
  );
}
