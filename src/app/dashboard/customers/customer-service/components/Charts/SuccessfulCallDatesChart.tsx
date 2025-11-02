'use client';
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { employeeData } from '../../constants/SuccessfulCallDatesChartConst';
import {
  CustomTooltipArabic,
  CustomActiveDot,
} from '@/components/ui/CustomChartDots';
import useBreakpoint from '../../hooks/useBreakpoint';

export default function SuccessfulCallDates() {
  const breakpoint = useBreakpoint();

  // Responsive margins based on screen size
  const margin =
    breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'
      ? { top: 10, right: 30, left: -30, bottom: 0 } // large screens
      : { top: 10, right: 0, left: -30, bottom: 0 }; // small/medium screens

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="font-bold text-lg text-right text-gray-900">
          مواعيد المكالمات الناجحة
        </h2>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={employeeData}
            margin={margin}
            className="sm:pr-10"
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="5"
              vertical={true}
              horizontal={true}
            />

            {/* Gradient (keep your original style) */}
            <defs>
              <linearGradient id="colorليان" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#33147B" />
                <stop offset="100%" stopColor="#5D24E1" />
              </linearGradient>
            </defs>

            {/* X & Y Axes */}
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              padding={{ left: 40, right: 40 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 12, dx: -20 }}
            />
            <Tooltip content={<CustomTooltipArabic />} />

            {/* Areas */}
            <Area
              dataKey="بوستينا"
              stroke="#5D24E1"
              strokeWidth={2}
              fill="#C3A9FF"
              fillOpacity={1}
              name="بوستينا"
              activeDot={<CustomActiveDot />}
            />
            <Area
              dataKey="سارة"
              stroke="#5D24E1"
              strokeWidth={2}
              fill="#A078FC"
              fillOpacity={1}
              name="سارة"
              activeDot={<CustomActiveDot />}
            />
            <Area
              dataKey="ليان"
              stroke="#CBB5FD"
              strokeWidth={2}
              fill="url(#colorليان)"
              fillOpacity={1}
              name="ليان"
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
