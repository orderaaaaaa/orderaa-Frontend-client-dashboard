'use client';

import React from 'react';
import { callDistributionData } from '../../constants/DistributingCallsToConfirmOrdersConst';

export default function DistributingCallsToConfirmOrders() {
  const maxValue = 60; // 60% max
  const chartHeight = 260;
  const barWidth = 60;
  const spacing = 30;
  const bottomY = chartHeight + 20;
  const chartWidth = (barWidth + spacing) * callDistributionData.length + 60;

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-8 mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3 mb-2 flex justify-between">
        <h2 className="font-bold text-lg text-gray-900 text-right">
          توزيع المكالمات لتأكيد الطلبات
        </h2>
      </div>

      <p className="text-center text-gray-500 mb-6">
        نسبة الطلبات المؤكدة بعد عدد معين من المكالمات
      </p>

      {/* Chart container */}
      <div className="relative flex justify-center">
        <svg
          // Add left padding to make Y-axis labels visible
          viewBox={`-50 0 ${chartWidth + 50} ${chartHeight + 100}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-[100%] sm:w-[90%] md:w-[80%] h-auto mx-auto"
        >
          {/* Y-axis grid lines and labels */}
          {[0, 15, 30, 45, 60].map((val, i) => {
            const y = bottomY - (val / maxValue) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1="0"
                  x2={(barWidth + spacing) * callDistributionData.length + 20}
                  y1={y}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="4"
                />
                <text
                  x="-20"
                  y={y + 5}
                  textAnchor="end"
                  className="fill-gray-600 text-[10px] sm:text-xs md:text-sm"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {callDistributionData.map((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const x = i * (barWidth + spacing) + 40;
            const y = bottomY - barHeight;

            return (
              <g key={i} transform={`translate(${x}, 0)`}>
                {/* Background cylinder */}
                <ellipse
                  cx={barWidth / 2}
                  cy={bottomY}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#9671EB"
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

                {/* Filled bar */}
                <rect
                  x="0"
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#9671EB"
                />
                <ellipse
                  cx={barWidth / 2}
                  cy={y}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#5D24E1"
                />

                {/* Label below bar */}
                <text
                  x={barWidth / 2}
                  y={bottomY + 35}
                  textAnchor="middle"
                  className="fill-[#5D24E1] font-semibold text-[10px] sm:text-[12px] md:text-[14px]"
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
