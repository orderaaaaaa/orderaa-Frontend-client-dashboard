'use client';
import React, { useEffect, useState } from 'react';
import { distributionData } from '../../constants/DistributionOfApplicationCasesConst';
import { describeArc } from '../../helpers/svgHelpers';

export default function OrdersStatusChart(): JSX.Element {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 60;
    const animate = () => {
      frame++;
      setProgress(Math.min(frame / totalFrames, 1));
      if (frame < totalFrames) requestAnimationFrame(animate);
    };
    animate();
  }, []);

  // 🟣 Only use the first 7 slices for the chart
  const chartData = distributionData.slice(0, 7);
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="font-bold text-lg mb-2 border-b border-gray-200 pb-2">
        توزيع حالات الطلبات{' '}
      </h2>
      <div className="grid 2xl:grid-cols-2 grid-cols-1 items-center justify-center sm:w-[90%] w-full mt-9">
        {/* Legend (all 8 items) */}
        <div className="grid max-2xl:grid-cols-2 justify-center items-center text-right text-gray-800 gap-2 mt-6 md:mt-0 md:mr-8 space-y-2">
          {distributionData.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-[4px]"
                style={{ backgroundColor: d.color }}
              ></span>
              <span className="sm:text-[15px] max-sm:text-[13px] font-medium">
                {d.label} ({d.value})
              </span>
            </div>
          ))}
        </div>

        {/* Chart (only 7 slices) */}
        <svg
          viewBox="0 0 400 400"
          width={300}
          height={300}
          className="drop-shadow-2xl"
        >
          {chartData.map((d, i) => {
            const sliceAngle = (d.value / total) * 360 * progress;
            const endAngle = startAngle + sliceAngle;
            const radius = 180 - i * 8;
            const path = describeArc(200, 200, radius, startAngle, endAngle);
            startAngle += sliceAngle;
            return (
              <path
                key={i}
                d={path}
                fill={d.color}
                className="transition-transform duration-300 hover:scale-105 origin-center"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
