'use client';

import React from 'react';
import { employeePerformanceData } from '../constants/EmployeePerformanceConst';

export default function EmployeePerformance() {
  const maxValue = 100;
  const chartHeight = 350;
  const barWidth = 160;
  const spacing = 30;
  const bottomY = chartHeight + 30;
  const chartWidth = (barWidth + spacing) * employeePerformanceData.length + 60;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl mt-10 items-stretch">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3 mb-2 flex justify-between">
        <h2 className="font-bold text-lg text-gray-900 text-right">
          أداء الموظفين
        </h2>
      </div>

      {/* Chart */}
      <div className="flex justify-center">
        <svg
          viewBox={`-50 0 ${chartWidth + 50} ${chartHeight + 100}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-[100%] sm:w-[90%] md:w-[80%] h-auto"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#33147B" />
              <stop offset="100%" stopColor="#5D24E1" />
            </linearGradient>
          </defs>

          {/* Y-axis grid and labels */}
          {[0, 20, 40, 60, 80, 100].map((val, i) => {
            const y = bottomY - (val / maxValue) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1="0"
                  x2={
                    (barWidth + spacing) * employeePerformanceData.length + 20
                  }
                  y1={y}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="2"
                />
                <text
                  x="-20"
                  y={y + 5}
                  textAnchor="end"
                  className="fill-gray-600 text-[10px] sm:text-xs md:text-sm"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {employeePerformanceData.map((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const x = i * (barWidth + spacing) + 40;
            const y = bottomY - barHeight;

            return (
              <g key={i} transform={`translate(${x}, 0)`} opacity={0.9}>
                {/* Background cylinder */}
                <ellipse
                  cx={barWidth / 2}
                  cy={bottomY}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#33147B"
                />
                <rect
                  x="0"
                  y={bottomY - chartHeight}
                  width={barWidth}
                  height={chartHeight}
                  fill="#F3EDFF"
                />
                <ellipse
                  cx={barWidth / 2}
                  cy={bottomY - chartHeight}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#EDE4FF"
                />

                {/* Filled portion with gradient */}
                <rect
                  x="0"
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                />
                <ellipse
                  cx={barWidth / 2}
                  cy={y}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#5D24E1"
                />

                {/* Label */}
                <text
                  x={barWidth / 2}
                  y={bottomY + 35}
                  textAnchor="middle"
                  className="fill-gray-800 font-semibold text-[10px] sm:text-[12px] md:text-[14px]"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
