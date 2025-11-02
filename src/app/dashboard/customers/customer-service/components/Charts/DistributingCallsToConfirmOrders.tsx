'use client';

import React from 'react';
import { callDistributionData } from '../../constants/DistributingCallsToConfirmOrdersConst';

export default function DistributingCallsToConfirmOrders() {
  const maxValue = 60; // 60% max
  const chartHeight = 260;
  const barWidth = 60;
  const spacing = 30;
  const bottomY = chartHeight + 30;

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-3 mb-2 flex justify-between">
        <h2 className="font-bold text-lg text-gray-900 text-right">
          توزيع المكالمات لتأكيد الطلبات
        </h2>
      </div>

      <p className="text-center text-gray-500 mb-6">
        نسبة الطلبات المؤكدة بعد عدد معين من المكالمات
      </p>

      {/* Chart */}
      <svg
        width={(barWidth + spacing) * callDistributionData.length + 40}
        height={chartHeight + 100}
        className="overflow-visible mx-auto block"
      >
        {/* Y-axis lines and labels */}
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
                x="-10"
                y={y + 5}
                textAnchor="end"
                className="fill-gray-600 text-sm"
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

              {/* Filled part */}
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

              {/* Category label */}
              <text
                x={barWidth / 2}
                y={bottomY + 35}
                textAnchor="middle"
                className="fill-[#5D24E1] font-semibold text-[14px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
