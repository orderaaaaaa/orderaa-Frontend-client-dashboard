'use client';

import React from 'react';
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
import { compareEmployeeChartData } from '../../constants/CompareEmployeeChartConst';

export default function CompareEmployee() {

  return (
    <div className="w-full max-md:ml-37 h-full max-w-4xl  p-6 ">
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer
          width="100%"
          maxHeight={500}
          minWidth={370}
          minHeight={350}
        >
          <AreaChart
            data={compareEmployeeChartData}
            margin={{ top: 10, right: 30, left: -30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="5" />
            <defs>
              <linearGradient id="colorليان" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#33147B" />
                <stop offset="100%" stopColor="#5D24E1" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              padding={{ left: 50, right: 50 }} // Add padding to start and end
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 12, dx: -20 }}
            />
            <Tooltip />

            <Area
              dataKey="بوستينا"
              stroke="#5D24E1"
              strokeWidth={1}
              fill="#C3A9FF"
              fillOpacity={1}
              name="بوستينا"
            />
            <Area
              dataKey="سارة"
              stroke="#5D24E1"
              strokeWidth={1}
              fill="#A078FC"
              fillOpacity={1}
              name="سارة"
            />
            <Area
              dataKey="ليان"
              stroke="#CBB5FD"
              strokeWidth={1}
              fill="url(#colorليان)"
              fillOpacity={1}
              name="ليان"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
