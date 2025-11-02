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
import useBreakpoint from '../../hooks/useBreakpoint'; // 👈 import the hook
import { datasets, rangeOptions } from '../../constants/TotalOrdarConst';
import { DataPoint, RangeType } from '../../types';

export default function GradientAreaChart() {
  const [range, setRange] = useState<RangeType>('month');
  const breakpoint = useBreakpoint(); // 👈 detect breakpoint

  // Responsive margins based on screen size
  const margin =
    breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'
      ? { top: 20, right: 30, left: -30, bottom: 10 } // large screens
      : { top: 20, right: 0, left: -30, bottom: 10 }; // small/medium screens

  const data: DataPoint[] = [...datasets[range]];

  const handleRangeChange = (value: string) => setRange(value as RangeType);

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
          <AreaChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="5" vertical horizontal />

            {/* Gradients */}
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
              name="المجموعة 1"
              activeDot={<CustomActiveDot />}
            />
            <Area
              dataKey="value2"
              stroke="#8055e4"
              strokeWidth={2}
              fill="url(#colorValue2)"
              name="المجموعة 2"
              activeDot={<CustomActiveDot />}
            />
            <Area
              dataKey="value3"
              stroke="#B08FFB"
              strokeWidth={2}
              fill="url(#colorValue3)"
              name="المجموعة 3"
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
