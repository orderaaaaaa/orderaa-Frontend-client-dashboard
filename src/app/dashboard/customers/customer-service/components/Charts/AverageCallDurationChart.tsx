'use client';

import React from 'react';

const data = [
  { label: 'مؤكد', value: 4 },
  { label: 'مؤجل', value: 12 },
  { label: 'ملفي', value: 8 },
  { label: 'غير ناجحة', value: 9 },
  { label: 'لايوجد رد', value: 6 },
];

export default function AverageCallDurationChart() {
  const maxValue = 16;
  const chartHeight = 260;
  const barWidth = 60;
  const spacing = 30;
  const bottomY = chartHeight + 30;

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="font-bold text-lg text-right text-gray-900">
          متوسط مدة المكالمة
        </h2>
      </div>

      {/* Chart container */}
      <div className="relative">
        <svg
          width={(barWidth + spacing) * data.length + 60}
          height={chartHeight + 100}
          className="overflow-visible"
        >
          {/* Y-axis labels */}
          {[0, 4, 8, 12, 16].map((val, i) => {
            const y = bottomY - (val / maxValue) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1="0"
                  x2={(barWidth + spacing) * data.length}
                  y1={y}
                  y2={y}
                  stroke="#ddd"
                  strokeDasharray="4"
                />
                <text
                  x="-30"
                  y={y + 5}
                  textAnchor="end"
                  className="fill-gray-600 text-sm "
                >
                  {val} دقيقة
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
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

                {/* Main filled part */}
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

                {/* Label below */}
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
    </div>
  );
}
