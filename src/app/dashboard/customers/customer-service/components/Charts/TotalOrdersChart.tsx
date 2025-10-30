'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface DataPoint {
  label: string;
  value1: number;
  value2: number;
  value3: number;
}

type RangeType = 'day' | 'week' | 'month' | 'year';

export default function GradientAreaChart() {
  const [range, setRange] = useState<RangeType>('month');

  const datasets: Record<RangeType, DataPoint[]> = {
    day: [
      { label: 'Mon', value1: 260, value2: 180, value3: 90 },
      { label: 'Tue', value1: 240, value2: 160, value3: 80 },
      { label: 'Wed', value1: 280, value2: 200, value3: 100 },
      { label: 'Thu', value1: 270, value2: 190, value3: 70 },
      { label: 'Fri', value1: 300, value2: 210, value3: 120 },
      { label: 'Sat', value1: 250, value2: 170, value3: 100 },
      { label: 'Sun', value1: 260, value2: 180, value3: 90 },
    ],
    week: [
      { label: 'W1', value1: 280, value2: 190, value3: 90 },
      { label: 'W2', value1: 270, value2: 180, value3: 100 },
      { label: 'W3', value1: 290, value2: 200, value3: 110 },
      { label: 'W4', value1: 260, value2: 170, value3: 80 },
    ],
    month: [
      { label: 'Jan', value1: 270, value2: 180, value3: 70 },
      { label: 'Feb', value1: 250, value2: 170, value3: 80 },
      { label: 'Mar', value1: 280, value2: 200, value3: 90 },
      { label: 'Apr', value1: 300, value2: 220, value3: 100 },
      { label: 'May', value1: 260, value2: 190, value3: 80 },
      { label: 'Jun', value1: 240, value2: 160, value3: 70 },
      { label: 'Jul', value1: 230, value2: 150, value3: 60 },
      { label: 'Aug', value1: 220, value2: 140, value3: 50 },
      { label: 'Sep', value1: 200, value2: 130, value3: 40 },
      { label: 'Oct', value1: 180, value2: 120, value3: 30 },
      { label: 'Nov', value1: 160, value2: 100, value3: 20 },
      { label: 'Dec', value1: 140, value2: 90, value3: 10 },
    ],
    year: [
      { label: '2020', value1: 250, value2: 160, value3: 80 },
      { label: '2021', value1: 270, value2: 180, value3: 90 },
      { label: '2022', value1: 290, value2: 200, value3: 100 },
      { label: '2023', value1: 260, value2: 170, value3: 70 },
      { label: '2024', value1: 280, value2: 190, value3: 80 },
    ],
  };

  const data: DataPoint[] = [...datasets[range]]; // Make mutable copy

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">اجمالي الطلبات</h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeType)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-200"
        >
          <option value="day">Days</option>
          <option value="week">Weeks</option>
          <option value="month">Months</option>
          <option value="year">Years</option>
        </select>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: -30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="5" />
            <defs>
              <linearGradient id="colorValue3" x1="0" y1=".2" x2="0" y2="1">
                <stop offset="0%" stopColor="#5029AB" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#D4C1FF" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="colorValue2" x1="0" y1=".2" x2="0" y2="1">
                <stop offset="0%" stopColor="#744BD3" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#C3A9FF" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A078FC" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#B291FF" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[0, 300]}
              ticks={[0, 60, 120, 180, 240, 300]}
              tick={{ fontSize: 12, dx: -20 }}
            />
            <Tooltip />

            <Area
              dataKey="value1"
              stroke="#5029AB"
              strokeWidth={2}
              fill="url(#colorValue1)"
              fillOpacity={1}
              name="Dataset 1"
            />
            <Area
              dataKey="value2"
              stroke="#744BD3"
              strokeWidth={2}
              fill="url(#colorValue2)"
              fillOpacity={1}
              name="Dataset 2"
            />
            <Area
              dataKey="value3"
              stroke="#A078FC"
              strokeWidth={2}
              fill="url(#colorValue3)"
              fillOpacity={1}
              name="Dataset 3"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
