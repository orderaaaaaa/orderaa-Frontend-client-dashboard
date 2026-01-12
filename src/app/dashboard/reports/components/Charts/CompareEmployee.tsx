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
import { compareEmployeeChartData } from '../../constants/CompareEmployeeChartConst';

export default function CompareEmployee() {
  return (
    /* 1. Removed horizontal padding (p-0) so chart touches phone edges */
    <div className="w-full h-full p-0 sm:p-4">
      {/* 2. Set a tall enough height for mobile clarity */}
      <div className="w-full h-[380px] sm:h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={compareEmployeeChartData}
            /* 3. Tightened margins. Negative left margin removes the gap created by YAxis */
            margin={{
              top: 10,
              right: 5,
              left: -40,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="5 5" vertical={false} />

            <defs>
              <linearGradient id="colorليان" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#33147B" />
                <stop offset="100%" stopColor="#5D24E1" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              interval={0} // Forces all Arabic day labels to show
              axisLine={false}
              tickLine={false}
              dy={10} // Moves labels down slightly for breathing room
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 10, dx: -5 }} // Moves Y-axis ticks left for breathing room
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            {/* type="linear" restored for sharp edges as seen in image_5e2727.png */}
            <Area
              type="linear"
              dataKey="بوستينا"
              stroke="#5D24E1"
              strokeWidth={1}
              fill="#C3A9FF"
              fillOpacity={1}
              name="بوستينا"
            />

            <Area
              type="linear"
              dataKey="سارة"
              stroke="#5D24E1"
              strokeWidth={1}
              fill="#A078FC"
              fillOpacity={1}
              name="سارة"
            />

            <Area
              type="linear"
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
