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
import { morningShiftData } from '../../constants/SuccessCallesTimeChartConst';
import useBreakpoint from '../../hooks/useBreakpoint';

export default function SuccessCallesTimeChartMorning() {
  const breakpoint = useBreakpoint();

  // Responsive margins based on screen size
  const margin =
    breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl'
      ? { top: 10, right: 40, left: -20, bottom: 0 } // large screens
      : { top: 10, right: 0, left: -20, bottom: 0 }; // small/medium screens

  return (
    <section className="p-6 pb-1">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="font-bold text-lg text-right text-gray-900">
          مواعيد المكالمات الناجحة
        </h2>
        <p className="text-gray-600 text-sm font-medium">
          شيفت صباحي (8 إلي 12)
        </p>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={morningShiftData}
            margin={margin}
            className="sm:pr-10"
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="5"
              vertical={true}
              horizontal={true}
            />

            {/* Gradient */}
            <defs>
              <linearGradient id="colorليان" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#33147B" />
                <stop offset="100%" stopColor="#5D24E1" />
              </linearGradient>
            </defs>

            {/* Axes */}
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

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px',
                direction: 'rtl',
              }}
            />

            {/* Data Areas */}
            <Area
              dataKey="بوستينا"
              type="monotone"
              stroke="#5D24E1"
              strokeWidth={2}
              fill="#C3A9FF"
              fillOpacity={1}
              name="بوستينا"
            />
            <Area
              dataKey="سارة"
              type="monotone"
              stroke="#5D24E1"
              strokeWidth={2}
              fill="#A078FC"
              fillOpacity={1}
              name="سارة"
            />
            <Area
              dataKey="ليان"
              type="monotone"
              stroke="#CBB5FD"
              strokeWidth={2}
              fill="url(#colorليان)"
              fillOpacity={1}
              name="ليان"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
