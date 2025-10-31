'use client';
import React, { useEffect, useState } from 'react';

type Slice = {
  label: string;
  value: number;
  color: string;
};

// Arabic chart data
const data: Slice[] = [
  { label: 'طلبات جديدة', value: 200, color: '#1B0059' },
  { label: 'تم المحاولة', value: 100, color: '#34069D' },
  { label: 'في انتظار الدفع', value: 50, color: '#4713BF' },
  { label: 'واتساب', value: 40, color: '#5D24E1' },
  { label: 'تاجيلات', value: 20, color: '#7438FF' },
  { label: 'إعادة الاتصال', value: 20, color: '#9365FF' },
  { label: 'وقف التشغيل', value: 30, color: '#D2BEFF' },
  { label: 'تم الغاء', value: 60, color: '#F1EBFF' },
];

// Helpers
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M',
    cx,
    cy,
    'L',
    start.x,
    start.y,
    'A',
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

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
  const chartData = data.slice(0, 7);
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;

  return (
    <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="font-bold text-lg mb-2 border-b border-gray-200 pb-2">
        توزيع حالات الطلبات
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center p-1 w-full max-w-3xl gap-10 mt-9">
        {/* Legend (all 8 items) */}
        <div className="flex flex-col text-right text-gray-800 gap-2 mt-6 md:mt-0 md:mr-8 space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-[4px]"
                style={{ backgroundColor: d.color }}
              ></span>
              <span className="text-[15px] font-medium">
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
