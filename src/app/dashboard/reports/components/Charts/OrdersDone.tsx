'use client';
import React, { useEffect, useState } from 'react';
import { ordersDoneBars } from '../../constants/OrdersDoneConst';
import { describeArc } from '../../helpers/svgHelpers';

export default function OrdersAttempted(): JSX.Element {
  const [progress, setProgress] = useState(0);
  const totalDone = ordersDoneBars.reduce((sum, b) => sum + b.current, 0);
  const totalAll = ordersDoneBars.reduce((sum, b) => sum + b.total, 0);

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

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-6">
        <h2 className="font-bold text-lg text-right text-gray-900">
          طلبات تم المحاولة
        </h2>
        <span className="text-primary text-lg font-bold">
          الإجمالي:{' '}
          <span className="text-gray-500/50 text-lg font-semibold">
            {totalDone}
          </span>
        </span>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-5  px-3">
        {/* Pie chart */}
        <div className="relative md:w-1/2 flex flex-col gap-4 justify-center items-center">
          <svg viewBox="0 0 400 400" width={260} height={260}>
            {/* Dark slice - bigger radius */}
            <path
              d={describeArc(
                200,
                200,
                190, // Bigger radius
                0,
                360 * progress * (totalDone / totalAll)
              )}
              fill="#1B0059"
              className="transition-all duration-500"
            />

            {/* Light slice - smaller radius */}
            <defs>
              <linearGradient
                id="notDoneGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#DAD1ED" />
                <stop offset="100%" stopColor="#7849E6" />
              </linearGradient>
            </defs>
            <path
              d={describeArc(
                200,
                200,
                170, // Slightly smaller radius
                360 * progress * (totalDone / totalAll),
                360 * progress
              )}
              fill="url(#notDoneGradient)"
              className="transition-all duration-500"
            />
          </svg>
          <span className="text-primary text-lg font-bold">
            الإجمالي:{' '}
            <span className="text-gray-500/50 text-lg font-semibold">
              {totalDone}
            </span>
          </span>
        </div>
        {/* Progress bars */}
        <div className="flex flex-col w-full md:w-1/2 space-y-5">
          {ordersDoneBars.map((bar, i) => {
            const value = (bar.current / bar.total) * 100 * progress;
            return (
              <div key={i} className="flex items-center justify-end gap-3">
                <span className="text-gray-400 w-8 text-sm text-right">
                  {bar.total}
                </span>
                <div className="relative flex-1 h-2 rounded-full bg-[#EAE6F6] overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary to-[#B39DFF] transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-primary text-sm font-semibold">
                  {bar.current}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
