'use client';

import { LiaHourglassHalfSolid } from 'react-icons/lia';

export function Step2Categorize() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 bg-white border border-dashed border-gray-300 rounded-xl text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
        <LiaHourglassHalfSolid className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">
        الخطوة 2: تقسيم المرتجعات
      </h3>
    </div>
  );
}
