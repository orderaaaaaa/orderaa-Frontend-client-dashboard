'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Dropdown from '@/components/ui/Drobdown';

import {
  CustomActiveDot,
  CustomTooltipArabic,
} from '@/components/ui/CustomChartDots';

interface DataPoint {
  label: string;
  value1: number;
  value2: number;
  value3: number;
}

type RangeType = 'day' | 'week' | 'month' | 'year';

// Custom Tooltip Component

export default function GradientAreaChart() {
  const [range, setRange] = useState<RangeType>('month');

  const rangeOptions = [
    { key: 'day', value: 'يوم' },
    { key: 'week', value: 'أسبوع' },
    { key: 'month', value: 'الشهور' },
    { key: 'year', value: 'سنة' },
  ];

  const datasets: Record<RangeType, DataPoint[]> = {
    day: [
      { label: 'الإثنين', value1: 260, value2: 180, value3: 90 },
      { label: 'الثلاثاء', value1: 240, value2: 160, value3: 80 },
      { label: 'الأربعاء', value1: 280, value2: 200, value3: 100 },
      { label: 'الخميس', value1: 270, value2: 190, value3: 70 },
      { label: 'الجمعة', value1: 300, value2: 210, value3: 120 },
      { label: 'السبت', value1: 250, value2: 170, value3: 100 },
      { label: 'الأحد', value1: 260, value2: 180, value3: 90 },
    ],
    week: [
      { label: 'الأسبوع 1', value1: 280, value2: 190, value3: 90 },
      { label: 'الأسبوع 2', value1: 270, value2: 180, value3: 100 },
      { label: 'الأسبوع 3', value1: 290, value2: 200, value3: 110 },
      { label: 'الأسبوع 4', value1: 260, value2: 170, value3: 80 },
    ],
    month: [
      { label: 'يناير', value1: 130, value2: 60, value3: 30 },
      { label: 'فبراير', value1: 250, value2: 170, value3: 30 },
      { label: 'مارس', value1: 280, value2: 200, value3: 30 },
      { label: 'أبريل', value1: 300, value2: 220, value3: 150 },
      { label: 'مايو', value1: 260, value2: 190, value3: 80 },
      { label: 'يونيو', value1: 240, value2: 160, value3: 70 },
      { label: 'يوليو', value1: 230, value2: 150, value3: 60 },
      { label: 'أغسطس', value1: 220, value2: 140, value3: 50 },
      { label: 'سبتمبر', value1: 200, value2: 130, value3: 40 },
      { label: 'أكتوبر', value1: 180, value2: 120, value3: 30 },
      { label: 'نوفمبر', value1: 160, value2: 100, value3: 20 },
      { label: 'ديسمبر', value1: 140, value2: 90, value3: 10 },
    ],
    year: [
      { label: '2020', value1: 250, value2: 160, value3: 80 },
      { label: '2021', value1: 270, value2: 180, value3: 90 },
      { label: '2022', value1: 290, value2: 200, value3: 100 },
      { label: '2023', value1: 260, value2: 170, value3: 70 },
      { label: '2024', value1: 280, value2: 190, value3: 80 },
    ],
  };

  const data: DataPoint[] = [...datasets[range]];

  const handleRangeChange = (value: string) => {
    setRange(value as RangeType);
  };

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-semibold">اجمالي الطلبات</h3>
        <div className="w-40">
          <Dropdown
            value={range}
            onChange={handleRangeChange}
            options={rangeOptions}
            placeholder="اختر الفترة"
            className="w-full"
            selectClassName="w-full border border-gray-300 rounded-lg py-2 px-10 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
          />
        </div>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: -30, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="5"
              vertical={true}
              horizontal={true}
            />
            <defs>
              <linearGradient id="colorValue3" x1="0" y1=".2" x2="0" y2="1">
                <stop offset="0%" stopColor="#5d24e1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#D4C1FF" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="colorValue2" x1="0" y1="0.2" x2="0" y2="0.6">
                <stop offset="0%" stopColor="#8055e4" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#C3A9FF" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B08FFB" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#B291Fe" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              padding={{ left: 40, right: 40 }}
            />
            <YAxis
              domain={[0, 300]}
              ticks={[0, 60, 120, 180, 240, 300]}
              tick={{ fontSize: 12, dx: -20 }}
            />
            <Tooltip content={<CustomTooltipArabic />} />

            <Area
              dataKey="value1"
              stroke="#5d24e1"
              strokeWidth={2}
              fill="url(#colorValue1)"
              fillOpacity={1}
              name="المجموعة 1"
              activeDot={<CustomActiveDot />}
            />
            <Area
              dataKey="value2"
              stroke="#8055e4"
              strokeWidth={2}
              fill="url(#colorValue2)"
              fillOpacity={1}
              name="المجموعة 2"
              activeDot={<CustomActiveDot />}
            />
            <Area
              dataKey="value3"
              stroke="#B08FFB"
              strokeWidth={2}
              fill="url(#colorValue3)"
              fillOpacity={1}
              name="المجموعة 3"
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
