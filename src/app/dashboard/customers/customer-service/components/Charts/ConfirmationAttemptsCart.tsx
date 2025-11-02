'use client';

import React from 'react';
import { confirmationAttemptsData } from '../../constants/ConfirmationAttemptsCartConst';

export default function CylinderChartSVG() {
  const maxValue = Math.max(...confirmationAttemptsData.map((d) => d.value));
  const chartHeight = 260;
  const barWidth = 60;
  const spacing = 20;
  const bottomY = chartHeight + 27;

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="font-bold text-lg text-right text-gray-900">
          محاولات تأكيد الطلبات{' '}
        </h2>
      </div>
      <div className="grid grid-cols-2 max-2xl:grid-cols-1 justify-center p-1 w-[80%] max-w-3xl gap-11 mt-9">
        {/* Legend */}
        <div className="w-full  ps-6 text-right">
          <ul className="grid grid-cols-2 2xl:grid-cols-1 gap-4">
            {confirmationAttemptsData.map((d, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="inline-block w-5 h-5 rounded-[5px] shadow"
                  style={{ backgroundColor: d.color }}
                ></span>
                <span className="text-gray-800 text-[15px] font-medium">
                  {d.label}
                </span>
                <span className="text-gray-800/50 text-lg font-semibold">
                  {d.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Chart */}
        <svg
          width={(barWidth + spacing) * confirmationAttemptsData.length}
          height={chartHeight + 80}
          className="overflow-visible"
        >
          {confirmationAttemptsData.map((d, i) => {
            const barHeight = (d.value / 100) * chartHeight;
            const x = i * (barWidth + spacing);
            const y = bottomY - barHeight;
            const fillGradient = `url(#grad-${i})`;

            return (
              <g key={i} transform={`translate(${x}, 0) `}>
                {/* Background cylinder */}
                <ellipse
                  cx={barWidth / 2}
                  cy={bottomY}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#9671eb"
                />
                <rect
                  x="0"
                  y={bottomY - chartHeight}
                  width={barWidth}
                  height={chartHeight}
                  fill="#ECE5FB"
                />
                <ellipse
                  cx={barWidth / 2}
                  cy={bottomY - chartHeight}
                  rx={barWidth / 2}
                  ry={12}
                  fill="#dfd3f9"
                />

                {/* Main cylinder body */}
                <rect
                  x="0"
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={fillGradient}
                />

                {/* Top ellipse (dark cap) */}
                <ellipse
                  cx={barWidth / 2}
                  cy={y}
                  rx={barWidth / 2}
                  ry={12}
                  fill={'#5d24e1'}
                  // opacity="0.9"
                />

                {/* Label below */}
                <text
                  x={barWidth / 2}
                  y={bottomY + 35}
                  textAnchor="middle"
                  className="fill-gray-500 text-sm font-medium"
                >
                  {d.value}
                </text>

                {/* Gradient defs */}
                <defs>
                  <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9671eb" />
                    <stop offset="100%" stopColor="#9671eb" />
                  </linearGradient>
                </defs>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
