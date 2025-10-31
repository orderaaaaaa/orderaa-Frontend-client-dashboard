'use client';
import React from 'react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const regions = [
  { name: 'القاهرة', percent: 70, value: 200 },
  { name: 'الجيزة', percent: 60, value: 200 },
  { name: 'القليوبية', percent: 60, value: 200 },
  { name: 'الإسكندرية', percent: 60, value: 200 },
  { name: 'الإسماعيلية', percent: 60, value: 200 },
  { name: 'المنوفية', percent: 70, value: 200 },
  { name: 'الدقهلية', percent: 60, value: 200 },
  { name: 'بورسعيد', percent: 60, value: 200 },
  { name: 'السويس', percent: 60, value: 200 },
  { name: 'قنا', percent: 60, value: 200 },
  { name: 'الغربية', percent: 60, value: 200 },
  { name: 'كفر الشيخ', percent: 60, value: 200 },
  { name: 'البحيرة', percent: 60, value: 200 },
  { name: 'المنيا', percent: 60, value: 200 },
  { name: 'مطروح', percent: 60, value: 200 },
  { name: 'شمال سيناء', percent: 60, value: 200 },
  { name: 'جنوب سيناء', percent: 60, value: 200 },
  { name: 'بني سويف', percent: 60, value: 200 },
  { name: 'الفيوم', percent: 60, value: 200 },
  { name: 'أسيوط', percent: 60, value: 200 },
  { name: 'سوهاج', percent: 60, value: 200 },
  { name: 'الشرقية', percent: 60, value: 200 },
  { name: 'دمياط', percent: 60, value: 200 },
  { name: 'أسوان', percent: 60, value: 200 },
  { name: 'الأقصر', percent: 60, value: 200 },
  { name: 'البحر الأحمر', percent: 60, value: 200 },
  { name: 'الوادي الجديد', percent: 60, value: 200 },
];

export default function EgyptMapSection() {
  return (
    <div className="bg-white rounded-2xl  p-6 flex flex-col mt-10 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-right border-b-2 border-purple-600 pb-1 w-fit">
          خريطة مصر
        </h2>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regions List */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-right">
          {regions.map((r, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>{r.percent}%</span>
                <span>{r.value}</span>
                <span className="font-bold">{r.name}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5D24E1] rounded-full"
                  style={{ width: `${r.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        {/* Map */}
        <div className="flex justify-center items-center">
          <img
            src="/Icons/eg.svg"
            width={200}
            height={200}
            alt="خريطة مصر"
            className="w-full max-w-xl !text-red-500" // Change color here
          />
        </div>
      </div>
    </div>
  );
}
