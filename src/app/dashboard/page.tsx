'use client';

import { Suspense } from 'react';
import { DashboardContent } from './components';

function DashboardLoading() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <h1>لوحة التحكم</h1>
      <DashboardContent />
    </Suspense>
  );
}
